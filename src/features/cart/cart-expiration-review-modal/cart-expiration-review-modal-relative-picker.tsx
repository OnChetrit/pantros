import { NumberWheelInput } from '@/components/ui/primitives';
import { StyleSheet, View } from 'react-native';

type RelativePickerProps = {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

export function RelativePicker({value, options, onChange}: RelativePickerProps) {
  return (
    <View style={styles.container}>
      <NumberWheelInput value={value} options={options} onChange={onChange} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minWidth: 0,
  },
});
