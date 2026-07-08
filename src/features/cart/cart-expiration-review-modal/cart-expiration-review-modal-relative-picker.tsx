import { NumberWheelInput } from '@/components/ui/primitives';

type RelativePickerProps = {
  label: string;
  value: number;
  options: number[];
  onChange: (value: number) => void;
};

export function RelativePicker({value, options, onChange}: RelativePickerProps) {
  return <NumberWheelInput value={value} options={options} onChange={onChange} />;
}
