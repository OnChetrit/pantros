import { Picker } from '@react-native-picker/picker';
import { StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/lib/theme';
import { Host } from '@expo/ui';
import { HStack } from '@expo/ui/swift-ui';

type ItemRelativePickerProps = {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

export function ItemRelativePicker({label, value, options, onChange}: ItemRelativePickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Host matchContents>
      <HStack alignment="center">
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
        <Text style={styles.relativeLabel}>{label}</Text>
      </HStack>
    </Host>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    relativePicker: {
      flex: 1,
      minHeight: 156,
      borderRadius: 18,
      overflow: 'hidden',
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
    },
    relativeLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      paddingHorizontal: 14,
      paddingTop: 12,
    },
    picker: {
      color: colors.text,
    },
    pickerItem: {
      color: colors.text,
      fontSize: 18,
    },
  });
