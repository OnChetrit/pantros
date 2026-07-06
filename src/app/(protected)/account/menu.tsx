import { Stack } from 'expo-router';

import { AccountMenuContent } from '@/components/navigation/account-menu-content/account-menu-content';

export default function AccountMenuRoute() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Account',
        }}
      />
      <AccountMenuContent />
    </>
  );
}
