import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable } from 'react-native';

import { appColors } from '@/components/ui/primitives';

export function AuthProviderButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [styles.providerIconButton, (pressed || disabled) && styles.providerButtonPressed]}
    >
      <Ionicons name={icon} size={18} color={appColors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  providerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  providerButtonPressed: {
    opacity: 0.6,
  },
});
