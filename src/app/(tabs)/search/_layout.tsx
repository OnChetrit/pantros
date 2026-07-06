import { Host, RNHostView, Row } from '@expo/ui';
import { Stack, useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar/avatar-sidebar';
import { createIconHeaderButton } from '@/components/navigation/native-header-items/native-header-items';
import { useAppTheme } from '@/lib/theme';

export default function SearchLayout() {
  const {colors} = useAppTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        title: 'Search + Add',
        headerLargeTitle: false,
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: false,
        headerBackground:
          Platform.OS === 'ios'
            ? () => <View style={[StyleSheet.absoluteFill, styles.transparentHeaderBackground]} />
            : undefined,
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
        },
        headerTintColor: colors.tint,
        headerTitleStyle: {
          color: colors.text,
        },
        headerLargeTitleStyle: {
          color: colors.text,
        },
        ...(Platform.OS === 'ios'
          ? {
              unstable_headerRightItems: () => [
                createIconHeaderButton({
                  label: 'Open account menu',
                  icon: 'person.crop.circle',
                  onPress: () => router.push('/account/menu'),
                  tintColor: colors.tint,
                }),
              ],
            }
          : {
              headerRight: () => (
                <Host style={styles.headerActions} matchContents>
                  <Row alignment="center">
                    <RNHostView matchContents>
                      <AvatarSidebarButton />
                    </RNHostView>
                  </Row>
                </Host>
              ),
            }),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: 'Search + Add',
        }}
      />
    </Stack>
  );
}

const styles = StyleSheet.create({
  headerActions: {
    backgroundColor: 'transparent',
  },
  transparentHeaderBackground: {
    backgroundColor: 'transparent',
  },
});
