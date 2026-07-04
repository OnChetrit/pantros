import { Stack, type NativeStackNavigationOptions } from 'expo-router';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { useMemo } from 'react';

import { createIconHeaderButton } from '@/components/navigation/native-header-items';
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
}: TabHeaderOptionsArgs): NativeStackNavigationOptions {
  const {colors} = useAppTheme();
  const router = useRouter();

  return useMemo(
    () => ({
      title,
      headerLargeTitle: false,
      headerTransparent: true,
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
      headerBackButtonDisplayMode: minimalBackButton ? 'minimal' : undefined,
      unstable_headerRightItems: showAccountMenu
        ? () => [
            createIconHeaderButton({
              label: 'Open account menu',
              icon: 'person.crop.circle',
              onPress: () => router.push('/account/menu'),
              tintColor: colors.tint,
            }),
          ]
        : undefined,
    }),
    [colors.text, colors.tint, minimalBackButton, router, showAccountMenu, title]
  );
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
  transparentHeaderBackground: {
    backgroundColor: 'transparent',
  },
});
