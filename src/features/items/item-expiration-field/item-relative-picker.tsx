import { StyleSheet, View } from 'react-native';

import { NumberWheelInput } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

type ItemRelativePickerProps = {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

export type RelativeDatePickerRowProps = {
  days: number;
  weeks: number;
  months: number;
  dayOptions: number[];
  weekOptions: number[];
  monthOptions: number[];
  onChangeDays: (value: number) => void;
  onChangeWeeks: (value: number) => void;
  onChangeMonths: (value: number) => void;
};

export function ItemRelativePicker({label, value, options, onChange}: ItemRelativePickerProps) {
  const styles = useThemedStyles(createStyles);
  const suffix = label.substring(0, 1);

  return (
    <View style={styles.relativePicker}>
      <NumberWheelInput value={value} options={options} onChange={onChange} suffix={suffix} pickerWidth={56} />
    </View>
  );
}

export function RelativeDatePickerRow({
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
  return (
    <View style={rowStyles.row}>
      <ItemRelativePicker label="Days" value={days} options={dayOptions} onChange={onChangeDays} />
      <ItemRelativePicker label="Weeks" value={weeks} options={weekOptions} onChange={onChangeWeeks} />
      <ItemRelativePicker label="Months" value={months} options={monthOptions} onChange={onChangeMonths} />
    </View>
  );
}

export function formatRelativeDuration(days: number, weeks: number, months: number) {
  const totalDays = months * 30 + weeks * 7 + days;

  if (totalDays < 7) {
    return `${Math.max(0, totalDays)}D`;
  }

  if (totalDays < 30) {
    return `${Math.floor(totalDays / 7)}W`;
  }

  return `${Math.floor(totalDays / 30)}M`;
}

export function relativeDurationInDays(days: number, weeks: number, months: number) {
  return months * 30 + weeks * 7 + days;
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    relativePicker: {
      flex: 1,
      minWidth: 0,
      // height: 80,
      borderRadius: 18,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      overflow: 'hidden',
    },
  });

const rowStyles = StyleSheet.create({
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
});
