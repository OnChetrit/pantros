import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, StyleSheet, View } from 'react-native';

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
        headerLargeTitle: Platform.OS === 'ios' ? largeTitle : false,
        headerTransparent: Platform.OS === 'ios' ? transparentBlur : false,
        headerShadowVisible: false,
        headerBlurEffect:
          Platform.OS === 'ios' && transparentBlur
            ? isDark
              ? 'systemChromeMaterialDark'
              : 'systemChromeMaterialLight'
            : undefined,
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
        headerBackButtonDisplayMode: Platform.OS === 'ios' && minimalBackButton ? 'minimal' : undefined,
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
