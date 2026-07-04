import { BottomSheet } from '@expo/ui';
import { presentationBackgroundInteraction } from '@expo/ui/swift-ui/modifiers';
import { useMemo } from 'react';

import { CartCheckoutBar } from './cart-checkout-bar-content';
import type { CartCheckoutBarProps } from './cart-checkout-bar.shared';

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
  const modifiers = useMemo(() => [presentationBackgroundInteraction('enabled')], []);

  return (
    <BottomSheet isPresented={isPresented} onDismiss={onDismiss} testID="cart-checkout-sheet" modifiers={modifiers}>
      <CartCheckoutBar
        selectedCount={selectedCount}
        totalCount={totalCount}
        processing={processing}
        onSubmit={onSubmit}
        onSecondaryAction={onSecondaryAction}
        sheet
      />
    </BottomSheet>
  );
}
