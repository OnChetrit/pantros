import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles, type ButtonProps } from './shared/primitives.shared';

export function AppButton({label, onPress, variant = 'primary', disabled}: ButtonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        pressed || disabled ? styles.buttonPressed : null,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}
