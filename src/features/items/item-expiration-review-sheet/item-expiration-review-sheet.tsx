import type { PantryItem } from '@/domain/models';

type ItemExpirationReviewSheetProps = {
  visible: boolean;
  item: PantryItem | null;
  reviewDate: string;
  processing: boolean;
  errorMessage: string | null;
  onChangeDate: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
};

export function ItemExpirationReviewSheet({
  visible,
  item,
}: ItemExpirationReviewSheetProps) {
  if (!visible || !item) {
    return null;
  }

  return null;
}
