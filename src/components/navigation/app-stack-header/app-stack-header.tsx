import { Host, RNHostView, Row } from '@expo/ui';
import { Stack } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar/avatar-sidebar';
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

  return (
    <Stack.Screen
      options={{
        title,
        headerLargeTitle: false,
        headerTransparent: false,
        headerShadowVisible: false,
        headerBlurEffect: undefined,
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
        headerBackButtonDisplayMode: undefined,
        headerRight:
          showAccountMenu || leadingAction
            ? () => (
                <Host style={styles.headerActions} matchContents>
                  <Row alignment="center" spacing={10}>
                    {leadingAction ? (
                      <RNHostView matchContents>
                        <View>{leadingAction}</View>
                      </RNHostView>
                    ) : null}
                    {showAccountMenu ? (
                      <RNHostView matchContents>
                        <AvatarSidebarButton />
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
