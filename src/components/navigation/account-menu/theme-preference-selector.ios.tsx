import { Host, Picker } from '@expo/ui';
import { StyleSheet, Text, View } from 'react-native';

import type { ThemePreference } from '@/lib/theme';
import { useAppTheme, useThemedStyles } from '@/lib/theme';

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
  const styles = useThemedStyles(createStyles);
  const {colors} = useAppTheme();

  return (
    <View style={styles.row}>
      <Text style={styles.label}>Appearance</Text>
      <Host matchContents seedColor={colors.text}>
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
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    row: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    label: {
      flex: 1,
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
  });
