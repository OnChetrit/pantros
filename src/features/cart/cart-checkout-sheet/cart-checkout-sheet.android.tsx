import { useEffect, useMemo } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';

import { useCartCheckout } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { sortCartItems } from '@/features/cart/cart-items/cart-items';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export function CartCheckoutSheet() {
  const {pantryItems} = useAppContext();
  const {colors} = useAppTheme();
  const {
    checkoutProgress,
    clearSelection,
    exitSelectionMode,
    isSelectionMode,
    selectedItemIds,
    startCheckout,
    toggleItemSelection,
  } = useCartCheckout();
  const itemsInCart = useMemo(() => sortCartItems(getCartItems(pantryItems), 'expiration'), [pantryItems]);
  const selectedItems = useMemo(
    () => itemsInCart.filter(item => selectedItemIds.includes(item.id)),
    [itemsInCart, selectedItemIds]
  );
  const allSelected = selectedItems.length > 0 && selectedItems.length === itemsInCart.length;
  const processing = checkoutProgress.processing;

  useEffect(() => {
    if (!isSelectionMode) {
      return;
    }

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!processing) {
        exitSelectionMode();
      }

      return true;
    });

    return () => subscription.remove();
  }, [exitSelectionMode, isSelectionMode, processing]);

  if (!isSelectionMode) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Animated.View entering={FadeIn.duration(180)} pointerEvents="none" style={styles.backdrop} />
      <Animated.View
        entering={SlideInDown.duration(220)}
        style={[styles.sheet, {backgroundColor: colors.background}]}
      >
        <View style={styles.header}>
          <Pressable onPress={exitSelectionMode} disabled={processing} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, {color: colors.tint}]}>Cancel</Text>
          </Pressable>
          <Text style={[styles.title, {color: colors.text}]}>Shopping</Text>
          <Pressable
            onPress={() => void startCheckout(itemsInCart)}
            disabled={selectedItems.length === 0 || processing}
            style={[styles.finishButton, {backgroundColor: colors.tint}, selectedItems.length === 0 || processing ? styles.disabled : null]}
          >
            <Text style={[styles.finishText, {color: colors.textInverse}]}>{processing ? 'Saving…' : 'Finish'}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.cards}>
          {selectedItems.map(item => (
            <Pressable
              key={item.id}
              onPress={() => toggleItemSelection(item.id)}
              disabled={processing}
              style={({pressed}) => [styles.itemCard, {backgroundColor: colors.card, borderColor: colors.border}, pressed ? styles.pressed : null]}
            >
              <Text numberOfLines={2} style={[styles.itemName, {color: colors.text}]}>{item.name}</Text>
              <Text style={[styles.itemQuantity, {color: colors.tint}]}>{item.quantity}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          onPress={() => (allSelected ? clearSelection() : undefined)}
          disabled={!allSelected || processing}
          style={styles.selectAllButton}
        >
          <Text style={[styles.selectAllText, {color: allSelected ? colors.tint : colors.muted}]}>
            {allSelected ? 'Clear selection' : `${selectedItems.length} selected`}
          </Text>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  sheet: {
    minHeight: '42%',
    maxHeight: '82%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 16,
    gap: 14,
  },
  header: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerButton: {
    minWidth: 64,
    minHeight: 40,
    justifyContent: 'center',
  },
  headerButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 20,
    fontWeight: '700',
  },
  finishButton: {
    minWidth: 72,
    minHeight: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  finishText: {
    fontSize: 15,
    fontWeight: '700',
  },
  cards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 4,
  },
  itemCard: {
    width: '48%',
    minHeight: 104,
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  itemQuantity: {
    fontSize: 22,
    fontWeight: '800',
  },
  selectAllButton: {
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectAllText: {
    fontSize: 14,
    fontWeight: '700',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
  },
});
