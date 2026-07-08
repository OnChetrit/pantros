import { Host, Picker } from '@expo/ui';

import type { ThemePreference } from '@/lib/theme';

const THEME_OPTIONS: {label: string; value: ThemePreference}[] = [
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
        selectedValue={value}
        onValueChange={selection => onChange(selection as ThemePreference)}
        appearance="menu"
      >
        {THEME_OPTIONS.map(option => (
          <Picker.Item key={option.value} label={option.label} value={option.value} />
        ))}
      </Picker>
    </Host>
  );
}
