import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

type ExpirationMode = 'manual' | 'relative';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

export function ItemExpirationModePicker({mode, onChange}: ItemExpirationModePickerProps) {
  return (
    <Host matchContents>
      <Picker
        selection={mode}
        onSelectionChange={selection => onChange(selection as ExpirationMode)}
        modifiers={[pickerStyle('segmented')]}
      >
        <Text modifiers={[tag('manual')]}>Manual</Text>
        <Text modifiers={[tag('relative')]}>Relative</Text>
      </Picker>
    </Host>
  );
}
