import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useAppTheme } from '@/lib/theme';
import { AppProvider } from '@/state/app-context';

export function RootLayoutContent() {
  const {colors, isDark} = useAppTheme();
  const router = useRouter();
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
    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const route = response.notification.request.content.data?.route;

      if (route === '/(tabs)/cart' || route === '/(tabs)/(main)/cart') {
        router.replace('/(tabs)/(main)/cart');
      }
    };

    const subscription = Notifications.addNotificationResponseReceivedListener(handleNotificationResponse);
    const lastResponse = Notifications.getLastNotificationResponse();

    if (lastResponse) {
      handleNotificationResponse(lastResponse);
      Notifications.clearLastNotificationResponse();
    }

    return () => {
      subscription.remove();
    };
  }, [router]);

  return (
    <GestureHandlerRootView style={{flex: 1, backgroundColor: colors.background}}>
      <AppProvider>
        <ThemeProvider value={navigationTheme}>
          <StatusBar style={isDark ? 'light' : 'dark'} />
          <Stack
            screenOptions={{
              contentStyle: {backgroundColor: colors.background},
              headerShadowVisible: false,
              headerStyle: {backgroundColor: colors.background},
              headerTintColor: colors.tint,
              headerTitleStyle: {color: colors.text},
              headerLargeTitleStyle: {color: colors.text},
            }}
          >
            <Stack.Screen name="index" options={{headerShown: false}} />
            <Stack.Screen name="+not-found" options={{title: 'Not Found'}} />
            <Stack.Screen name="(auth)" options={{headerShown: false}} />
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen name="(protected)" options={{headerShown: false}} />
          </Stack>
        </ThemeProvider>
      </AppProvider>
    </GestureHandlerRootView>
  );
}

export default RootLayoutContent;
