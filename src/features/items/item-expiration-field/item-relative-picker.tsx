import { Picker } from '@react-native-picker/picker';
import { StyleSheet, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/lib/theme';
import { Host } from '@expo/ui';
import { Text as SwiftUIText, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, textCase } from '@expo/ui/swift-ui/modifiers';

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
  const {colors} = useAppTheme();

  return (
    <Host style={styles.relativePicker}>
      <VStack alignment="center">
        <SwiftUIText
          modifiers={[font({weight: 'bold', size: 14}), foregroundStyle(colors.muted), textCase('uppercase')]}
        >
          {label.substring(0, 1)}
        </SwiftUIText>
        <Picker
          selectedValue={value}
          onValueChange={nextValue => {
            if (typeof nextValue === 'number') {
              onChange(nextValue);
            }
          }}
          itemStyle={styles.pickerItem}
          style={styles.picker}
        >
          {options.map(option => (
            <Picker.Item key={option} label={String(option)} value={option} />
          ))}
        </Picker>
      </VStack>
    </Host>
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

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    relativePicker: {
      flex: 1,
      minWidth: 0,
      borderRadius: 18,
    },
    picker: {
      flex: 1,
      color: colors.text,
    },
    pickerItem: {
      color: colors.text,
      fontSize: 18,
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
