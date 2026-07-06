import { Host, RNHostView, Row } from '@expo/ui';
import { Stack, useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { createIconHeaderButton } from '@/components/navigation/native-header-items/native-header-items';
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
  const canUseNativeRightItems = !leadingAction;

  return (
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
        unstable_headerRightItems:
          canUseNativeRightItems && showAccountMenu
            ? () => [
                createIconHeaderButton({
                  label: 'Open account menu',
                  icon: 'person.crop.circle',
                  onPress: () => router.push('/account/menu'),
                  tintColor: colors.tint,
                }),
              ]
            : undefined,
        headerRight:
          !canUseNativeRightItems && (showAccountMenu || leadingAction)
            ? () => (
                <Host style={styles.headerActions} matchContents>
                  <Row alignment="center" spacing={10}>
                    {leadingAction ? (
                      <RNHostView matchContents>
                        <View>{leadingAction}</View>
                      </RNHostView>
                    ) : null}
                  </Row>
                </Host>
              )
            : undefined,
      }}
    />
  );
}

const styles = StyleSheet.create({
  headerActions: {
  },
});
