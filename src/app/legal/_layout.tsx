import { Stack } from 'expo-router';

export default function LegalLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="privacy"
        options={{title: 'Privacy Policy', headerLargeTitle: false, headerBackVisible: true, headerBackButtonDisplayMode: 'minimal'}}
      />
      <Stack.Screen
        name="terms"
        options={{title: 'Terms of Service', headerLargeTitle: false, headerBackVisible: true, headerBackButtonDisplayMode: 'minimal'}}
      />
      <Stack.Screen
        name="support"
        options={{title: 'Support', headerLargeTitle: false, headerBackVisible: true, headerBackButtonDisplayMode: 'minimal'}}
      />
    </Stack>
  );
}
