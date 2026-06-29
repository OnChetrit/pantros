import 'expo-dev-client';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useTabStackScreenOptions } from '@/components/navigation/tab-stack-layout';
import { ThemePreferenceProvider, useAppTheme } from '@/lib/theme';
import { AppProvider } from '@/state/app-context';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  return (
    <ThemePreferenceProvider>
      <RootLayoutContent />
    </ThemePreferenceProvider>
  );
}

function RootLayoutContent() {
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const profileScreenOptions = useTabStackScreenOptions({
    title: 'Profile',
    showAccountMenu: false,
    minimalBackButton: true,
  });
  const settingsScreenOptions = useTabStackScreenOptions({
    title: 'Settings',
    showAccountMenu: false,
    minimalBackButton: true,
  });
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

  useEffect(() => {
    const handleNotificationResponse = (
      response: Notifications.NotificationResponse
    ) => {
      const route = response.notification.request.content.data?.route;

      if (route === '/(tabs)/cart') {
        router.push('/(tabs)/cart');
      }
    };

    const subscription =
      Notifications.addNotificationResponseReceivedListener(
        handleNotificationResponse
      );

    void Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        handleNotificationResponse(response);
        void Notifications.clearLastNotificationResponseAsync();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [router]);

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
            <Stack.Screen name="profile" options={profileScreenOptions} />
            <Stack.Screen name="settings" options={settingsScreenOptions} />
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
                presentation: 'card',
                headerShown: true,
                title: '',
              }}
            />
            <Stack.Screen
              name="account/delete"
              options={{
                presentation: 'card',
                headerShown: true,
                title: '',
              }}
            />
          </Stack>
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}
