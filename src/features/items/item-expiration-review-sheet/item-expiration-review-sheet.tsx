import { useAppTheme } from '@/lib/theme';

import { ReviewModalContent } from '@/features/cart/cart-expiration-review-modal/cart-expiration-review-modal-content';
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
  reviewDate,
  processing,
  errorMessage,
  onChangeDate,
  onSave,
  onCancel,
}: ItemExpirationReviewSheetProps) {
  const {colors, isDark} = useAppTheme();

  if (!visible || !item) {
    return null;
  }

  return (
    <ReviewModalContent
      key={item.id}
      item={item}
      step={1}
      totalSteps={1}
      reviewDate={reviewDate}
      processing={processing}
      errorMessage={errorMessage}
      onChangeDate={onChangeDate}
      onSave={onSave}
      onSkip={onSave}
      onCancel={onCancel}
      colors={colors}
      isDark={isDark}
    />
  );
}
