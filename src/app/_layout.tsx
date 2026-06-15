import 'expo-dev-client';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppTheme } from '@/lib/theme';
import { AppProvider } from '@/state/app-context';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const { colors, isDark } = useAppTheme();
  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        primary: colors.tint,
        background: colors.background,
        card: colors.card,
        text: colors.text,
        border: colors.border,
        notification: colors.danger,
      },
    };
  }, [colors, isDark]);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <AppProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: colors.background },
              headerShadowVisible: false,
              headerStyle: { backgroundColor: colors.background },
              headerTintColor: colors.tint,
              headerTitleStyle: { color: colors.text },
              headerLargeTitleStyle: { color: colors.text },
            }}
          >
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="(auth)" options={{headerShown: false}} />
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen
              name="items/scan"
              options={{
                headerShown: false,
                presentation: 'fullScreenModal',
                animation: 'fade',
              }}
            />
            <Stack.Screen
              name="items/new"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: '',
                sheetGrabberVisible: true,
                sheetCornerRadius: 24,
                sheetExpandsWhenScrolledToEdge: true,
                sheetElevation: 24,
                animation: 'slide_from_bottom',
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen
              name="items/[id]"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: '',
                sheetGrabberVisible: true,
                sheetCornerRadius: 24,
                sheetExpandsWhenScrolledToEdge: true,
                sheetElevation: 24,
                animation: 'slide_from_bottom',
                gestureDirection: 'vertical',
              }}
            />
          </Stack>
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
