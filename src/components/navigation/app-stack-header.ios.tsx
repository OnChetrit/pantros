import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar';
import { useAppTheme } from '@/lib/theme';

export function AppStackHeader({
  title,
  largeTitle = false,
  leadingAction,
  transparentBlur = false,
  showAccountMenu = true,
  minimalBackButton = false,
}: {
  title: string;
  largeTitle?: boolean;
  leadingAction?: ReactNode;
  transparentBlur?: boolean;
  showAccountMenu?: boolean;
  minimalBackButton?: boolean;
}) {
  const {colors, isDark} = useAppTheme();

  return (
    <Stack.Screen
      options={{
        title,
        headerLargeTitle: largeTitle,
        headerTransparent: transparentBlur,
        headerShadowVisible: false,
        headerBlurEffect: transparentBlur
          ? isDark
            ? 'systemChromeMaterialDark'
            : 'systemChromeMaterialLight'
          : undefined,
        headerBackground: transparentBlur ? () => <View style={StyleSheet.absoluteFill} /> : undefined,
        headerStyle: {
          backgroundColor: transparentBlur ? 'transparent' : colors.background,
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
        headerRight:
          showAccountMenu || leadingAction
            ? () => (
                <View style={styles.headerActions}>
                  {leadingAction}
                  {showAccountMenu ? <AvatarSidebarButton /> : null}
                </View>
              )
            : undefined,
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
});
