import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { AppScreen } from '@/components/ui/primitives';
import type { AccountDeletionPreview } from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';
import { fetchAccountDeletionPreview } from '@/services/supabase/account-service';
import { useAppContext } from '@/state/app-context';
import { DeleteAccountConfirmationCard } from './delete-account/delete-account-confirmation-card';
import { DeleteAccountIntroCard } from './delete-account/delete-account-intro-card';
import { DeleteAccountPantryCard } from './delete-account/delete-account-pantry-card';
import {
  areAllPantriesResolved,
  createDefaultDecisions,
  getProviderCleanupMessage,
  getProviderLabel,
  type DecisionMap,
} from './delete-account/delete-account.utils';

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
    return getProviderLabel(preview?.providers ?? []);
  }, [preview?.providers]);

  const providerCleanupMessage = useMemo(() => {
    return getProviderCleanupMessage(preview?.providers ?? []);
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

    const timeout = setTimeout(() => {
      void loadPreview();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAuthenticated, status]);

  const allPantriesResolved = useMemo(() => {
    return areAllPantriesResolved(preview, decisions);
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
        <DeleteAccountIntroCard
          loading={loading}
          errorMessage={errorMessage}
          preview={preview}
          providerLabel={providerLabel}
          providerCleanupMessage={providerCleanupMessage}
          onRetry={() => void loadPreview()}
        />

        {preview?.pantries.map((pantry) => {
          return (
            <DeleteAccountPantryCard
              key={pantry.id}
              pantry={pantry}
              decisions={decisions}
              onChangeDecision={(pantryId, nextDecision) => {
                setDecisions((current) => ({
                  ...current,
                  [pantryId]: nextDecision,
                }));
              }}
            />
          );
        })}

        {preview ? (
          <DeleteAccountConfirmationCard
            confirmation={confirmation}
            errorMessage={errorMessage}
            allPantriesResolved={allPantriesResolved}
            accountDeletionBusy={accountDeletionBusy}
            onChangeConfirmation={setConfirmation}
            onDeleteAccount={() => void handleDeleteAccount()}
          />
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
});
