import { useAppTheme } from '@/lib/theme';

import { ReviewModalContent } from './cart-expiration-review-modal-content';
import type { CartExpirationReviewModalProps } from './cart-expiration-review-modal.shared';

export function CartExpirationReviewModal({
  visible,
  item,
  step,
  totalSteps,
  reviewDate,
  processing,
  errorMessage,
  onChangeDate,
  onSave,
  onSkip,
  onCancel,
}: CartExpirationReviewModalProps) {
  const {colors, isDark} = useAppTheme();

  if (!visible || !item) {
    return null;
  }

  return (
    <ReviewModalContent
      key={item.id}
      item={item}
      step={step}
      totalSteps={totalSteps}
      reviewDate={reviewDate}
      processing={processing}
      errorMessage={errorMessage}
      onChangeDate={onChangeDate}
      onSave={onSave}
      onSkip={onSkip}
      onCancel={onCancel}
      colors={colors}
      isDark={isDark}
    />
  );
}
