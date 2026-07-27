import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { NumberWheelInput } from '@/components/ui/primitives/number-wheel-input.android';
import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { ItemExpirationModePicker } from '../item-expiration-mode-picker/item-expiration-mode-picker';
import {
  formatRelativeDuration,
  relativeDurationInDays,
  type RelativeDatePickerRowProps,
} from './item-relative-picker';

type ExpirationMode = 'manual' | 'relative';

const dayOptions = Array.from({length: 31}, (_, index) => index);
const weekOptions = Array.from({length: 53}, (_, index) => index);
const monthOptions = Array.from({length: 25}, (_, index) => index);

function AndroidRelativeDatePickerRow({
  days,
  weeks,
  months,
  dayOptions,
  weekOptions,
  monthOptions,
  onChangeDays,
  onChangeWeeks,
  onChangeMonths,
}: RelativeDatePickerRowProps) {
  const styles = useThemedStyles(createStyles);
  const pickers = [
    {label: 'Days', value: days, options: dayOptions, onChange: onChangeDays},
    {label: 'Weeks', value: weeks, options: weekOptions, onChange: onChangeWeeks},
    {label: 'Months', value: months, options: monthOptions, onChange: onChangeMonths},
  ];

  return (
    <View style={styles.relativeRow}>
      {pickers.map(({label, value, options, onChange}) => (
        <View key={label} style={styles.relativePicker}>
          <NumberWheelInput
            value={value}
            options={options}
            onChange={onChange}
            suffix={label.substring(0, 1)}
            pickerWidth={56}
          />
        </View>
      ))}
    </View>
  );
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(value: Date) {
  return startOfDay(value).toISOString().split('T')[0];
}

function addRelativeDate(days: number, weeks: number, months: number) {
  const next = startOfDay(new Date());
  next.setMonth(next.getMonth() + months);
  next.setDate(next.getDate() + weeks * 7 + days);
  return next;
}

function formatDisplayDate(value: string) {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return 'No expiration date';
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function initialRelativeState(value: string): {days: number; weeks: number; months: number} {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return {days: 0, weeks: 0, months: 0};
  }

  const diffMs = startOfDay(parsed).getTime() - startOfDay(new Date()).getTime();
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const months = Math.min(24, Math.floor(diffDays / 30));
  const daysAfterMonths = diffDays - months * 30;
  const weeks = Math.min(52, Math.floor(daysAfterMonths / 7));
  const days = Math.min(30, daysAfterMonths - weeks * 7);
  return {days, weeks, months};
}

export function ItemExpirationField({value, onChange}: {value: string; onChange: (value: string) => void}) {
  const styles = useThemedStyles(createStyles);
  const initialDate = parseIsoDate(value) ?? startOfDay(new Date());
  const initialRelative = initialRelativeState(value);
  const [isEnabled, setIsEnabled] = useState(Boolean(value));
  const [mode, setMode] = useState<ExpirationMode>('manual');
  const [manualDate, setManualDate] = useState(initialDate);
  const [relativeDays, setRelativeDays] = useState(initialRelative.days);
  const [relativeWeeks, setRelativeWeeks] = useState(initialRelative.weeks);
  const [relativeMonths, setRelativeMonths] = useState(initialRelative.months);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const {colors} = useAppTheme();

  const resolvedDate = useMemo(() => {
    if (!isEnabled) {
      return '';
    }
    if (mode === 'manual') {
      return toIsoDate(manualDate);
    }
    return toIsoDate(addRelativeDate(relativeDays, relativeWeeks, relativeMonths));
  }, [isEnabled, manualDate, mode, relativeDays, relativeWeeks, relativeMonths]);

  useEffect(() => {
    onChange(resolvedDate);
  }, [onChange, resolvedDate]);

  const previewRelativeState =
    mode === 'relative'
      ? {days: relativeDays, weeks: relativeWeeks, months: relativeMonths}
      : initialRelativeState(resolvedDate);
  const previewRelative = formatRelativeDuration(
    previewRelativeState.days,
    previewRelativeState.weeks,
    previewRelativeState.months,
  );
  const isCloseExpiration =
    relativeDurationInDays(previewRelativeState.days, previewRelativeState.weeks, previewRelativeState.months) < 7;

  return (
    <View style={styles.card}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleTitle}>EXPIRATION</Text>
        <Switch
          value={isEnabled}
          onValueChange={nextValue => {
            setIsEnabled(nextValue);
            if (nextValue) {
              setMode('manual');
            } else {
              setShowDatePicker(false);
            }
          }}
        />
      </View>

      {isEnabled ? (
        <>
          <View style={styles.previewCard}>
            <View style={styles.previewRow}>
              <Text style={[styles.previewValue, {color: isCloseExpiration ? colors.warning : colors.tint}]}>
                {formatDisplayDate(resolvedDate)}
              </Text>
              <Text style={[styles.previewRelative, {color: isCloseExpiration ? colors.danger : colors.accent}]}>
                {previewRelative}
              </Text>
            </View>
          </View>

          <ItemExpirationModePicker mode={mode} onChange={nextMode => setMode(nextMode)} />

          {mode === 'manual' ? (
            <View style={styles.datePickerCard}>
              <View style={styles.dateRow}>
                <Text style={[styles.dateValue, {color: colors.text}]}>{formatDisplayDate(resolvedDate)}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Change expiration date"
                  onPress={() => setShowDatePicker(true)}
                  style={({pressed}) => [styles.changeDateButton, pressed ? styles.pressed : null]}
                >
                  <Text style={[styles.changeDateText, {color: colors.tint}]}>Change date</Text>
                </Pressable>
              </View>
              {showDatePicker ? (
                <DateTimePicker
                  value={manualDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowDatePicker(false);
                    if (event.type === 'set' && selectedDate) {
                      setManualDate(selectedDate);
                    }
                  }}
                />
              ) : null}
            </View>
          ) : (
            <AndroidRelativeDatePickerRow
              days={relativeDays}
              weeks={relativeWeeks}
              months={relativeMonths}
              dayOptions={dayOptions}
              weekOptions={weekOptions}
              monthOptions={monthOptions}
              onChangeDays={setRelativeDays}
              onChangeWeeks={setRelativeWeeks}
              onChangeMonths={setRelativeMonths}
            />
          )}
        </>
      ) : null}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    card: {
      borderRadius: 20,
      padding: 12,
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    toggleRow: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    toggleTitle: {
      color: colors.text,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 0.4,
    },
    previewCard: {
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.metric,
      borderWidth: 1,
      borderColor: colors.border,
    },
    previewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    previewValue: {
      flexShrink: 1,
      fontSize: 16,
      fontWeight: '800',
    },
    previewRelative: {
      flexShrink: 0,
      fontSize: 16,
      fontWeight: '800',
    },
    datePickerCard: {
      borderRadius: 18,
      padding: 12,
      gap: 8,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
    },
    relativePicker: {
      flex: 1,
      minWidth: 0,
      borderRadius: 18,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
    relativeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      minWidth: 0,
    },
    dateRow: {
      minHeight: 42,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    dateValue: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
    },
    changeDateButton: {
      minHeight: 38,
      paddingHorizontal: 10,
      justifyContent: 'center',
    },
    changeDateText: {
      fontSize: 14,
      fontWeight: '700',
    },
    pressed: {
      opacity: 0.7,
    },
  });
