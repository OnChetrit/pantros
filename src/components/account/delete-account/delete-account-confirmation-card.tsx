import { ActivityIndicator, StyleSheet, Text, TextInput, Pressable } from 'react-native';

import { SectionCard, appColors } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

type DeleteAccountConfirmationCardProps = {
  confirmation: string;
  errorMessage: string | null;
  allPantriesResolved: boolean;
  accountDeletionBusy: boolean;
  onChangeConfirmation: (value: string) => void;
  onDeleteAccount: () => void;
};

export function DeleteAccountConfirmationCard({
  confirmation,
  errorMessage,
  allPantriesResolved,
  accountDeletionBusy,
  onChangeConfirmation,
  onDeleteAccount,
}: DeleteAccountConfirmationCardProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <SectionCard
      title="Confirm account deletion"
      subtitle='Type "DELETE" exactly to enable permanent account deletion.'
    >
      <TextInput
        value={confirmation}
        onChangeText={onChangeConfirmation}
        placeholder="DELETE"
        placeholderTextColor={appColors.muted}
        autoCapitalize="characters"
        autoCorrect={false}
        editable={!accountDeletionBusy}
        style={styles.confirmationInput}
      />

      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

      <Pressable
        accessibilityRole="button"
        disabled={accountDeletionBusy || confirmation !== 'DELETE' || !allPantriesResolved}
        onPress={onDeleteAccount}
        style={({ pressed }) => [
          styles.deleteButton,
          pressed ? styles.deleteButtonPressed : null,
          accountDeletionBusy || confirmation !== 'DELETE' || !allPantriesResolved
            ? styles.deleteButtonDisabled
            : null,
        ]}
      >
        {accountDeletionBusy ? (
          <ActivityIndicator color={appColors.textInverse} />
        ) : (
          <Text style={styles.deleteButtonText}>Permanently Delete Account</Text>
        )}
      </Pressable>
    </SectionCard>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    errorText: {
      color: colors.danger,
      fontSize: 14,
      lineHeight: 21,
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
