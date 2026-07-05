import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { FlatList, LayoutAnimation, Platform, StyleSheet, UIManager, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar/avatar-sidebar';
import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu/pantry-filter-menu';
import { PantryItemRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { CartCheckoutSheet } from '@/features/cart/cart-checkout-bar/cart-checkout-bar';
import { CartCheckoutNotice } from '@/features/cart/cart-checkout-notice/cart-checkout-notice';
import { CartExpirationReviewModal } from '@/features/cart/cart-expiration-review-modal/cart-expiration-review-modal';
import { useCartCheckout } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { CartHeaderAction } from '@/features/cart/cart-header-action/cart-header-action';
import { sortCartItems } from '@/features/cart/cart-items/cart-items';
import { getCartItems } from '@/lib/pantry-insights';
import { appColors } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CartScreen() {
  const { deleteItem, moveItemToPantry, pantryItems, selectedPantry } = useAppContext();
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
  const router = useRouter();
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');

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

  const animateSelectionLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
          headerLeft: () =>
            isSelectionMode ? (
              <CartHeaderAction label="Cancel" onPress={exitSelectionMode} />
            ) : (
              <PantryFilterMenu sortOption={sortOption} onSelectSort={setSortOption} />
            ),
          title: isSelectionMode ? `${selectedCount} selected` : 'Cart',
          headerRight: () =>
            isSelectionMode ? (
              <CartHeaderAction
                label={allSelected ? 'Clear' : 'Select All'}
                emphasized
                onPress={() => (allSelected ? clearSelection() : selectAll(itemsInCart.map((item) => item.id)))}
              />
            ) : (
              <View style={styles.headerActions}>
                <CartHeaderAction
                  label="Select"
                  emphasized
                  disabled={itemsInCart.length === 0}
                  onPress={() => enterSelectionMode()}
                />
                <AvatarSidebarButton />
              </View>
            ),
        }}
      />
      <View style={styles.screen}>
        <FlatList
          data={unselectedItems}
          keyExtractor={(item) => item.id}
          style={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={[
            styles.content,
            itemsInCart.length > 0 ? styles.filledContent : null,
          ]}
          ListHeaderComponent={
            <>
              {checkoutProgress.errorMessage ? (
                <CartCheckoutNotice tone="error" message={checkoutProgress.errorMessage} onDismiss={clearCheckoutError} />
              ) : null}
              {checkoutProgress.completionMessage ? (
                <CartCheckoutNotice
                  tone="success"
                  message={checkoutProgress.completionMessage}
                  onDismiss={dismissCompletionMessage}
                />
              ) : null}
            </>
          }
          ListEmptyComponent={
            <View style={styles.listEmpty}>
              <EmptyNotice
                title="Nothing to buy right now"
                body="Items moved into a shopping list will appear here with the same native list layout as Pantros."
              />
            </View>
          }
          ItemSeparatorComponent={null}
          ListFooterComponent={
            selectedItems.length > 0 ? (
              <View style={styles.selectedGroup}>
                <View style={styles.selectedGroupHeader}>
                  <View style={styles.selectedGroupDivider} />
                </View>
                {selectedItems.map((item, index) => (
                  <PantryItemRow
                    key={item.id}
                    item={item}
                    displayMode="cart"
                    isLast={index === selectedItems.length - 1}
                    onPress={() => {
                      animateSelectionLayout();
                      toggleItemSelection(item.id);
                    }}
                    onEdit={() => router.push(`/items/${item.id}`)}
                    leftActionLabel={undefined}
                    onLeftAction={undefined}
                    onDelete={() => void deleteItem(item.id)}
                    isSelectionMode={isSelectionMode}
                    isSelected
                    onToggleSelection={() => {
                      animateSelectionLayout();
                      toggleItemSelection(item.id);
                    }}
                    onStartSelection={() => enterSelectionMode(item.id)}
                  />
                ))}
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <PantryItemRow
              item={item}
              displayMode="cart"
              isLast={index === unselectedItems.length - 1 && selectedItems.length === 0}
              onPress={() => {
                if (isSelectionMode) {
                  animateSelectionLayout();
                  toggleItemSelection(item.id);
                  return;
                }

                router.push(`/items/${item.id}`);
              }}
              onEdit={() => router.push(`/items/${item.id}`)}
              leftActionLabel={isSelectionMode ? undefined : 'Move to Pantry'}
              onLeftAction={isSelectionMode ? undefined : () => void moveItemToPantry(item.id)}
              onDelete={() => void deleteItem(item.id)}
              isSelectionMode={isSelectionMode}
              isSelected={false}
              onToggleSelection={() => {
                animateSelectionLayout();
                toggleItemSelection(item.id);
              }}
              onStartSelection={() => enterSelectionMode(item.id)}
            />
          )}
        />
      </View>
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
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  list: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 12,
    gap: 12,
  },
  filledContent: {
    marginHorizontal: 12,
    paddingHorizontal: 0,
    borderRadius: 26,
    backgroundColor: appColors.card,
    overflow: 'hidden',
  },
  emptyScreen: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 20,
    justifyContent: 'center',
  },
  listEmpty: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectedGroup: {
    marginTop: 8,
    paddingTop: 10,
    opacity: 0.62,
  },
  selectedGroupHeader: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  selectedGroupDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: appColors.border,
  },
});
