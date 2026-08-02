import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

export type AuthMode = 'signin' | 'signup';

type AuthModePickerProps = {
  mode: AuthMode;
  disabled: boolean;
  onChange: (mode: AuthMode) => void;
};

export function AuthModePicker({mode, disabled, onChange}: AuthModePickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {(['signin', 'signup'] as const).map(value => {
        const active = mode === value;

        return (
          <Pressable
            key={value}
            accessibilityRole="button"
            accessibilityState={{disabled, selected: active}}
            disabled={disabled}
            onPress={() => onChange(value)}
            style={({pressed}) => [styles.option, active && styles.activeOption, pressed && styles.pressedOption]}
          >
            <Text style={[styles.optionText, active && styles.activeOptionText]}>
              {value === 'signin' ? 'Sign in' : 'Sign up'}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    gap: 6,
    padding: 4,
    borderRadius: 14,
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
  },
  option: {
    flex: 1,
    minHeight: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  activeOption: {
    backgroundColor: colors.tint,
  },
  pressedOption: {
    opacity: 0.65,
  },
  optionText: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  activeOptionText: {
    color: colors.textInverse,
  },
});
