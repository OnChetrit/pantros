import { Redirect, useSegments } from 'expo-router';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { StyleSheet, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import { CartCheckoutBottomAccessory } from '@/features/cart/cart-checkout-bar';
import { CartCheckoutProvider, useCartCheckout } from '@/features/cart/cart-checkout-context';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

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

function TabsLayoutContent() {
  const {colors} = useAppTheme();
  const {checkoutProgress, clearSelection, isSelectionMode, selectAll, selectedItemIds, startCheckout} =
    useCartCheckout();
  const {pantryItems} = useAppContext();
  const segments = useSegments();
  const isCartRoute = segments[0] === '(tabs)' && segments[1] === 'cart' && segments.length <= 2;
  const itemsInCart = pantryItems.filter(item => item.isInCart);
  const selectedCount = selectedItemIds.length;
  const allSelected = itemsInCart.length > 0 && selectedCount === itemsInCart.length;

  return (
    <View style={styles.root}>
      <NativeTabs
        backgroundColor={colors.card}
        blurEffect="none"
        disableTransparentOnScrollEdge
        shadowColor={colors.border}
        tintColor={colors.tint}
        labelStyle={{
          default: {
            color: colors.muted,
            fontWeight: '600',
          },
          selected: {
            color: colors.tint,
            fontWeight: '700',
          },
        }}
      >
        {isCartRoute && isSelectionMode ? (
          <NativeTabs.BottomAccessory>
            <CartCheckoutBottomAccessory
              selectedCount={selectedCount}
              totalCount={itemsInCart.length}
              processing={checkoutProgress.processing}
              onSubmit={() => void startCheckout()}
              onSecondaryAction={() => (allSelected ? clearSelection() : selectAll(itemsInCart.map(item => item.id)))}
            />
          </NativeTabs.BottomAccessory>
        ) : null}
        <NativeTabs.Trigger
          name="pantry"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon sf="house.fill" />
          <NativeTabs.Trigger.Label>Pantry</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="cart"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon sf="cart.fill" />
          <NativeTabs.Trigger.Label>Cart</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="search"
          role="search"
          contentStyle={{backgroundColor: colors.background}}
          disableTransparentOnScrollEdge
        >
          <NativeTabs.Trigger.Icon
            sf={{
              default: 'plus.magnifyingglass',
              selected: 'plus.magnifyingglass',
            }}
          />
          <NativeTabs.Trigger.Label hidden>Search + Add</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: appColors.background,
  },
});
