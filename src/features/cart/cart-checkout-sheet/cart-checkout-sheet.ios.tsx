import { BottomSheet, Group, Host } from '@expo/ui/swift-ui';
import {
  frame,
  padding,
  presentationBackgroundInteraction,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers';

import { CartCheckoutBar } from '../cart-checkout-bar/cart-checkout-bar-content';
import type { CartCheckoutBarProps } from '../cart-checkout-bar/cart-checkout-bar.shared';

export function CartCheckoutSheet({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
  onSecondaryAction,
  isPresented,
  onDismiss,
}: CartCheckoutBarProps & {
  isPresented: boolean;
  onDismiss: () => void;
}) {
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
        fitToContents
      >
        <Group
          modifiers={[
            frame({maxWidth: Infinity, minHeight: 200, alignment: 'topLeading'}),
            padding({top: 16, leading: 16, trailing: 16, bottom: 16}),
            presentationDragIndicator('visible'),
            presentationBackgroundInteraction('enabled'),
          ]}
        >
          <CartCheckoutBar
            selectedCount={selectedCount}
            totalCount={totalCount}
            processing={processing}
            onSubmit={onSubmit}
            onSecondaryAction={onSecondaryAction}
            sheet
          />
        </Group>
      </BottomSheet>
    </Host>
  );
}
