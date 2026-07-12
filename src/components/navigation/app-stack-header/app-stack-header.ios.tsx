import { Stack, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

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
  const {colors} = useAppTheme();
  const router = useRouter();

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerLargeTitle: largeTitle,
          headerTransparent: transparentBlur,
          headerShadowVisible: false,
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
          headerRight: undefined,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.View hidden={!leadingAction}>
          <View style={styles.leadingWrap}>{leadingAction}</View>
        </Stack.Toolbar.View>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="person.crop.circle" onPress={() => router.push('/account/menu')} hidden={!showAccountMenu} />
      </Stack.Toolbar>
    </>
  );
}

const styles = StyleSheet.create({
  leadingWrap: {
    minWidth: 32,
    minHeight: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
