import { Stack, useRouter } from 'expo-router';

import { AccountMenuContent } from '@/components/navigation/account-menu-content/account-menu-content';

export default function AccountMenuRoute() {
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account',
          headerBackVisible: false,
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button icon="xmark" onPress={() => router.back()} />
      </Stack.Toolbar>
      <AccountMenuContent />
    </>
  );
}
