import { ListItem } from '@expo/ui';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo } from 'react';
import { LayoutAnimation, StyleSheet, View } from 'react-native';

import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { CartCheckoutSheet } from '@/features/cart/cart-checkout-bar/cart-checkout-bar';
import { useCartCheckout } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { CartCheckoutNotice } from '@/features/cart/cart-checkout-notice/cart-checkout-notice';
import { sortCartItems } from '@/features/cart/cart-items/cart-items';
import { parsePantrySortOption } from '@/features/pantry/pantry-sort/pantry-sort-options';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function CartScreen() {
  const {deleteItem, moveItemToPantry, pantryItems, selectedPantry} = useAppContext();
  const {
    checkoutProgress,
    clearCheckoutError,
    clearSelection,
    dismissCompletionMessage,
    enterSelectionMode,
    exitSelectionMode,
    isSelectionMode,
    setVisibleItems,
    selectAll,
    selectedItemIds,
    toggleItemSelection,
  } = useCartCheckout();
  const {colors, isDark} = useAppTheme();
  const router = useRouter();
  const {sort} = useLocalSearchParams<{sort?: string | string[]}>();
  const sortOption = parsePantrySortOption(sort);

  const itemsInCart = useMemo(() => sortCartItems(getCartItems(pantryItems), sortOption), [pantryItems, sortOption]);
  const unselectedItems = useMemo(
    () => itemsInCart.filter(item => !selectedItemIds.includes(item.id)),
    [itemsInCart, selectedItemIds]
  );
  const selectedItems = useMemo(
    () => itemsInCart.filter(item => selectedItemIds.includes(item.id)),
    [itemsInCart, selectedItemIds]
  );

  const selectedCount = selectedItemIds.length;
  const allSelected = itemsInCart.length > 0 && selectedCount === itemsInCart.length;

  useEffect(() => {
    setVisibleItems(itemsInCart);
  }, [itemsInCart, setVisibleItems]);

  const animateListLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleMoveToPantry = async (itemId: string) => {
    animateListLayout();
    await moveItemToPantry(itemId);
  };

  if (!selectedPantry) {
    return (
      <View style={styles.emptyScreen}>
        <EmptyNotice
          title="No pantry workspace yet"
          body="Select a pantry first so the active shopping cart can be derived from that workspace."
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: isSelectionMode ? `${selectedCount} selected` : 'Cart',
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={exitSelectionMode} hidden={!isSelectionMode}>
          Cancel
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          icon="arrow.up.arrow.down"
          hidden={isSelectionMode}
          onPress={() =>
            router.push({
              pathname: '/cart/sort',
              params: {sort: sortOption},
            })
          }
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          hidden={!isSelectionMode}
          variant="prominent"
          onPress={() => {
            animateListLayout();
            if (allSelected) {
              clearSelection();
              return;
            }

            selectAll(itemsInCart.map(item => item.id));
          }}
        >
          {allSelected ? 'Clear' : 'Select All'}
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          onPress={() => enterSelectionMode()}
          disabled={itemsInCart.length === 0}
          hidden={isSelectionMode}
        >
          Select
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          icon="person.crop.circle"
          onPress={() => router.push('/account/menu')}
          hidden={isSelectionMode}
        />
      </Stack.Toolbar>
      <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.background}]}>
        <List modifiers={[listStyle('insetGrouped')]}>
          {checkoutProgress.errorMessage ? (
            <ListItem key="checkout-error">
              <View style={styles.noticeRow}>
                <CartCheckoutNotice
                  tone="error"
                  message={checkoutProgress.errorMessage}
                  onDismiss={clearCheckoutError}
                />
              </View>
            </ListItem>
          ) : null}
          {checkoutProgress.completionMessage ? (
            <ListItem key="checkout-success">
              <View style={styles.noticeRow}>
                <CartCheckoutNotice
                  tone="success"
                  message={checkoutProgress.completionMessage}
                  onDismiss={dismissCompletionMessage}
                />
              </View>
            </ListItem>
          ) : null}
          <Section title="Cart">
            {itemsInCart.length > 0 ? (
              unselectedItems.map((item, index) => (
                <PantryItemNativeListRow
                  key={item.id}
                  item={item}
                  displayMode="cart"
                  isLast={index === unselectedItems.length - 1 && selectedItems.length === 0}
                  onPress={() => {
                    if (isSelectionMode) {
                      animateListLayout();
                      toggleItemSelection(item.id);
                      return;
                    }

                    router.push(`/items/${item.id}`);
                  }}
                  onEdit={() => router.push(`/items/${item.id}`)}
                  onReviewQuantity={
                    isSelectionMode
                      ? undefined
                      : () =>
                          router.push({
                            pathname: '/cart/quantity',
                            params: {itemId: item.id},
                          })
                  }
                  leftActionLabel={isSelectionMode ? undefined : 'Move to Pantry'}
                  onLeftAction={isSelectionMode ? undefined : () => void handleMoveToPantry(item.id)}
                  onDelete={() => void deleteItem(item.id)}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedItemIds.includes(item.id)}
                  onToggleSelection={() => {
                    animateListLayout();
                    toggleItemSelection(item.id);
                  }}
                  onStartSelection={() => {
                    animateListLayout();
                    enterSelectionMode(item.id);
                  }}
                />
              ))
            ) : (
              <ListItem key="empty-cart">
                <View style={styles.noticeRow}>
                  <EmptyNotice
                    title="Nothing to buy right now"
                    body="Items moved into a shopping list will appear here with working native swipe actions."
                  />
                </View>
              </ListItem>
            )}
          </Section>
        </List>
      </Host>
      <CartCheckoutSheet />
    </>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  emptyScreen: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  noticeRow: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
});
