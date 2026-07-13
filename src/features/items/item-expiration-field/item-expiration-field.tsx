import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useMemo, useState } from 'react';
import { Platform, StyleSheet, Switch, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { ItemExpirationModePicker } from '../item-expiration-mode-picker/item-expiration-mode-picker';
import { ItemRelativePicker } from './item-relative-picker';

type ExpirationMode = 'manual' | 'relative';

const dayOptions = Array.from({length: 31}, (_, index) => index);
const weekOptions = Array.from({length: 53}, (_, index) => index);
const monthOptions = Array.from({length: 25}, (_, index) => index);

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
  const {colors, isDark} = useAppTheme();

  const resolvedDate = useMemo(() => {
    if (!isEnabled) {
      return '';
    }

    if (mode === 'manual') {
      return toIsoDate(manualDate);
    }

    if (mode === 'relative') {
      return toIsoDate(addRelativeDate(relativeDays, relativeWeeks, relativeMonths));
    }

    return value;
  }, [isEnabled, manualDate, mode, relativeDays, relativeWeeks, relativeMonths, value]);

  useEffect(() => {
    onChange(resolvedDate);
  }, [onChange, resolvedDate]);

  const previewLabel = resolvedDate ? formatDisplayDate(resolvedDate) : 'No expiration date';

  const enableMode = (nextMode: ExpirationMode) => {
    setIsEnabled(true);
    setMode(nextMode);
  };

  const clearExpiration = () => {
    setIsEnabled(false);
  };

  return (
    <View style={styles.card}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleTitle}>EXPIRATION</Text>
        <Switch
          value={isEnabled}
          onValueChange={nextValue => {
            if (nextValue) {
              setIsEnabled(true);
              setMode('manual');
              return;
            }

            clearExpiration();
          }}
        />
      </View>
      {isEnabled ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Selected date</Text>
          <Text style={styles.previewValue}>{previewLabel}</Text>
        </View>
      ) : null}

      {isEnabled ? <ItemExpirationModePicker mode={mode} onChange={enableMode} /> : null}

      {isEnabled && mode === 'manual' ? (
        <View style={[styles.controlBlock, styles.datePickerCard]}>
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
      ) : null}

      {isEnabled && mode === 'relative' ? (
        <View style={styles.controlBlock}>
          <View style={styles.relativeRow}>
            <ItemRelativePicker label="D" value={relativeDays} options={dayOptions} onChange={setRelativeDays} />
            <ItemRelativePicker label="W" value={relativeWeeks} options={weekOptions} onChange={setRelativeWeeks} />
            <ItemRelativePicker label="M" value={relativeMonths} options={monthOptions} onChange={setRelativeMonths} />
          </View>
        </View>
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
      gap: 4,
    },
    previewLabel: {
      color: colors.muted,
      fontSize: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    previewValue: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '800',
    },
    controlBlock: {
      gap: 12,
    },
    datePickerCard: {
      width: '100%',
      alignItems: 'stretch',
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 0,
      paddingVertical: 8,
    },
    datePicker: {
      width: '100%',
      alignSelf: 'stretch',
      marginLeft: 0,
      marginRight: 0,
    },
    relativeRow: {
      flexDirection: 'row',
      gap: 10,
    },
  });
