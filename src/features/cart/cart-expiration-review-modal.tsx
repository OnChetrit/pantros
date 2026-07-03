import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import type { PantryItem } from '@/domain/models';
import { useAppTheme } from '@/lib/theme';
import { ItemExpirationModePicker } from '@/features/items/item-expiration-mode-picker';

type CartExpirationReviewModalProps = {
  visible: boolean;
  item: PantryItem | null;
  step: number;
  totalSteps: number;
  reviewDate: string;
  processing: boolean;
  errorMessage: string | null;
  onChangeDate: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onCancel: () => void;
};

type ExpirationMode = 'manual' | 'relative';

const dayOptions = Array.from({ length: 31 }, (_, index) => index);
const weekOptions = Array.from({ length: 53 }, (_, index) => index);
const monthOptions = Array.from({ length: 25 }, (_, index) => index);

function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

function parseIsoDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(value: Date) {
  return startOfDay(value).toISOString().split('T')[0]!;
}

function addRelativeDate(days: number, weeks: number, months: number) {
  const next = startOfDay(new Date());

  next.setMonth(next.getMonth() + months);
  next.setDate(next.getDate() + weeks * 7 + days);

  return next;
}

function initialRelativeState(value: string) {
  const parsed = parseIsoDate(value);

  if (!parsed) {
    return { days: 0, weeks: 0, months: 0 };
  }

  const diffMs = startOfDay(parsed).getTime() - startOfDay(new Date()).getTime();
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const months = Math.min(24, Math.floor(diffDays / 30));
  const daysAfterMonths = diffDays - months * 30;
  const weeks = Math.min(52, Math.floor(daysAfterMonths / 7));
  const days = Math.min(30, daysAfterMonths - weeks * 7);

  return { days, weeks, months };
}

function formatExpiration(value: string | null) {
  if (!value) {
    return 'No expiration saved';
  }

  const parsed = parseIsoDate(value);

  if (!parsed) {
    return 'Expiration needs review';
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

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
  const { colors, isDark } = useAppTheme();
  if (!item) {
    return null;
  }

  return (
    <ReviewModalContent
      key={item.id}
      visible={visible}
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

function ReviewModalContent({
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
  colors: ReturnType<typeof useAppTheme>['colors'];
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
    <BottomSheetModal visible={visible} onClose={onCancel} sheetStyle={[styles.sheet, { backgroundColor: colors.card }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: colors.muted }]}>
          Review {step} of {totalSteps}
        </Text>
        <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Current expiration: {formatExpiration(item.expirationDate)}
        </Text>
      </View>

      <View style={[styles.previewCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
        <Text style={[styles.previewLabel, { color: colors.muted }]}>Selected date</Text>
        <Text style={[styles.previewValue, { color: colors.text }]}>{formatExpiration(reviewDate)}</Text>
      </View>

      <ItemExpirationModePicker mode={mode} onChange={setMode} />

      {mode === 'manual' ? (
        <View style={[styles.dateCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
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
          <RelativePicker
            label="Days"
            value={relativeDays}
            options={dayOptions}
            onChange={setRelativeDays}
          />
          <RelativePicker
            label="Weeks"
            value={relativeWeeks}
            options={weekOptions}
            onChange={setRelativeWeeks}
          />
          <RelativePicker
            label="Months"
            value={relativeMonths}
            options={monthOptions}
            onChange={setRelativeMonths}
          />
        </View>
      )}

      {errorMessage ? <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <ActionButton
          label={isLastStep ? 'Save & Finish' : 'Save & Next'}
          primary
          disabled={processing}
          onPress={onSave}
        />
        <ActionButton
          label={isLastStep ? 'Skip & Finish' : 'Skip'}
          disabled={processing}
          onPress={onSkip}
        />
        <ActionButton label="Cancel review" subtle disabled={processing} onPress={onCancel} />
      </View>
    </BottomSheetModal>
  );
}

function RelativePicker({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.relativePicker, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.relativeLabel, { color: colors.muted }]}>{label}</Text>
      <NativePicker
        selectedValue={value}
        onValueChange={(nextValue) => {
          if (typeof nextValue === 'number') {
            onChange(nextValue);
          }
        }}
        itemStyle={[styles.pickerItem, { color: colors.text }]}
        style={[styles.picker, { color: colors.text }]}
      >
        {options.map((amount) => (
          <NativePicker.Item key={amount} label={String(amount)} value={amount} />
        ))}
      </NativePicker>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled: isDisabled,
  primary = false,
  subtle = false,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  primary?: boolean;
  subtle?: boolean;
}) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: subtle ? 'transparent' : primary ? colors.tint : colors.tintSoft,
          borderColor: subtle ? colors.border : primary ? colors.tint : colors.borderStrong,
          opacity: isDisabled || pressed ? 0.55 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: subtle ? colors.muted : primary ? colors.textInverse : colors.tint,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  previewLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewValue: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  dateCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    overflow: 'hidden',
  },
  datePicker: {
    alignSelf: 'stretch',
  },
  relativeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  relativePicker: {
    flex: 1,
    minHeight: 156,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    justifyContent: 'center',
  },
  relativeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  picker: {
    flex: 1,
  },
  pickerItem: {
    fontSize: 18,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actions: {
    gap: 10,
    paddingTop: 4,
  },
  button: {
    minHeight: 52,
    paddingHorizontal: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
});
