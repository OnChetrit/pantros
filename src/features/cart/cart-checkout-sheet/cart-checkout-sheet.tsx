import { BottomSheet } from '@expo/ui';
import { presentationBackgroundInteraction } from '@expo/ui/swift-ui/modifiers';
import { useMemo } from 'react';

import type { PantryItem } from '@/domain/models';

import { CartCheckoutBar } from '../cart-checkout-bar/cart-checkout-bar-content';
import type { CartCheckoutBarProps } from '../cart-checkout-bar/cart-checkout-bar.shared';

export function CartCheckoutSheet({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
  onSecondaryAction,
  selectedItems: _selectedItems,
  onPressSelectedItem: _onPressSelectedItem,
  isPresented,
  onDismiss,
}: CartCheckoutBarProps & {
  selectedItems?: PantryItem[];
  onPressSelectedItem?: (itemId: string) => void;
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
