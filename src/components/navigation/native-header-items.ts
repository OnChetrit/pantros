import type { NativeStackHeaderItemButton } from 'expo-router';
import type { ColorValue } from 'react-native';

type HeaderButtonIcon = NonNullable<NativeStackHeaderItemButton['icon']>;

export function createIconHeaderButton({
  label,
  icon,
  onPress,
  disabled = false,
  tintColor,
  accessibilityHint,
}: {
  label: string;
  icon: Extract<HeaderButtonIcon, { type: 'sfSymbol' }>['name'];
  onPress: () => void;
  disabled?: boolean;
  tintColor?: ColorValue;
  accessibilityHint?: string;
}): NativeStackHeaderItemButton {
  return {
    type: 'button',
    label,
    icon: {
      type: 'sfSymbol',
      name: icon,
    },
    onPress,
    disabled,
    tintColor,
    accessibilityLabel: label,
    accessibilityHint,
  };
}

export function createTextHeaderButton({
  label,
  onPress,
  disabled = false,
  tintColor,
  variant,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tintColor?: ColorValue;
  variant?: 'plain' | 'done' | 'prominent';
}): NativeStackHeaderItemButton {
  return {
    type: 'button',
    label,
    onPress,
    disabled,
    tintColor,
    variant,
    accessibilityLabel: label,
  };
}
