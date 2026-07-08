import { Button, Host, Text } from '@expo/ui';
import { BottomSheet, Group, HStack, VStack } from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  padding,
  presentationBackgroundInteraction,
  presentationDetents,
} from '@expo/ui/swift-ui/modifiers';

import type { PantryItem } from '@/domain/models';

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
            <VStack spacing={12}>
              <HStack spacing={12}>
                <Text modifiers={[font({weight: 'bold', size: 28})]}>Shopping</Text>
                <Text modifiers={[font({weight: 'bold', size: 18}), foregroundStyle('tint')]}>
                  {`${selectedCount}/${totalCount}`}
                </Text>
              </HStack>

              {selectedItems.map(item => (
                <Button
                  key={item.id}
                  label={`${item.name} • ${item.quantity} item${item.quantity === 1 ? '' : 's'}`}
                  onPress={() => onPressSelectedItem(item.id)}
                  modifiers={[
                    disabled(processing),
                    controlSize('large'),
                    buttonStyle('glass'),
                    buttonBorderShape('roundedRectangle', 18),
                  ]}
                />
              ))}
            </VStack>

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
