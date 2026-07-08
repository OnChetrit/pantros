import { Host, Picker } from '@expo/ui';

type ExpirationMode = 'manual' | 'relative';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

export function ItemExpirationModePicker({mode, onChange}: ItemExpirationModePickerProps) {
  return (
    <Host matchContents>
      <Picker
        selectedValue={mode}
        onValueChange={selection => onChange(selection as ExpirationMode)}
        appearance="menu"
      >
        <Picker.Item label="Manual" value="manual" />
        <Picker.Item label="Relative" value="relative" />
      </Picker>
    </Host>
  );
}
