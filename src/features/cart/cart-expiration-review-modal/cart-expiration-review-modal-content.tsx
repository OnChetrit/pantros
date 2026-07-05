import { BottomSheet } from '@expo/ui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Text, View } from 'react-native';

import { createBottomSheetModifiers } from '@/components/sheets/sheet-presets/sheet-presets';
import type { PantryItem } from '@/domain/models';
import { ItemExpirationModePicker } from '@/features/items/item-expiration-mode-picker/item-expiration-mode-picker';

import { ActionButton } from './cart-expiration-review-modal-action-button';
import { RelativePicker } from './cart-expiration-review-modal-relative-picker';
import {
  addRelativeDate,
  type AppThemeColors,
  type CartExpirationReviewModalProps,
  dayOptions,
  type ExpirationMode,
  formatExpiration,
  initialRelativeState,
  monthOptions,
  parseIsoDate,
  startOfDay,
  styles,
  toIsoDate,
  weekOptions,
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
  const isSingleItemReview = totalSteps <= 1;

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

  const sheetModifiers = useMemo(() => createBottomSheetModifiers(), []);

  return (
    <BottomSheet isPresented={visible} onDismiss={onCancel} modifiers={sheetModifiers}>
      <View style={styles.sheet}>
        <View style={styles.header}>
          <Text style={[styles.title, {color: colors.text}]}>{item.name}</Text>
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
              onValueChange={(_, selectedDate) => {
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
          <View style={styles.relativeInlineRow}>
            <RelativePicker shortLabel="D" value={relativeDays} options={dayOptions} onChange={setRelativeDays} />
            <RelativePicker shortLabel="W" value={relativeWeeks} options={weekOptions} onChange={setRelativeWeeks} />
            <RelativePicker shortLabel="M" value={relativeMonths} options={monthOptions} onChange={setRelativeMonths} />
          </View>
        )}

        {errorMessage ? <Text style={[styles.error, {color: colors.danger}]}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <ActionButton
            label={isSingleItemReview ? 'Save' : step >= totalSteps ? 'Save & Finish' : 'Save & Next'}
            primary
            disabled={processing}
            onPress={onSave}
          />
          <ActionButton
            label={isSingleItemReview ? 'Skip' : step >= totalSteps ? 'Skip & Finish' : 'Skip'}
            disabled={processing}
            onPress={onSkip}
          />
          <ActionButton label="Cancel review" subtle disabled={processing} onPress={onCancel} />
        </View>
      </View>
    </BottomSheet>
  );
}
