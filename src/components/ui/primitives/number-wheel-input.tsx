import { Host, Picker, Row, Text } from '@expo/ui';
// import { Picker as NativePicker } from '@react-native-picker/picker';
import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/lib/theme';

type NumberWheelInputProps = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
  disabled?: boolean;
  compact?: boolean;
};

export function NumberWheelInput({value, options, onChange, suffix, disabled = false}: NumberWheelInputProps) {
  const {colors} = useAppTheme();

  return (
    <Host style={{flex: 1, height: 90}}>
      <Row>
        <Picker
          selectedValue={value}
          enabled={!disabled}
          appearance="wheel"
          onValueChange={nextValue => {
            if (typeof nextValue === 'number') {
              onChange(nextValue);
            }
          }}
          // itemStyle={[compact ? styles.pickerItemCompact : styles.pickerItem, {color: colors.text}]}
          // style={[compact ? styles.pickerCompact : styles.picker, {color: colors.text}]}
        >
          {options.map(option => (
            <Picker.Item key={option} label={String(option)} value={option} />
          ))}
        </Picker>
        <Text textStyle={[styles.footerText, {color: colors.muted}] as never}>{suffix}</Text>
      </Row>
    </Host>
  );
}

const styles = StyleSheet.create({
  footer: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 2,
    paddingBottom: 10,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
