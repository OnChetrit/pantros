import type { PantryItemRowProps } from '../pantry-item-row/pantry-item-row.shared';

import { PantryItemSwipeRow } from '../pantry-item-swipe-row/pantry-item-swipe-row.ios';

export { PantryItemNativeListRow } from '../pantry-item-native-list-row/pantry-item-native-list-row.ios';

export function PantryItemRow(props: PantryItemRowProps) {
  return <PantryItemSwipeRow {...props} />;
}
