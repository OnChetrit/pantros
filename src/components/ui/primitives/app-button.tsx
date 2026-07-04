import { Pressable, Text } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles, type ButtonProps } from '../primitives.shared';

export function AppButton({label, onPress, variant = 'primary', disabled}: ButtonProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        variant === 'primary' ? styles.primaryButton : styles.secondaryButton,
        (pressed || disabled) && styles.buttonPressed,
      ]}
    >
      <Text style={variant === 'primary' ? styles.primaryButtonText : styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}
