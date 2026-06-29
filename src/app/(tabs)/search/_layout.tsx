import { Stack } from 'expo-router';

import { useAppTheme } from '@/lib/theme';

export default function SearchLayout() {
  const {colors} = useAppTheme();

  return (
    <Stack
      screenOptions={{
        title: 'Search + Add',
        headerShadowVisible: false,
        headerTintColor: colors.tint,
        // headerStyle: {
        //   backgroundColor: colors.card,
        // },
        headerTitleStyle: {
          color: colors.text,
        },
      }}
    />
  );
}
