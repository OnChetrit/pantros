import type { PantryItemRowProps } from '../pantry-item-row/pantry-item-row.shared';
import { PantryItemRow } from '../pantry-item-row/pantry-item-row';

export function PantryItemNativeListRow(props: PantryItemRowProps) {
  return <PantryItemRow {...props} />;
}
