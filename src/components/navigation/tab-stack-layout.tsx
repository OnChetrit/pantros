import { Stack, useRouter } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar';
import { HeaderAddButton } from '@/components/navigation/header-add-button';
import { useAppTheme } from '@/lib/theme';

export function TabStackLayout({title}: {title: string}) {
  const router = useRouter();
  const {colors} = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerLargeTitle: false,
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: false,
        headerBackground: () => <View style={[StyleSheet.absoluteFill, styles.transparentHeaderBackground]} />,
        headerTintColor: colors.tint,
        headerTitleStyle: {
          color: colors.text,
        },
        headerLargeTitleStyle: {
          color: colors.text,
        },
        headerRight: () => (
          <View style={styles.headerActions}>
            <HeaderAddButton onPress={() => router.push('/items/new')} />
            <AvatarSidebarButton />
          </View>
        ),
      }}
    >
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
    gap: 10,
    backgroundColor: 'transparent',
  },
  transparentHeaderBackground: {
    backgroundColor: 'transparent',
  },
});
