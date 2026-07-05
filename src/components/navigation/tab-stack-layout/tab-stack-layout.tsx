import { Stack, type NativeStackNavigationOptions } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar/avatar-sidebar';
import { useAppTheme } from '@/lib/theme';

type TabHeaderOptionsArgs = {
  title: string;
  showAccountMenu?: boolean;
  minimalBackButton?: boolean;
};

export function useTabStackScreenOptions({
  title,
  showAccountMenu = true,
  minimalBackButton = false,
}: TabHeaderOptionsArgs): NativeStackNavigationOptions {
  const {colors} = useAppTheme();

  return useMemo(
    () => ({
      title,
      headerLargeTitle: false,
      headerTransparent: false,
      headerShadowVisible: false,
      headerBackground: undefined,
      headerStyle: {
        backgroundColor: colors.background,
      },
      headerTintColor: colors.tint,
      headerTitleStyle: {
        color: colors.text,
      },
      headerLargeTitleStyle: {
        color: colors.text,
      },
      headerBackVisible: minimalBackButton ? true : undefined,
      headerBackButtonDisplayMode: minimalBackButton ? 'minimal' : undefined,
      headerRight: showAccountMenu
        ? () => (
            <View style={styles.headerActions}>
              <AvatarSidebarButton />
            </View>
          )
        : undefined,
    }),
    [colors.background, colors.text, colors.tint, minimalBackButton, showAccountMenu, title]
  );
}

export function TabStackLayout({title}: {title: string}) {
  const screenOptions = useTabStackScreenOptions({title});

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title,
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
});
