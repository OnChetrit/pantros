import { Picker as NativePicker } from '@react-native-picker/picker';
import { StyleSheet, View, Text } from 'react-native';

import { useAppTheme } from '@/lib/theme';

type NumberWheelInputProps = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  suffix?: string;
  disabled?: boolean;
  compact?: boolean;
};

export function NumberWheelInput({
  value,
  options,
  onChange,
  suffix,
  disabled = false,
  compact = false,
}: NumberWheelInputProps) {
  const {colors} = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <NativePicker
          selectedValue={value}
          enabled={!disabled}
          onValueChange={nextValue => {
            if (typeof nextValue === 'number') {
              onChange(nextValue);
            }
          }}
          itemStyle={[
            compact ? styles.pickerItemCompact : styles.pickerItem,
            {color: disabled ? colors.muted : colors.text},
          ]}
          style={[
            compact ? styles.pickerCompact : styles.picker,
            {color: disabled ? colors.muted : colors.text, opacity: disabled ? 0.5 : 1},
          ]}
        >
          {options.map(option => (
            <NativePicker.Item key={option} label={String(option)} value={option} />
          ))}
        </NativePicker>
        {suffix ? <Text style={[styles.suffixText, {color: colors.muted}]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 120,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    flex: 1,
    height: 140,
  },
  pickerCompact: {
    flex: 1,
    height: 110,
  },
  pickerItem: {
    fontSize: 28,
  },
  pickerItemCompact: {
    fontSize: 24,
  },
  suffixText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 24,
  },
});
