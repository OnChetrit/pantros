import WheelPicker from '@quidone/react-native-wheel-picker';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

type NumberWheelInputProps = {
  value: number;
  options: number[];
  onChange: (value: number) => void;
  suffix?: string;
  pickerWidth?: number;
  disabled?: boolean;
};

export function NumberWheelInput({
  value,
  options,
  onChange,
  suffix,
  pickerWidth = 85,
  disabled = false,
}: NumberWheelInputProps) {
  const {colors} = useAppTheme();
  const data = useMemo(() => options.map(option => ({value: option, label: String(option)})), [options]);

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <WheelPicker
          data={data}
          value={value}
          width={pickerWidth}
          itemHeight={36}
          visibleItemCount={3}
          readOnly={disabled}
          enableScrollByTapOnItem
          onValueChanged={({item: {value: nextValue}}) => {
            if (typeof nextValue === 'number') {
              onChange(nextValue);
            }
          }}
          style={disabled ? styles.disabledPicker : undefined}
          itemTextStyle={[styles.pickerItem, {color: disabled ? colors.muted : colors.text}]}
          overlayItemStyle={[styles.overlay, {backgroundColor: colors.tintSoft, borderColor: colors.border}]}
        />
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
  disabledPicker: {
    opacity: 0.5,
  },
  pickerItem: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    borderWidth: 1,
    borderRadius: 8,
  },
  suffixText: {
    fontSize: 13,
    fontWeight: '600',
    minWidth: 24,
  },
});
