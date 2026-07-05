import { Redirect } from 'expo-router';

import { CartCheckoutProvider } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { useAppContext } from '@/state/app-context';

import { TabsLayoutContent } from './tabs-layout-content';

export default function TabsLayout() {
  const {isAuthenticated, status} = useAppContext();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <CartCheckoutProvider>
      <TabsLayoutContent />
    </CartCheckoutProvider>
  );
}
