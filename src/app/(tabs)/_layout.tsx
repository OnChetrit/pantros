import {Redirect, Stack} from 'expo-router';

import {FORM_SHEET_DETENT, createFormSheetOptions} from '@/components/sheets/sheet-presets/sheet-presets';
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
          options={{headerShown: true, ...createFormSheetOptions({detents: [FORM_SHEET_DETENT]})}}
        />
        <Stack.Screen
          name="items/[id]"
          options={{headerShown: true, ...createFormSheetOptions({detents: [FORM_SHEET_DETENT]})}}
        />
      </Stack>
    </CartCheckoutProvider>
  );
}
