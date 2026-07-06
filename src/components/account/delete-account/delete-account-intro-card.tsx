import { Host, RNHostView, Row } from '@expo/ui';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AppButton, SectionCard, appColors } from '@/components/ui/primitives';
import type { AccountDeletionPreview } from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';

type DeleteAccountIntroCardProps = {
  loading: boolean;
  errorMessage: string | null;
  preview: AccountDeletionPreview | null;
  providerLabel: string | null;
  providerCleanupMessage: string | null;
  onRetry: () => void;
};

export function DeleteAccountIntroCard({
  loading,
  errorMessage,
  preview,
  providerLabel,
  providerCleanupMessage,
  onRetry,
}: DeleteAccountIntroCardProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <SectionCard
      title="This action is permanent"
      subtitle="Your profile, notification settings, push tokens, and pantry memberships will be removed. This cannot be undone."
    >
      {loading ? (
        <Host style={styles.loadingRow} matchContents>
          <Row alignment="center" spacing={12}>
            <RNHostView matchContents>
              <ActivityIndicator color={appColors.tint} />
            </RNHostView>
            <RNHostView matchContents>
              <Text style={styles.mutedText}>Loading your pantry ownership...</Text>
            </RNHostView>
          </Row>
        </Host>
      ) : errorMessage && !preview ? (
        <>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <AppButton label="Try Again" onPress={onRetry} variant="secondary" />
        </>
      ) : preview ? (
        <View style={styles.infoGroup}>
          <Text style={styles.mutedText}>
            You will leave {preview.joinedPantryCount}{' '}
            {preview.joinedPantryCount === 1 ? 'shared pantry' : 'shared pantries'}.
          </Text>
          {providerLabel ? (
            <Text style={styles.mutedText}>
              If your {providerLabel} session is no longer recent, sign in again before retrying account deletion.
            </Text>
          ) : null}
          {providerCleanupMessage ? <Text style={styles.warningText}>{providerCleanupMessage}</Text> : null}
        </View>
      ) : null}
    </SectionCard>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    loadingRow: {
      minHeight: 48,
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
  });
