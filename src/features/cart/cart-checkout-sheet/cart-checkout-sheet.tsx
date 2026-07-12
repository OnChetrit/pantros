import {
  BottomSheet,
  HStack,
  Host,
  ProgressView,
  RNHostView,
  Spacer,
  Text as SwiftText,
  Button as SwiftUIButton,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  interactiveDismissDisabled,
  padding,
  presentationBackgroundInteraction,
  presentationDetents,
  progressViewStyle,
} from '@expo/ui/swift-ui/modifiers';
import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';

import { useCartCheckout } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import { sortCartItems } from '@/features/cart/cart-items/cart-items';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

const CARD_STAGGER_MS = 32;
const MAX_CARD_STAGGER_STEPS = 6;
const CARD_LAYOUT_TRANSITION = LinearTransition.duration(180).easing(Easing.out(Easing.quad));

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

  return (
    <Host>
      <BottomSheet
        isPresented={isSelectionMode}
        onIsPresentedChange={presented => {
          if (!presented) {
            exitSelectionMode();
          }
        }}
        onDismiss={exitSelectionMode}
        modifiers={[interactiveDismissDisabled(false)]}
      >
        <VStack
          spacing={18}
          modifiers={[
            presentationBackgroundInteraction('enabled'),
            presentationDetents([{height: 320}]),
            interactiveDismissDisabled(checkoutProgress.processing),
            padding({top: 12, leading: 16, trailing: 16, bottom: 16}),
          ]}
        >
          <SheetHeader
            allSelected={allSelected}
            processing={checkoutProgress.processing}
            selectedCount={selectedItems.length}
            totalCount={itemsInCart.length}
            onClose={exitSelectionMode}
            onPrimaryAction={() => void startCheckout()}
            onSecondaryAction={() => {
              if (allSelected) {
                clearSelection();
              }
            }}
          />

          <RNHostView>
            <View style={styles.scrollHost}>
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.grid}
                contentInsetAdjustmentBehavior="never"
                showsVerticalScrollIndicator={false}
              >
                {selectedItems.map((item, index) => (
                  <Animated.View
                    key={item.id}
                    entering={FadeInDown.duration(220).delay(Math.min(index, MAX_CARD_STAGGER_STEPS) * CARD_STAGGER_MS)}
                    exiting={FadeOutDown.duration(160)}
                    layout={CARD_LAYOUT_TRANSITION}
                    style={styles.cardWrap}
                  >
                    <Pressable
                      accessibilityRole="button"
                      onPress={() => toggleItemSelection(item.id)}
                      disabled={checkoutProgress.processing}
                      style={({pressed}) => [
                        styles.card,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                        pressed ? {backgroundColor: colors.rowPressed} : null,
                        checkoutProgress.processing ? styles.disabledCard : null,
                      ]}
                    >
                      <Text numberOfLines={2} selectable style={[styles.cardTitle, {color: colors.text}]}>
                        {item.name}
                      </Text>
                      <Text selectable style={[styles.cardMeta, {color: colors.muted}]}>
                        {item.quantity}
                      </Text>
                    </Pressable>
                  </Animated.View>
                ))}
              </ScrollView>
            </View>
          </RNHostView>
        </VStack>
      </BottomSheet>
    </Host>
  );
}

function SheetHeader({
  allSelected,
  processing,
  selectedCount,
  totalCount,
  onClose,
  onPrimaryAction,
  onSecondaryAction,
}: {
  allSelected: boolean;
  processing: boolean;
  selectedCount: number;
  totalCount: number;
  onClose: () => void;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
}) {
  const hasSelection = selectedCount > 0;

  return (
    <VStack spacing={14}>
      <HStack spacing={12}>
        <SwiftUIButton
          label="Cancel"
          // systemImage="xmark"
          onPress={onClose}
          modifiers={[controlSize('large'), buttonStyle('glass'), buttonBorderShape('automatic'), disabled(processing)]}
        />
        <Spacer />
        <SwiftText modifiers={[font({weight: 'semibold', size: 22})]}>Shopping</SwiftText>
        <Spacer />

        <ZStack>
          <SwiftUIButton
            label={processing ? '' : 'Finish'}
            onPress={onPrimaryAction}
            modifiers={[
              controlSize('large'),
              buttonStyle('glassProminent'),
              buttonBorderShape('automatic'),
              disabled(!hasSelection || processing),
            ]}
          />
          {processing ? (
            <ProgressView
              modifiers={[progressViewStyle('circular'), buttonBorderShape('automatic'), controlSize('regular')]}
            />
          ) : null}
        </ZStack>
      </HStack>
    </VStack>
  );
}

const styles = StyleSheet.create({
  scrollHost: {
    height: 252,
  },
  scrollView: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 4,
  },
  card: {
    width: '100%',
    minHeight: 104,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    justifyContent: 'space-between',
  },
  cardWrap: {
    width: '48%',
  },
  disabledCard: {
    opacity: 0.5,
  },
  cardTitle: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  cardMeta: {
    fontSize: 22,
    lineHeight: 24,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
});
