import { Host, List, RNHostView } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar';
import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';
import { CartExpirationReviewModal } from '@/features/cart/cart-expiration-review-modal';
import { useCartCheckout } from '@/features/cart/cart-checkout-context';
import { sortCartItems } from '@/features/cart/cart-items';

function HeaderAction({
  label,
  onPress,
  emphasized = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  emphasized?: boolean;
  disabled?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.headerButton, (pressed || disabled) ? styles.headerButtonPressed : null]}
    >
      <Text
        style={[
          styles.headerButtonText,
          { color: disabled ? colors.muted : emphasized ? colors.tint : colors.text },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function CheckoutNotice({
  tone,
  message,
  onDismiss,
}: {
  tone: 'success' | 'error';
  message: string;
  onDismiss: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.noticeBanner,
        {
          backgroundColor: tone === 'success' ? colors.tintSoft : colors.dangerSoft,
          borderColor: tone === 'success' ? colors.borderStrong : colors.danger,
        },
      ]}
    >
      <Text style={[styles.noticeBannerText, { color: colors.text }]}>{message}</Text>
      <Pressable onPress={onDismiss}>
        <Text style={[styles.noticeBannerDismiss, { color: colors.tint }]}>Dismiss</Text>
      </Pressable>
    </View>
  );
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
    toggleItemSelection,
    cancelReview,
  } = useCartCheckout();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');

  const itemsInCart = useMemo(() => {
    return sortCartItems(getCartItems(pantryItems), sortOption);
  }, [pantryItems, sortOption]);

  const selectedCount = selectedItemIds.length;
  const allSelected = itemsInCart.length > 0 && selectedCount === itemsInCart.length;
  const reviewStep =
    currentReviewItem ? checkoutQueue.findIndex((item) => item.id === currentReviewItem.id) + 1 : 0;

  useEffect(() => {
    setVisibleItems(itemsInCart);
  }, [itemsInCart, setVisibleItems]);

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
              <HeaderAction label="Cancel" onPress={exitSelectionMode} />
            ) : (
              <PantryFilterMenu sortOption={sortOption} onSelectSort={setSortOption} />
            ),
          title: isSelectionMode ? `${selectedCount} selected` : 'Cart',
          headerRight: () =>
            isSelectionMode ? (
              <HeaderAction
                label={allSelected ? 'Clear' : 'Select All'}
                emphasized
                onPress={() => (allSelected ? clearSelection() : selectAll(itemsInCart.map((item) => item.id)))}
              />
            ) : (
              <View style={styles.headerActions}>
                <HeaderAction
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
      <Host
        colorScheme={isDark ? 'dark' : 'light'}
        style={[styles.host, { backgroundColor: colors.background }]}
        useViewportSizeMeasurement
      >
        <List modifiers={[listStyle('insetGrouped')]}>
          {checkoutProgress.errorMessage ? (
            <RNHostView key="checkout-error" matchContents>
              <View style={styles.noticeRow}>
                <CheckoutNotice tone="error" message={checkoutProgress.errorMessage} onDismiss={clearCheckoutError} />
              </View>
            </RNHostView>
          ) : null}
          {checkoutProgress.completionMessage ? (
            <RNHostView key="checkout-success" matchContents>
              <View style={styles.noticeRow}>
                <CheckoutNotice
                  tone="success"
                  message={checkoutProgress.completionMessage}
                  onDismiss={dismissCompletionMessage}
                />
              </View>
            </RNHostView>
          ) : null}
          {itemsInCart.length > 0 ? (
            itemsInCart.map((item, index) => (
              <PantryItemNativeListRow
                key={item.id}
                item={item}
                displayMode="cart"
                isLast={index === itemsInCart.length - 1}
                onPress={() => (isSelectionMode ? toggleItemSelection(item.id) : router.push(`/items/${item.id}`))}
                onEdit={() => router.push(`/items/${item.id}`)}
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
            <RNHostView key="empty-cart" matchContents>
              <View style={styles.noticeRow}>
                <EmptyNotice
                  title="Nothing to buy right now"
                  body="Items moved into a shopping list will appear here with working native swipe actions."
                />
              </View>
            </RNHostView>
          )}
        </List>
      </Host>
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
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerButton: {
    minHeight: 32,
    justifyContent: 'center',
  },
  headerButtonPressed: {
    opacity: 0.65,
  },
  headerButtonText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
  noticeBanner: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  noticeBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  noticeBannerDismiss: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
});
