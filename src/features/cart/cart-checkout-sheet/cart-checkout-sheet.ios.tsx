import { RNHostView } from '@expo/ui';
import { BottomSheet, Button, Group, HStack, Host, VStack } from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  padding,
  presentationBackgroundInteraction,
  presentationDetents
} from '@expo/ui/swift-ui/modifiers';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { PantryItem } from '@/domain/models';
import { useAppTheme } from '@/lib/theme';

import type { CartCheckoutBarProps } from '../cart-checkout-bar/cart-checkout-bar.shared';

export function CartCheckoutSheet({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
  onSecondaryAction,
  selectedItems,
  onPressSelectedItem,
  isPresented,
  onDismiss,
}: CartCheckoutBarProps & {
  selectedItems: PantryItem[];
  onPressSelectedItem: (itemId: string) => void;
  isPresented: boolean;
  onDismiss: () => void;
}) {
  const {colors} = useAppTheme();
  const hasSelection = selectedCount > 0;
  const secondaryLabel = hasSelection && selectedCount === totalCount ? 'Clear' : 'Select All';

  return (
    <Host>
      <BottomSheet
        isPresented={isPresented}
        onIsPresentedChange={presented => {
          if (!presented) {
            onDismiss();
          }
        }}
        onDismiss={onDismiss}
      >
        <Group modifiers={[presentationBackgroundInteraction('enabled'), presentationDetents([{fraction: 0.4}])]}>
          <VStack spacing={18} modifiers={[padding({top: 18, leading: 16, trailing: 16, bottom: 16})]}>
            <RNHostView>
              <View style={styles.contentBlock}>
                <View style={styles.headerRow}>
                  <Text numberOfLines={1} style={[styles.title, {color: colors.text}]}>
                    Shopping
                  </Text>
                  <View
                    style={[
                      styles.countPill,
                      {
                        backgroundColor: colors.background,
                        borderColor: colors.borderStrong,
                      },
                    ]}
                  >
                    <Text style={[styles.countText, {color: colors.tint}]}>
                      {selectedCount}/{totalCount}
                    </Text>
                  </View>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.selectedStripContent}
                >
                  {selectedItems.map(item => (
                    <Pressable
                      key={item.id}
                      disabled={processing}
                      onPress={() => onPressSelectedItem(item.id)}
                      style={({pressed}) => [
                        styles.selectedChip,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                          opacity: pressed || processing ? 0.72 : 1,
                        },
                      ]}
                    >
                      <Text numberOfLines={1} style={[styles.selectedChipTitle, {color: colors.text}]}>
                        {item.name}
                      </Text>
                      <Text style={[styles.selectedChipMeta, {color: colors.muted}]}>
                        {item.quantity} item{item.quantity === 1 ? '' : 's'}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>
            </RNHostView>

            <HStack spacing={12}>
              <Button
                label={secondaryLabel}
                onPress={onSecondaryAction}
                modifiers={[
                  disabled(processing),
                  controlSize('large'),
                  buttonStyle('glass'),
                  buttonBorderShape('roundedRectangle', 18),
                ]}
              />
              <Button
                label={processing ? 'Moving…' : 'Finish'}
                onPress={onSubmit}
                modifiers={[
                  disabled(!hasSelection || processing),
                  controlSize('large'),
                  buttonStyle('glassProminent'),
                  buttonBorderShape('roundedRectangle', 18),
                ]}
              />
            </HStack>
          </VStack>
        </Group>
      </BottomSheet>
    </Host>
  );
}

const styles = StyleSheet.create({
  contentBlock: {
    gap: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    flex: 1,
  },
  countPill: {
    minWidth: 70,
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    fontSize: 18,
    lineHeight: 20,
    fontWeight: '800',
  },
  selectedStripContent: {
    gap: 10,
    paddingVertical: 2,
    paddingRight: 2,
  },
  selectedChip: {
    width: 156,
    minHeight: 84,
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'space-between',
  },
  selectedChipTitle: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  selectedChipMeta: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '600',
  },
});
