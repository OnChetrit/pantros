import {Redirect, Stack} from 'expo-router';
import {Platform} from 'react-native';

import {FORM_SHEET_DETENT} from '@/components/sheets/sheet-presets/sheet-presets';
import { CartCheckoutProvider } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { useAuthState } from '@/state/auth-state';
import { useWorkspaceState } from '@/state/workspace-state';

export default function TabsLayout() {
  const auth = useAuthState();
  const workspace = useWorkspaceState();

  if (auth.status === 'loading' || workspace.status === 'loading') {
    return null;
  }

  if (!auth.isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <CartCheckoutProvider>
      <Stack screenOptions={{headerShown: false}}>
        <Stack.Screen name="(main)" />
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
            headerShown: true,
            presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
            sheetCornerRadius: Platform.OS === 'ios' ? 24 : undefined,
            sheetAllowedDetents: Platform.OS === 'ios' ? [FORM_SHEET_DETENT] : undefined,
            sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
            sheetExpandsWhenScrolledToEdge: Platform.OS === 'ios' ? true : undefined,
            sheetElevation: Platform.OS === 'ios' ? 24 : undefined,
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
            headerTransparent: Platform.OS === 'ios',
            contentStyle: Platform.OS === 'ios' ? {backgroundColor: 'transparent'} : undefined,
          }}
        />
        <Stack.Screen
          name="items/[id]"
          options={{
            headerShown: true,
            presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
            sheetCornerRadius: Platform.OS === 'ios' ? 24 : undefined,
            sheetAllowedDetents: Platform.OS === 'ios' ? [FORM_SHEET_DETENT] : undefined,
            sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
            sheetExpandsWhenScrolledToEdge: Platform.OS === 'ios' ? true : undefined,
            sheetElevation: Platform.OS === 'ios' ? 24 : undefined,
            animation: 'slide_from_bottom',
            gestureDirection: 'vertical',
            headerTransparent: Platform.OS === 'ios',
            contentStyle: Platform.OS === 'ios' ? {backgroundColor: 'transparent'} : undefined,
          }}
        />
      </Stack>
    </CartCheckoutProvider>
  );
}
