import { Stack } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar';
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
}: TabHeaderOptionsArgs) {
  const {colors} = useAppTheme();

  return {
    title,
    headerLargeTitle: false,
    headerTransparent: Platform.OS === 'ios',
    headerShadowVisible: false,
    headerBackground: () => <View style={[StyleSheet.absoluteFill, styles.transparentHeaderBackground]} />,
    headerStyle: {
      backgroundColor: 'transparent',
    },
    headerTintColor: colors.tint,
    headerTitleStyle: {
      color: colors.text,
    },
    headerLargeTitleStyle: {
      color: colors.text,
    },
    headerBackVisible: minimalBackButton ? true : undefined,
    headerBackButtonDisplayMode:
      Platform.OS === 'ios' && minimalBackButton ? 'minimal' : undefined,
    headerRight: showAccountMenu
      ? () => (
          <View style={styles.headerActions}>
            <AvatarSidebarButton />
          </View>
        )
      : undefined,
  } as const;
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
  transparentHeaderBackground: {
    backgroundColor: 'transparent',
  },
});
