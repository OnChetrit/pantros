import { Redirect } from 'expo-router';

import { CartCheckoutProvider } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { useAuthState } from '@/state/auth-state';
import { useWorkspaceState } from '@/state/workspace-state';

import { TabsLayoutContent } from './tabs-layout-content';

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
      <TabsLayoutContent />
    </CartCheckoutProvider>
  );
}
