import { SegmentedControl } from '@expo/ui/community/segmented-control';

import type { AddItemDestination } from '@/domain/models';

import type { AddItemDestinationPickerProps } from './add-item-destination-picker.types';

export function AddItemDestinationPicker({value, disabled = false, onChange}: AddItemDestinationPickerProps) {
  return (
    <SegmentedControl
      style={{width: 168}}
      values={['Pantry', 'Cart']}
      selectedIndex={value === 'pantry' ? 0 : 1}
      enabled={!disabled}
      onValueChange={selection => onChange((selection === 'Cart' ? 'cart' : 'pantry') as AddItemDestination)}
    />
  );
}
