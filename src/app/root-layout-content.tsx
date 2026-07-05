import * as Notifications from 'expo-notifications';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { FORM_SHEET_DETENT } from '@/components/sheets/sheet-presets/sheet-presets';
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

      if (route === '/(tabs)/cart') {
        router.replace('/(tabs)/cart');
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
            <Stack.Screen name="(auth)" options={{headerShown: false}} />
            <Stack.Screen name="(tabs)" options={{headerShown: false}} />
            <Stack.Screen
              name="profile"
              options={{
                title: 'Profile',
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
                headerTitleStyle: {color: colors.text},
                headerLargeTitleStyle: {color: colors.text},
                headerBackVisible: true,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
            <Stack.Screen
              name="settings"
              options={{
                title: 'Settings',
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
                headerTitleStyle: {color: colors.text},
                headerLargeTitleStyle: {color: colors.text},
                headerBackVisible: true,
                headerBackButtonDisplayMode: 'minimal',
              }}
            />
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
                presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
                headerShown: true,
                title: '',
                sheetGrabberVisible: true,
                sheetCornerRadius: 24,
                sheetAllowedDetents: Platform.OS === 'ios' ? [FORM_SHEET_DETENT] : undefined,
                sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
                sheetExpandsWhenScrolledToEdge: true,
                sheetElevation: 24,
                animation: 'slide_from_bottom',
                gestureDirection: 'vertical',
              }}
            />
            <Stack.Screen
              name="items/[id]"
              options={{
                presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
                headerShown: true,
                title: '',
                sheetGrabberVisible: Platform.OS === 'ios' ? true : undefined,
                sheetCornerRadius: Platform.OS === 'ios' ? 24 : undefined,
                sheetAllowedDetents: Platform.OS === 'ios' ? [FORM_SHEET_DETENT] : undefined,
                sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
                sheetExpandsWhenScrolledToEdge: Platform.OS === 'ios' ? true : undefined,
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
            <Stack.Screen
              name="account/menu"
              options={{
                presentation: 'modal',
                headerShown: true,
                title: '',
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

export default RootLayoutContent;

const styles = StyleSheet.create({
  transparentHeaderBackground: {
    backgroundColor: 'transparent',
  },
});
