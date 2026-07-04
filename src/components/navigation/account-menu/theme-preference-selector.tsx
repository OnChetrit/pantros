import { StyleSheet, Text, View, Pressable } from 'react-native';

import type { ThemePreference } from '@/lib/theme';
import { useThemedStyles } from '@/lib/theme';

const THEME_OPTIONS: ThemePreference[] = ['device', 'light', 'dark'];

type ThemePreferenceSelectorProps = {
  value: ThemePreference;
  onChange: (preference: ThemePreference) => void;
};

export function ThemePreferenceSelector({ value, onChange }: ThemePreferenceSelectorProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.themeSwitch}>
      {THEME_OPTIONS.map(option => (
        <Pressable
          key={option}
          onPress={() => onChange(option)}
          style={({ pressed }) => [
            styles.themeChip,
            value === option ? styles.themeChipActive : null,
            pressed ? styles.themeChipPressed : null,
          ]}
        >
          <Text style={[styles.themeChipText, value === option ? styles.themeChipTextActive : null]}>
            {option === 'device' ? 'Device' : option === 'light' ? 'Light' : 'Dark'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    themeSwitch: {
      flexDirection: 'row',
      gap: 8,
      paddingVertical: 4,
    },
    themeChip: {
      flex: 1,
      minHeight: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.input,
    },
    themeChipActive: {
      backgroundColor: colors.tint,
    },
    themeChipPressed: {
      opacity: 0.8,
    },
    themeChipText: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    themeChipTextActive: {
      color: colors.textInverse,
    },
  });
