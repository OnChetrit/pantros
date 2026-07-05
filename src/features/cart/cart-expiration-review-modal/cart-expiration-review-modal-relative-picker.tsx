import { Picker as NativePicker } from '@react-native-picker/picker';
import { Text, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';
import { styles } from './cart-expiration-review-modal.shared';

type RelativePickerProps = {
  shortLabel: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

export function RelativePicker({
  shortLabel,
  value,
  options,
  onChange,
}: RelativePickerProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.relativeInlineInput, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <NativePicker
        selectedValue={value}
        onValueChange={nextValue => {
          if (typeof nextValue === 'number') {
            onChange(nextValue);
          }
        }}
        itemStyle={[styles.relativeInlinePickerItem, { color: colors.text }]}
        style={[styles.relativeInlinePicker, { color: colors.text }]}
      >
        {options.map(amount => (
          <NativePicker.Item key={amount} label={String(amount)} value={amount} />
        ))}
      </NativePicker>
      <Text style={[styles.relativeInlineSuffix, { color: colors.text }]}>{shortLabel}</Text>
    </View>
  );
}
