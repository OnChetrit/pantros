import { Picker as NativePicker } from '@react-native-picker/picker';
import { Text, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

import { styles } from './cart-expiration-review-modal.shared';

export function RelativePicker({
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
  const {colors} = useAppTheme();

  return (
    <View style={[styles.relativePicker, {backgroundColor: colors.background, borderColor: colors.border}]}>
      <Text style={[styles.relativeLabel, {color: colors.muted}]}>{label}</Text>
      <NativePicker
        selectedValue={value}
        onValueChange={nextValue => {
          if (typeof nextValue === 'number') {
            onChange(nextValue);
          }
        }}
        itemStyle={[styles.pickerItem, {color: colors.text}]}
        style={[styles.picker, {color: colors.text}]}
      >
        {options.map(amount => (
          <NativePicker.Item key={amount} label={String(amount)} value={amount} />
        ))}
      </NativePicker>
    </View>
  );
}
