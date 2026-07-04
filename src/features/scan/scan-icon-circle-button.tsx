import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Pressable } from 'react-native';

import { appColors } from '@/components/ui/primitives';

export function ScanIconCircleButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [styles.iconCircleButton, (pressed || disabled) ? styles.buttonPressed : null]}
    >
      <Ionicons name={icon} size={22} color={disabled ? appColors.muted : appColors.tint} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
