import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

type NumberWheelInputProps = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  suffix?: string;
  disabled?: boolean;
};

export function NumberWheelInput({value, options, onChange, suffix, disabled = false}: NumberWheelInputProps) {
  const {colors} = useAppTheme();

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Picker
          selectedValue={value}
          enabled={!disabled}
          onValueChange={nextValue => {
            if (typeof nextValue === 'number') {
              onChange(nextValue);
            }
          }}
          itemStyle={[styles.pickerItem, {color: disabled ? colors.muted : colors.text}]}
          style={[styles.picker, {color: disabled ? colors.muted : colors.text, opacity: disabled ? 0.5 : 1}]}
        >
          {options.map(option => (
            <Picker.Item key={option} label={String(option)} value={option} />
          ))}
        </Picker>
        {suffix ? <Text style={[styles.suffixText, {color: colors.muted}]}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    minHeight: 76,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  picker: {
    width: 74,
    height: 74,
    marginTop: -6,
    marginBottom: -6,
    justifyContent: 'center',
  },
  pickerItem: {
    fontSize: 16,
  },
  suffixText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 24,
  },
});
