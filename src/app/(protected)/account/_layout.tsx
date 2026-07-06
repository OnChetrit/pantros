import { Stack } from 'expo-router';

import { createDetailStackOptions } from '@/app/stack-options';

export default function ProtectedAccountLayout() {
  return (
    <Stack>
      <Stack.Screen name="menu" options={{title: 'Account'}} />
      <Stack.Screen name="delete" options={createDetailStackOptions('Delete Account')} />
    </Stack>
  );
}
