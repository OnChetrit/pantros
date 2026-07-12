import { Redirect, Stack } from 'expo-router';

import { useAppTheme } from '@/lib/theme';
import { useAuthState } from '@/state/auth-state';
import { useWorkspaceState } from '@/state/workspace-state';

export default function ProtectedLayout() {
  const auth = useAuthState();
  const workspace = useWorkspaceState();
  const {colors} = useAppTheme();
  const isLoading = auth.status === 'loading' || workspace.status === 'loading';

  if (isLoading) {
    return null;
  }

  if (!auth.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack
      screenOptions={{
        contentStyle: {backgroundColor: colors.background},
        headerShadowVisible: false,
        headerStyle: {backgroundColor: colors.background},
        headerTintColor: colors.tint,
        headerTitleStyle: {color: colors.text},
        headerLargeTitleStyle: {color: colors.text},
      }}
    >
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="settings"
        options={{
          title: 'Settings',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="notifications"
        options={{
          title: 'Notifications',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="account/menu"
        options={{
          title: 'Account',
          // presentation: Platform.OS === 'ios' ? 'modal' : 'card',
          // animation: Platform.OS === 'ios' ? 'slide_from_bottom' : 'default',
        }}
      />
      <Stack.Screen
        name="account/delete"
        options={{
          title: 'Delete Account',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="account/privacy"
        options={{
          title: 'Privacy Policy',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="account/terms"
        options={{
          title: 'Terms of Service',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen
        name="account/support"
        options={{
          title: 'Support',
          headerLargeTitle: false,
          headerBackVisible: true,
          headerBackButtonDisplayMode: 'minimal',
        }}
      />
      <Stack.Screen name="legal" options={{headerShown: false}} />
    </Stack>
  );
}
