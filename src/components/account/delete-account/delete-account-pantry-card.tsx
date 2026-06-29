import { Picker } from '@react-native-picker/picker';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { SectionCard } from '@/components/ui/primitives';
import type { AccountDeletionPantry } from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';

import type { DecisionMap } from './delete-account.utils';

type DeleteAccountPantryCardProps = {
  pantry: AccountDeletionPantry;
  decisions: DecisionMap;
  onChangeDecision: (pantryId: string, nextDecision: DecisionMap[string]) => void;
};

export function DeleteAccountPantryCard({
  pantry,
  decisions,
  onChangeDecision,
}: DeleteAccountPantryCardProps) {
  const styles = useThemedStyles(createStyles);
  const decision = decisions[pantry.id];
  const canTransfer = pantry.members.length > 0;
  const isDeleting = decision?.action === 'delete';

  return (
    <SectionCard
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

              onChangeDecision(pantry.id, {
                pantryId: pantry.id,
                action: 'transfer',
                transferToUserId: nextOwner.userId,
              });
            }}
            style={[styles.choice, !isDeleting ? styles.choiceSelected : null]}
          >
            <Text style={styles.choiceTitle}>Transfer ownership and exit</Text>
            <Text style={styles.choiceDescription}>
              Recommended. The pantry and its data remain available to the other members.
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ checked: isDeleting }}
            onPress={() => {
              onChangeDecision(pantry.id, {
                pantryId: pantry.id,
                action: 'delete',
                transferToUserId: null,
              });
            }}
            style={[
              styles.choice,
              styles.deleteChoice,
              isDeleting ? styles.deleteChoiceSelected : null,
            ]}
          >
            <Text style={[styles.choiceTitle, styles.dangerText]}>Delete pantry for everyone</Text>
            <Text style={styles.choiceDescription}>
              Permanently removes its items, carts, settings, and all member access.
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

                  onChangeDecision(pantry.id, {
                    pantryId: pantry.id,
                    action: 'transfer',
                    transferToUserId: userId,
                  });
                }}
                style={styles.picker}
                itemStyle={styles.pickerItem}
              >
                {pantry.members.map((member) => (
                  <Picker.Item
                    key={member.userId}
                    label={member.email ? `${member.name} - ${member.email}` : member.name}
                    value={member.userId}
                  />
                ))}
              </Picker>
            </View>
          ) : null}
        </View>
      ) : (
        <View style={styles.singleMemberWarning}>
          <Text style={[styles.choiceTitle, styles.dangerText]}>Pantry will be deleted</Text>
          <Text style={styles.choiceDescription}>There is no member who can receive ownership.</Text>
        </View>
      )}
    </SectionCard>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
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
  });
