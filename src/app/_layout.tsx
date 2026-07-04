import 'expo-dev-client';

import { ThemePreferenceProvider } from '@/lib/theme';

import { RootLayoutContent } from './root-layout-content';

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutContent />
    </ThemePreferenceProvider>
  );
}
