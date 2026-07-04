import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import type { PantryItem } from '@/domain/models';
import { ItemExpirationModePicker } from '@/features/items/item-expiration-mode-picker';

import { ActionButton } from './cart-expiration-review-modal-action-button';
import { RelativePicker } from './cart-expiration-review-modal-relative-picker';
import {
  addRelativeDate,
  dayOptions,
  type ExpirationMode,
  formatExpiration,
  initialRelativeState,
  monthOptions,
  parseIsoDate,
  styles,
  toIsoDate,
  type CartExpirationReviewModalProps,
  type AppThemeColors,
  weekOptions,
  startOfDay,
} from './cart-expiration-review-modal.shared';

export function ReviewModalContent({
  item,
  visible,
  step,
  totalSteps,
  reviewDate,
  processing,
  errorMessage,
  onChangeDate,
  onSave,
  onSkip,
  onCancel,
  colors,
  isDark,
}: CartExpirationReviewModalProps & {
  item: PantryItem;
  colors: AppThemeColors;
  isDark: boolean;
}) {
  const [mode, setMode] = useState<ExpirationMode>('manual');
  const [manualDate, setManualDate] = useState(() => parseIsoDate(reviewDate) ?? startOfDay(new Date()));
  const [relativeDays, setRelativeDays] = useState(() => initialRelativeState(reviewDate).days);
  const [relativeWeeks, setRelativeWeeks] = useState(() => initialRelativeState(reviewDate).weeks);
  const [relativeMonths, setRelativeMonths] = useState(() => initialRelativeState(reviewDate).months);

  const resolvedDate = useMemo(() => {
    if (mode === 'manual') {
      return toIsoDate(manualDate);
    }

    return toIsoDate(addRelativeDate(relativeDays, relativeWeeks, relativeMonths));
  }, [manualDate, mode, relativeDays, relativeWeeks, relativeMonths]);

  useEffect(() => {
    if (resolvedDate !== reviewDate) {
      onChangeDate(resolvedDate);
    }
  }, [onChangeDate, resolvedDate, reviewDate]);

  const isLastStep = step >= totalSteps;

  return (
    <BottomSheetModal visible={visible} onClose={onCancel} sheetStyle={[styles.sheet, {backgroundColor: colors.card}]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, {color: colors.muted}]}>
          Review {step} of {totalSteps}
        </Text>
        <Text style={[styles.title, {color: colors.text}]}>{item.name}</Text>
        <Text style={[styles.subtitle, {color: colors.muted}]}>
          Current expiration: {formatExpiration(item.expirationDate)}
        </Text>
      </View>

      <View style={[styles.previewCard, {backgroundColor: colors.background, borderColor: colors.border}]}>
        <Text style={[styles.previewLabel, {color: colors.muted}]}>Selected date</Text>
        <Text style={[styles.previewValue, {color: colors.text}]}>{formatExpiration(reviewDate)}</Text>
      </View>

      <ItemExpirationModePicker mode={mode} onChange={setMode} />

      {mode === 'manual' ? (
        <View style={[styles.dateCard, {backgroundColor: colors.background, borderColor: colors.border}]}>
          <DateTimePicker
            value={manualDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
              if (selectedDate) {
                setManualDate(selectedDate);
              }
            }}
            themeVariant={isDark ? 'dark' : 'light'}
            accentColor={colors.tint}
            textColor={colors.text}
            style={styles.datePicker}
          />
        </View>
      ) : (
        <View style={styles.relativeRow}>
          <RelativePicker label="Days" value={relativeDays} options={dayOptions} onChange={setRelativeDays} />
          <RelativePicker label="Weeks" value={relativeWeeks} options={weekOptions} onChange={setRelativeWeeks} />
          <RelativePicker label="Months" value={relativeMonths} options={monthOptions} onChange={setRelativeMonths} />
        </View>
      )}

      {errorMessage ? <Text style={[styles.error, {color: colors.danger}]}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <ActionButton label={isLastStep ? 'Save & Finish' : 'Save & Next'} primary disabled={processing} onPress={onSave} />
        <ActionButton label={isLastStep ? 'Skip & Finish' : 'Skip'} disabled={processing} onPress={onSkip} />
        <ActionButton label="Cancel review" subtle disabled={processing} onPress={onCancel} />
      </View>
    </BottomSheetModal>
  );
}
