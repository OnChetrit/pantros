import { Host, RNHostView, Row } from '@expo/ui';
import { Pressable, StyleSheet, Text } from 'react-native';

import type { ThemePreference } from '@/lib/theme';
import { useThemedStyles } from '@/lib/theme';

const THEME_OPTIONS: ThemePreference[] = ['device', 'light', 'dark'];

type ThemePreferenceSelectorProps = {
  value: ThemePreference;
  onChange: (preference: ThemePreference) => void;
};

export function ThemePreferenceSelector({value, onChange}: ThemePreferenceSelectorProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Host style={styles.themeSwitch}>
      <Row spacing={8}>
        {THEME_OPTIONS.map(option => (
          <RNHostView key={option} matchContents>
            <Pressable
              onPress={() => onChange(option)}
              style={({pressed}) => [
                styles.themeChip,
                value === option ? styles.themeChipActive : null,
                pressed ? styles.themeChipPressed : null,
              ]}
            >
              <Text style={[styles.themeChipText, value === option ? styles.themeChipTextActive : null]}>
                {option === 'device' ? 'Device' : option === 'light' ? 'Light' : 'Dark'}
              </Text>
            </Pressable>
          </RNHostView>
        ))}
      </Row>
    </Host>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    themeSwitch: {
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
