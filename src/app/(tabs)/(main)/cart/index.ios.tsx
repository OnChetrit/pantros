import { ListItem } from '@expo/ui';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle, scrollContentBackground } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Image, LayoutAnimation, StyleSheet, Text, View } from 'react-native';

import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { CartCheckoutSheet } from '@/features/cart/cart-checkout-bar/cart-checkout-bar';
import { useCartCheckout } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { CartCheckoutNotice } from '@/features/cart/cart-checkout-notice/cart-checkout-notice';
import { sortCartItems } from '@/features/cart/cart-items/cart-items';
import { parsePantrySortOption, SORT_OPTIONS } from '@/features/pantry/pantry-sort/pantry-sort-options';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

const fullCartIllustration = require('../../../../../assets/images/cart-full-empty-state-transparent.png');
const emptyCartIllustration = require('../../../../../assets/images/cart-empty-state-transparent.png');

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

  const animateListLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleMoveToPantry = async (itemId: string) => {
    animateListLayout();
    await moveItemToPantry(itemId);
  };

  const handleDelete = async (itemId: string) => {
    animateListLayout();
    await deleteItem(itemId);
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
        <Stack.Toolbar.Menu icon="arrow.up.arrow.down" title="Sort" hidden={isSelectionMode}>
          {SORT_OPTIONS.map(option => (
            <Stack.Toolbar.MenuAction
              key={option.key}
              isOn={option.key === sortOption}
              onPress={() =>
                router.replace({
                  pathname: '/cart',
                  params: {sort: option.key},
                })
              }
            >
              {option.label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
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
      {itemsInCart.length === 0 ? (
        <View style={[styles.emptyStateScreen]}>
          <View style={styles.emptyStateContent}>
            <Image source={emptyCartIllustration} style={styles.illustration} resizeMode="contain" />
            <View style={styles.emptyStateCopy}>
              <Text style={[styles.emptyStateTitle, {color: colors.text}]}>Nothing to pick up right now</Text>
              <Text style={[styles.emptyStateBody, {color: colors.muted}]}>
                Move pantry items into your cart and they&apos;ll appear here, ready for a quick grocery run.
              </Text>
            </View>
          </View>
        </View>
      ) : itemsInCart.length > 0 && unselectedItems.length === 0 ? (
        <View style={[styles.allSelectedScreen, {backgroundColor: colors.card}]}>
          {checkoutProgress.errorMessage ? (
            <View style={styles.noticeRow}>
              <CartCheckoutNotice tone="error" message={checkoutProgress.errorMessage} onDismiss={clearCheckoutError} />
            </View>
          ) : null}
          {checkoutProgress.completionMessage ? (
            <View style={styles.noticeRow}>
              <CartCheckoutNotice
                tone="success"
                message={checkoutProgress.completionMessage}
                onDismiss={dismissCompletionMessage}
              />
            </View>
          ) : null}
          <View style={styles.allSelectedState}>
            <Image source={fullCartIllustration} style={styles.illustration} resizeMode="contain" />
            <View style={styles.allSelectedCopy}>
              <Text style={[styles.allSelectedTitle, {color: colors.text}]}>Everything is packed and ready</Text>
              <Text style={[styles.allSelectedBody, {color: colors.muted}]}>
                Your cart is fully selected for checkout.
              </Text>
            </View>
          </View>
        </View>
      ) : (
        <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.card}]}>
          <List modifiers={[listStyle('plain'), scrollContentBackground('visible')]}>
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
            <Section title="">
              {itemsInCart.length > 0
                ? unselectedItems.map((item, index) => (
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
                      onDelete={() => void handleDelete(item.id)}
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
                : null}
            </Section>
          </List>
        </Host>
      )}
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
  allSelectedScreen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  emptyStateScreen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyStateContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 72,
    gap: 18,
  },
  emptyStateCopy: {
    maxWidth: 320,
    gap: 8,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  allSelectedState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 72,
    gap: 18,
  },
  allSelectedCopy: {
    maxWidth: 320,
    gap: 8,
    alignItems: 'center',
  },
  allSelectedTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  allSelectedBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  illustration: {
    width: 260,
    height: 260,
    alignSelf: 'center',
  },
});
