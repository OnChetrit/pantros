import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import type { AuthProviderButtonProps } from './auth-provider-button.types';

export function AuthProviderButton({icon, label, onPress, disabled}: AuthProviderButtonProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [styles.providerButton, pressed && styles.pressedButton, disabled && styles.disabledButton]}
    >
      <Ionicons name={icon} size={20} color={appColors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  providerButton: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    borderRadius: 16,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.background,
  },
  pressedButton: {
    opacity: 0.6,
  },
  disabledButton: {
    opacity: 0.45,
  },
});
