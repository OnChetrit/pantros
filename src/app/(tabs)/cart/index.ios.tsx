import { ListItem } from '@expo/ui';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { createIconHeaderButton, createTextHeaderButton } from '@/components/navigation/native-header-items';
import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import type { PantryItem } from '@/domain/models';
import { CartCheckoutSheet } from '@/features/cart/cart-checkout-bar';
import { CartCheckoutNotice } from '@/features/cart/cart-checkout-notice';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';
import { CartExpirationReviewModal } from '@/features/cart/cart-expiration-review-modal';
import { CartQuantitySheet } from '@/features/cart/cart-quantity-sheet';
import { useCartCheckout } from '@/features/cart/cart-checkout-context';
import { sortCartItems } from '@/features/cart/cart-items';

export default function CartScreen() {
  const { deleteItem, itemBusy, moveItemToPantry, pantryItems, selectedPantry, updateItem } = useAppContext();
  const {
    checkoutProgress,
    checkoutQueue,
    clearCheckoutError,
    clearSelection,
    currentReviewItem,
    dismissCompletionMessage,
    enterSelectionMode,
    exitSelectionMode,
    isSelectionMode,
    reviewDate,
    saveAndContinueReview,
    setVisibleItems,
    selectAll,
    selectedItemIds,
    setReviewDate,
    skipCurrentReview,
    startCheckout,
    toggleItemSelection,
    cancelReview,
  } = useCartCheckout();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false);
  const [quantityItem, setQuantityItem] = useState<PantryItem | null>(null);
  const [quantityErrorMessage, setQuantityErrorMessage] = useState<string | null>(null);

  const itemsInCart = useMemo(() => {
    return sortCartItems(getCartItems(pantryItems), sortOption);
  }, [pantryItems, sortOption]);
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
  const reviewStep =
    currentReviewItem ? checkoutQueue.findIndex((item) => item.id === currentReviewItem.id) + 1 : 0;

  useEffect(() => {
    setVisibleItems(itemsInCart);
  }, [itemsInCart, setVisibleItems]);

  const openQuantitySheet = (item: PantryItem) => {
    setQuantityItem(item);
    setQuantityErrorMessage(null);
  };

  const closeQuantitySheet = () => {
    setQuantityItem(null);
    setQuantityErrorMessage(null);
  };

  const handleSaveQuantity = async (quantity: number) => {
    if (!quantityItem) {
      return;
    }

    try {
      setQuantityErrorMessage(null);
      await updateItem(quantityItem.id, {
        pantryId: quantityItem.pantryId,
        name: quantityItem.name,
        barcode: quantityItem.barcode,
        image: quantityItem.image,
        expirationDate: quantityItem.expirationDate,
        isInCart: quantityItem.isInCart,
        cartId: quantityItem.cartId,
        quantity,
      });
      closeQuantitySheet();
    } catch (error) {
      setQuantityErrorMessage(error instanceof Error ? error.message : 'Unable to update quantity.');
    }
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
          unstable_headerLeftItems: () =>
            isSelectionMode
              ? [
                  createTextHeaderButton({
                    label: 'Cancel',
                    onPress: exitSelectionMode,
                    tintColor: colors.text,
                  }),
                ]
              : [
                  createIconHeaderButton({
                    label: 'Open sort menu',
                    icon: 'arrow.up.arrow.down',
                    onPress: () => setIsSortMenuVisible(true),
                    tintColor: colors.tint,
                  }),
                ],
          title: isSelectionMode ? `${selectedCount} selected` : 'Cart',
          unstable_headerRightItems: () =>
            isSelectionMode
              ? [
                  createTextHeaderButton({
                    label: allSelected ? 'Clear' : 'Select All',
                    onPress: () => (allSelected ? clearSelection() : selectAll(itemsInCart.map((item) => item.id))),
                    tintColor: colors.tint,
                  }),
                ]
              : [
                  createTextHeaderButton({
                    label: 'Select',
                    onPress: () => enterSelectionMode(),
                    disabled: itemsInCart.length === 0,
                    tintColor: colors.tint,
                  }),
                  createIconHeaderButton({
                    label: 'Open account menu',
                    icon: 'person.crop.circle',
                    onPress: () => router.push('/account/menu'),
                    tintColor: colors.tint,
                  }),
                ],
        }}
      />
      <PantryFilterMenu
        hideTrigger
        sortOption={sortOption}
        onSelectSort={setSortOption}
        visible={isSortMenuVisible}
        onVisibilityChange={setIsSortMenuVisible}
      />
      <Host
        colorScheme={isDark ? 'dark' : 'light'}
        style={[styles.host, { backgroundColor: colors.background }]}
        useViewportSizeMeasurement
      >
        <List modifiers={[listStyle('insetGrouped')]}>
          {checkoutProgress.errorMessage ? (
            <ListItem key="checkout-error">
              <View style={styles.noticeRow}>
                <CartCheckoutNotice tone="error" message={checkoutProgress.errorMessage} onDismiss={clearCheckoutError} />
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
                  onPress={() => (isSelectionMode ? toggleItemSelection(item.id) : router.push(`/items/${item.id}`))}
                  onEdit={() => router.push(`/items/${item.id}`)}
                  onReviewQuantity={isSelectionMode ? undefined : () => openQuantitySheet(item)}
                  leftActionLabel={isSelectionMode ? undefined : 'Move to Pantry'}
                  onLeftAction={isSelectionMode ? undefined : () => void moveItemToPantry(item.id)}
                  onDelete={() => void deleteItem(item.id)}
                  isSelectionMode={isSelectionMode}
                  isSelected={selectedItemIds.includes(item.id)}
                  onToggleSelection={() => toggleItemSelection(item.id)}
                  onStartSelection={() => enterSelectionMode(item.id)}
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
          {selectedItems.length > 0 ? (
            <Section title={`${selectedItems.length} Selected`}>
              {selectedItems.map((item, index) => (
                <PantryItemNativeListRow
                  key={item.id}
                  item={item}
                  displayMode="cart"
                  isLast={index === selectedItems.length - 1}
                  onPress={() => toggleItemSelection(item.id)}
                  onEdit={() => router.push(`/items/${item.id}`)}
                  onReviewQuantity={undefined}
                  leftActionLabel={undefined}
                  onLeftAction={undefined}
                  onDelete={() => void deleteItem(item.id)}
                  isSelectionMode={isSelectionMode}
                  isSelected
                  onToggleSelection={() => toggleItemSelection(item.id)}
                  onStartSelection={() => enterSelectionMode(item.id)}
                />
              ))}
            </Section>
          ) : null}
        </List>
      </Host>
      <CartCheckoutSheet
        isPresented={isSelectionMode}
        onDismiss={exitSelectionMode}
        selectedCount={selectedCount}
        totalCount={itemsInCart.length}
        processing={checkoutProgress.processing}
        onSubmit={() => void startCheckout()}
        onSecondaryAction={() => (allSelected ? clearSelection() : selectAll(itemsInCart.map((item) => item.id)))}
      />
      <CartExpirationReviewModal
        visible={checkoutQueue.length > 0 && currentReviewItem !== null}
        item={currentReviewItem}
        step={reviewStep}
        totalSteps={checkoutQueue.length}
        reviewDate={reviewDate}
        processing={checkoutProgress.processing}
        errorMessage={checkoutProgress.errorMessage}
        onChangeDate={setReviewDate}
        onSave={() => void saveAndContinueReview()}
        onSkip={() => void skipCurrentReview()}
        onCancel={cancelReview}
      />
      <CartQuantitySheet
        visible={quantityItem !== null}
        item={quantityItem}
        processing={itemBusy}
        errorMessage={quantityErrorMessage}
        onSave={(quantity) => void handleSaveQuantity(quantity)}
        onCancel={closeQuantitySheet}
      />
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
