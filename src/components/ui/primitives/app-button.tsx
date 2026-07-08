import { Button, Host } from '@expo/ui';
import { StyleSheet } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles, type ButtonProps } from './shared/primitives.shared';

export function AppButton({label, onPress, variant = 'primary', disabled}: ButtonProps) {
  const styles = useThemedStyles(createStyles);
  const buttonStyle = StyleSheet.compose(
    StyleSheet.compose(styles.button, variant === 'primary' ? styles.primaryButton : styles.secondaryButton),
    disabled ? styles.buttonPressed : null
  );

  return (
    <Host>
      <Button
        label={label}
        disabled={disabled}
        onPress={onPress}
        variant={variant === 'primary' ? 'filled' : 'outlined'}
        style={buttonStyle as never}
      />
    </Host>
  );
}
