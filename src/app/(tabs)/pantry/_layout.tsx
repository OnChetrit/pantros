import { Stack, useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar/avatar-sidebar';
import { createIconHeaderButton } from '@/components/navigation/native-header-items/native-header-items';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function PantryLayout() {
  const {selectedPantry} = useAppContext();
  const {colors} = useAppTheme();
  const router = useRouter();

  return (
    <Stack
      screenOptions={{
        title: selectedPantry?.name ?? 'Pantry',
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
                <View style={styles.headerActions}>
                  <AvatarSidebarButton />
                </View>
              ),
            }),
      }}
    >
      <Stack.Screen
        name="index"
        options={{
          title: selectedPantry?.name ?? 'Pantry',
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
  transparentHeaderBackground: {
    backgroundColor: 'transparent',
  },
});
