import { Host, Picker, Text } from '@expo/ui/swift-ui';
import { pickerStyle, tag } from '@expo/ui/swift-ui/modifiers';

import type { ThemePreference } from '@/lib/theme';

const THEME_OPTIONS: Array<{label: string; value: ThemePreference}> = [
  {label: 'Device', value: 'device'},
  {label: 'Light', value: 'light'},
  {label: 'Dark', value: 'dark'},
];

type ThemePreferenceSelectorProps = {
  value: ThemePreference;
  onChange: (preference: ThemePreference) => void;
};

export function ThemePreferenceSelector({value, onChange}: ThemePreferenceSelectorProps) {
  return (
    <Host matchContents>
      <Picker
        selection={value}
        onSelectionChange={selection => onChange(selection as ThemePreference)}
        modifiers={[pickerStyle('menu')]}
      >
        {THEME_OPTIONS.map(option => (
          <Text key={option.value} modifiers={[tag(option.value)]}>
            {option.label}
          </Text>
        ))}
      </Picker>
    </Host>
  );
}
