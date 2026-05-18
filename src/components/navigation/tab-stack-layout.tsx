import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar';
import { useAppTheme } from '@/lib/theme';

export function TabStackLayout({title}: {title: string}) {
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
    backgroundColor: 'transparent',
  },
  transparentHeaderBackground: {
    backgroundColor: 'transparent',
  },
});
