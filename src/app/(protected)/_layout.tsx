import { Redirect, Stack } from 'expo-router';

import { createDetailStackOptions, useBaseStackOptions } from '@/components/navigation/stack-options';
import { useAuthState } from '@/state/auth-state';
import { useWorkspaceState } from '@/state/workspace-state';

export default function ProtectedLayout() {
  const auth = useAuthState();
  const workspace = useWorkspaceState();
  const screenOptions = useBaseStackOptions();
  const isLoading = auth.status === 'loading' || workspace.status === 'loading';

  if (isLoading) {
    return null;
  }

  if (!auth.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen name="profile" options={createDetailStackOptions('Profile')} />
      <Stack.Screen name="settings" options={createDetailStackOptions('Settings')} />
      <Stack.Screen name="notifications" options={createDetailStackOptions('Notifications')} />
      <Stack.Screen name="account" options={{headerShown: false}} />
      <Stack.Screen name="legal" options={{headerShown: false}} />
    </Stack>
  );
}
