import type { PantryItemRowProps } from '../pantry-item-row/pantry-item-row.shared';
import { PantryItemSwipeRow } from '../pantry-item-swipe-row/pantry-item-swipe-row.ios';

export function PantryItemNativeListRow(props: PantryItemRowProps) {
  return <PantryItemSwipeRow {...props} nativeListItem />;
}
