import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { AccountDeletionDecision } from '@/domain/models';
import { deleteCurrentAccount } from '@/services/supabase/account-service';

import { useAuthState } from './auth-state';
import { useNotificationState } from './notification-state';

type AccountStateContextValue = {
  accountDeletionBusy: boolean;
  errorMessage: string | null;
  deleteAccount: (decisions: AccountDeletionDecision[]) => Promise<void>;
};

const AccountStateContext = createContext<AccountStateContextValue | undefined>(undefined);

export function AccountStateProvider({children}: PropsWithChildren) {
  const {signOut} = useAuthState();
  const {clearNotificationState} = useNotificationState();
  const [accountDeletionBusy, setAccountDeletionBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteAccount = useCallback(async (decisions: AccountDeletionDecision[]) => {
    setAccountDeletionBusy(true);
    setErrorMessage(null);

    try {
      await deleteCurrentAccount(decisions);
      await clearNotificationState();
      await signOut();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete your account.';
      setErrorMessage(message);
      throw error;
    } finally {
      setAccountDeletionBusy(false);
    }
  }, [clearNotificationState, signOut]);

  const value = useMemo<AccountStateContextValue>(
    () => ({
      accountDeletionBusy,
      errorMessage,
      deleteAccount,
    }),
    [accountDeletionBusy, deleteAccount, errorMessage]
  );

  return <AccountStateContext.Provider value={value}>{children}</AccountStateContext.Provider>;
}

export function useAccountState() {
  const value = useContext(AccountStateContext);

  if (!value) {
    throw new Error('useAccountState must be used inside AccountStateProvider');
  }

  return value;
}
