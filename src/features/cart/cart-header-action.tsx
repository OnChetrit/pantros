import { Pressable, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/lib/theme';

export function CartHeaderAction({
  label,
  onPress,
  emphasized = false,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  emphasized?: boolean;
  disabled?: boolean;
}) {
  const {colors} = useAppTheme();

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({pressed}) => [styles.headerButton, (pressed || disabled) ? styles.headerButtonPressed : null]}
    >
      <Text style={[styles.headerButtonText, {color: disabled ? colors.muted : emphasized ? colors.tint : colors.text}]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    minHeight: 32,
    justifyContent: 'center',
  },
  headerButtonPressed: {
    opacity: 0.65,
  },
  headerButtonText: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
  },
});
