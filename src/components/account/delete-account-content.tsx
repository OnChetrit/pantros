import { Picker } from '@react-native-picker/picker';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Pressable,
  View,
} from 'react-native';

import {
  AppButton,
  AppScreen,
  SectionCard,
  appColors,
} from '@/components/ui/primitives';
import type {
  AccountDeletionDecision,
  AccountDeletionPreview,
} from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';
import { fetchAccountDeletionPreview } from '@/services/supabase/account-service';
import { useAppContext } from '@/state/app-context';

type DecisionMap = Record<string, AccountDeletionDecision>;

function createDefaultDecisions(
  preview: AccountDeletionPreview
): DecisionMap {
  return Object.fromEntries(
    preview.pantries.map((pantry) => {
      const nextOwner = pantry.members[0];

      return [
        pantry.id,
        nextOwner
          ? {
              pantryId: pantry.id,
              action: 'transfer',
              transferToUserId: nextOwner.userId,
            }
          : {
              pantryId: pantry.id,
              action: 'delete',
              transferToUserId: null,
            },
      ];
    })
  );
}

export function DeleteAccountContent() {
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const {
    accountDeletionBusy,
    deleteAccount,
    isAuthenticated,
    status,
  } = useAppContext();
  const [preview, setPreview] = useState<AccountDeletionPreview | null>(null);
  const [decisions, setDecisions] = useState<DecisionMap>({});
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const providerLabel = useMemo(() => {
    const providers = preview?.providers ?? [];

    if (providers.includes('apple')) {
      return 'Apple';
    }

    if (providers.includes('google')) {
      return 'Google';
    }

    if (providers.includes('email')) {
      return 'email and password';
    }

    return null;
  }, [preview?.providers]);

  const providerCleanupMessage = useMemo(() => {
    const providers = preview?.providers ?? [];

    if (providers.includes('apple')) {
      return 'Deleting your Pantros account does not automatically remove Pantros from Sign in with Apple. After deletion, remove Pantros from your Apple account settings if you do not want that authorization to remain listed there.';
    }

    if (providers.includes('google')) {
      return 'Deleting your Pantros account does not automatically revoke Pantros access from your Google account. After deletion, remove Pantros from your Google connected apps settings if you do not want that authorization to remain there.';
    }

    return null;
  }, [preview?.providers]);

  const loadPreview = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      const nextPreview = await fetchAccountDeletionPreview();
      setPreview(nextPreview);
      setDecisions(createDefaultDecisions(nextPreview));
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to load account deletion details.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated || status === 'idle' || status === 'loading') {
      return;
    }

    void loadPreview();
  }, [isAuthenticated, status]);

  const allPantriesResolved = useMemo(() => {
    if (!preview) {
      return false;
    }

    return preview.pantries.every((pantry) => {
      const decision = decisions[pantry.id];

      if (!decision) {
        return false;
      }

      if (decision.action === 'delete') {
        return true;
      }

      return pantry.members.some(
        (member) => member.userId === decision.transferToUserId
      );
    });
  }, [decisions, preview]);

  const handleDeleteAccount = async () => {
    if (!preview || confirmation !== 'DELETE' || !allPantriesResolved) {
      return;
    }

    setErrorMessage(null);

    try {
      await deleteAccount(
        preview.pantries.map((pantry) => decisions[pantry.id])
      );
      router.replace('/(auth)/login');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Unable to delete your account.'
      );
    }
  };

  if (!isAuthenticated || status === 'idle' || status === 'loading') {
    return null;
  }

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.scrollContent}
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
    >
      <AppScreen>
        <SectionCard
          title="This action is permanent"
          subtitle="Your profile, notification settings, push tokens, and pantry memberships will be removed. This cannot be undone."
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator color={appColors.tint} />
              <Text style={styles.mutedText}>Loading your pantry ownership...</Text>
            </View>
          ) : errorMessage && !preview ? (
            <>
              <Text style={styles.errorText}>{errorMessage}</Text>
              <AppButton
                label="Try Again"
                onPress={() => void loadPreview()}
                variant="secondary"
              />
            </>
          ) : preview ? (
            <View style={styles.infoGroup}>
              <Text style={styles.mutedText}>
                You will leave {preview.joinedPantryCount}{' '}
                {preview.joinedPantryCount === 1 ? 'shared pantry' : 'shared pantries'}.
              </Text>
              {providerLabel ? (
                <Text style={styles.mutedText}>
                  If your {providerLabel} session is no longer recent, sign in again
                  before retrying account deletion.
                </Text>
              ) : null}
              {providerCleanupMessage ? (
                <Text style={styles.warningText}>{providerCleanupMessage}</Text>
              ) : null}
            </View>
          ) : null}
        </SectionCard>

        {preview?.pantries.map((pantry) => {
          const decision = decisions[pantry.id];
          const canTransfer = pantry.members.length > 0;
          const isDeleting = decision?.action === 'delete';

          return (
            <SectionCard
              key={pantry.id}
              title={pantry.name}
              subtitle={
                canTransfer
                  ? `${pantry.members.length} eligible ${
                      pantry.members.length === 1 ? 'member' : 'members'
                    } can receive ownership.`
                  : 'This pantry has no other members and must be deleted.'
              }
            >
              {canTransfer ? (
                <View style={styles.choiceGroup}>
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: !isDeleting }}
                    onPress={() => {
                      const nextOwner = pantry.members[0];

                      setDecisions((current) => ({
                        ...current,
                        [pantry.id]: {
                          pantryId: pantry.id,
                          action: 'transfer',
                          transferToUserId: nextOwner.userId,
                        },
                      }));
                    }}
                    style={[
                      styles.choice,
                      !isDeleting ? styles.choiceSelected : null,
                    ]}
                  >
                    <Text style={styles.choiceTitle}>
                      Transfer ownership and exit
                    </Text>
                    <Text style={styles.choiceDescription}>
                      Recommended. The pantry and its data remain available to
                      the other members.
                    </Text>
                  </Pressable>

                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ checked: isDeleting }}
                    onPress={() => {
                      setDecisions((current) => ({
                        ...current,
                        [pantry.id]: {
                          pantryId: pantry.id,
                          action: 'delete',
                          transferToUserId: null,
                        },
                      }));
                    }}
                    style={[
                      styles.choice,
                      styles.deleteChoice,
                      isDeleting ? styles.deleteChoiceSelected : null,
                    ]}
                  >
                    <Text style={[styles.choiceTitle, styles.dangerText]}>
                      Delete pantry for everyone
                    </Text>
                    <Text style={styles.choiceDescription}>
                      Permanently removes its items, carts, settings, and all
                      member access.
                    </Text>
                  </Pressable>

                  {!isDeleting && decision?.action === 'transfer' ? (
                    <View style={styles.pickerField}>
                      <Picker
                        selectedValue={decision.transferToUserId}
                        onValueChange={(userId) => {
                          if (typeof userId !== 'string') {
                            return;
                          }

                          setDecisions((current) => ({
                            ...current,
                            [pantry.id]: {
                              pantryId: pantry.id,
                              action: 'transfer',
                              transferToUserId: userId,
                            },
                          }));
                        }}
                        style={styles.picker}
                        itemStyle={styles.pickerItem}
                      >
                        {pantry.members.map((member) => (
                          <Picker.Item
                            key={member.userId}
                            label={
                              member.email
                                ? `${member.name} - ${member.email}`
                                : member.name
                            }
                            value={member.userId}
                          />
                        ))}
                      </Picker>
                    </View>
                  ) : null}
                </View>
              ) : (
                <View style={styles.singleMemberWarning}>
                  <Text style={[styles.choiceTitle, styles.dangerText]}>
                    Pantry will be deleted
                  </Text>
                  <Text style={styles.choiceDescription}>
                    There is no member who can receive ownership.
                  </Text>
                </View>
              )}
            </SectionCard>
          );
        })}

        {preview ? (
          <SectionCard
            title="Confirm account deletion"
            subtitle='Type "DELETE" exactly to enable permanent account deletion.'
          >
            <TextInput
              value={confirmation}
              onChangeText={setConfirmation}
              placeholder="DELETE"
              placeholderTextColor={appColors.muted}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!accountDeletionBusy}
              style={styles.confirmationInput}
            />

            {errorMessage ? (
              <Text style={styles.errorText}>{errorMessage}</Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={
                accountDeletionBusy ||
                confirmation !== 'DELETE' ||
                !allPantriesResolved
              }
              onPress={() => void handleDeleteAccount()}
              style={({ pressed }) => [
                styles.deleteButton,
                pressed ? styles.deleteButtonPressed : null,
                accountDeletionBusy ||
                confirmation !== 'DELETE' ||
                !allPantriesResolved
                  ? styles.deleteButtonDisabled
                  : null,
              ]}
            >
              {accountDeletionBusy ? (
                <ActivityIndicator color={appColors.textInverse} />
              ) : (
                <Text style={styles.deleteButtonText}>
                  Permanently Delete Account
                </Text>
              )}
            </Pressable>
          </SectionCard>
        ) : null}
      </AppScreen>
    </ScrollView>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  loadingRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoGroup: {
    gap: 8,
  },
  mutedText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21,
  },
  errorText: {
    color: colors.danger,
    fontSize: 14,
    lineHeight: 21,
  },
  warningText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
  },
  choiceGroup: {
    gap: 12,
  },
  choice: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    padding: 14,
    gap: 5,
  },
  choiceSelected: {
    borderColor: colors.tint,
    backgroundColor: colors.tintSoft,
  },
  deleteChoice: {
    borderColor: colors.dangerSoft,
  },
  deleteChoiceSelected: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  choiceTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  choiceDescription: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  dangerText: {
    color: colors.danger,
  },
  singleMemberWarning: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
    padding: 14,
    gap: 5,
  },
  pickerField: {
    minHeight: 54,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  picker: {
    color: colors.text,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: colors.text,
    fontSize: 15,
  },
  confirmationInput: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    color: colors.text,
    paddingHorizontal: 16,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  deleteButton: {
    minHeight: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: colors.danger,
  },
  deleteButtonPressed: {
    opacity: 0.78,
  },
  deleteButtonDisabled: {
    opacity: 0.45,
  },
  deleteButtonText: {
    color: colors.textInverse,
    fontSize: 15,
    fontWeight: '800',
  },
});
