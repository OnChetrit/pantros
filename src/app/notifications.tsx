import { Redirect } from 'expo-router';

import { useAppContext } from '@/state/app-context';

export default function NotificationsScreen() {
  const { isAuthenticated, status } = useAppContext();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <Redirect href="/settings" />;
}
