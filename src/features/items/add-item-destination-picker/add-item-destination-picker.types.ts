import type { AddItemDestination } from '@/domain/models';

export type AddItemDestinationPickerProps = {
  value: AddItemDestination;
  disabled?: boolean;
  onChange: (value: AddItemDestination) => void;
};
