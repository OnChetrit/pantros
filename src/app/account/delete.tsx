import { Redirect } from 'expo-router';

import { AppStackHeader } from '@/components/navigation/app-stack-header';
import { DeleteAccountContent } from '@/components/account/delete-account-content';
import { useAppContext } from '@/state/app-context';

export default function DeleteAccountScreen() {
  const { isAuthenticated, status } = useAppContext();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <>
      <AppStackHeader
        title="Delete Account"
        showAccountMenu={false}
        minimalBackButton
      />
      <DeleteAccountContent />
    </>
  );
}
