import { Stack } from 'expo-router';

import { createDetailStackOptions } from '@/app/stack-options';

export default function ProtectedLegalLayout() {
  return (
    <Stack>
      <Stack.Screen name="privacy" options={createDetailStackOptions('Privacy Policy')} />
      <Stack.Screen name="terms" options={createDetailStackOptions('Terms of Service')} />
      <Stack.Screen name="support" options={createDetailStackOptions('Support')} />
    </Stack>
  );
}
