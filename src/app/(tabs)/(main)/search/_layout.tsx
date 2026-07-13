import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { AndroidAvatarSidebarButton } from '@/components/navigation/android-avatar-sidebar-button/android-avatar-sidebar-button';
import { useAppTheme } from '@/lib/theme';

export default function SearchLayout() {
  const {colors} = useAppTheme();

  return (
    <Stack
      screenOptions={{
        title: 'Explore',
        headerLargeTitle: Platform.OS === 'ios',
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
        },
        headerTintColor: colors.tint,
        headerTitleStyle: {color: colors.text},
        headerLargeTitleStyle: {color: colors.text},
        headerRight: Platform.OS === 'ios' ? undefined : () => <AndroidAvatarSidebarButton />,
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Explore',
        }}
      />
    </Stack>
  );
}
