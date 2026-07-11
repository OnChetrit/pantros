import { Button } from '@expo/ui';
import { BottomSheet, Button as SwiftUIButton, Group, HStack, Host, ProgressView, Spacer, Text, VStack, ZStack } from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  frame,
  interactiveDismissDisabled,
  lineLimit,
  multilineTextAlignment,
  padding,
  presentationBackgroundInteraction,
  presentationDetents,
  progressViewStyle,
} from '@expo/ui/swift-ui/modifiers';

import type { PantryItem } from '@/domain/models';

import type { CartCheckoutBarProps } from '../cart-checkout-bar/cart-checkout-bar.shared';

export function CartCheckoutSheet({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
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
        <Group
          modifiers={[
            presentationBackgroundInteraction('enabled'),
            presentationDetents([{fraction: 0.4}]),
            interactiveDismissDisabled(processing),
            padding({top: 12, leading: 16, trailing: 16, bottom: 16}),
          ]}
        >
          <VStack spacing={18}>
            <ZStack modifiers={[frame({maxWidth: 9999})]}>
              <Text
                modifiers={[
                  font({weight: 'semibold', size: 17}),
                  lineLimit(1),
                  multilineTextAlignment('center'),
                  frame({maxWidth: 9999}),
                ]}
              >
                Shopping
              </Text>

              <HStack spacing={12} modifiers={[frame({maxWidth: 9999})]}>
                <SwiftUIButton
                  label=""
                  systemImage="xmark"
                  onPress={onDismiss}
                  modifiers={[
                    controlSize('large'),
                    buttonStyle('glass'),
                    buttonBorderShape('circle'),
                    disabled(processing),
                    frame({width: 44, height: 44}),
                  ]}
                />
                <Spacer />
                <ZStack modifiers={[frame({width: 44, height: 44})]}>
                  <SwiftUIButton
                    label=""
                    systemImage={processing ? undefined : 'checkmark'}
                    onPress={onSubmit}
                    modifiers={[
                      controlSize('large'),
                      buttonStyle('glassProminent'),
                      buttonBorderShape('circle'),
                      disabled(!hasSelection || processing),
                      frame({width: 44, height: 44}),
                    ]}
                  />
                  {processing ? (
                    <ProgressView modifiers={[progressViewStyle('circular'), controlSize('regular')]} />
                  ) : null}
                </ZStack>
              </HStack>
            </ZStack>

            <VStack spacing={12}>
              <Text modifiers={[font({weight: 'semibold', size: 15}), foregroundStyle('secondaryLabel')]}>
                {`${selectedCount} of ${totalCount} selected`}
              </Text>

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
          </VStack>
        </Group>
      </BottomSheet>
    </Host>
  );
}
