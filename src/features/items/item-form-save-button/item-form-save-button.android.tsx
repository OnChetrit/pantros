import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

export function ItemFormSaveButton({
  canSave,
  itemBusy,
  onPress,
  label,
}: {
  canSave: boolean;
  itemBusy: boolean;
  onPress: () => void;
  label: string;
}) {
  const styles = useThemedStyles(createStyles);
  const disabled = itemBusy || !canSave;

  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{disabled}}
      android_ripple={{borderless: true}}
      disabled={disabled}
      hitSlop={4}
      onPress={onPress}
      style={({pressed}) => [styles.button, disabled ? styles.disabled : null, pressed ? styles.pressed : null]}
    >
      <Text allowFontScaling style={[styles.label, disabled ? styles.disabledLabel : null]}>
        {itemBusy ? 'Saving…' : label}
      </Text>
    </Pressable>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    button: {
      width: 88,
      minHeight: 48,
      paddingHorizontal: 8,
      alignItems: 'center',
      justifyContent: 'center',
    },
    label: {
      color: colors.tint,
      fontSize: 15,
      fontWeight: '700',
    },
    disabled: {
      opacity: 0.55,
    },
    disabledLabel: {
      color: colors.muted,
    },
    pressed: {
      opacity: 0.7,
    },
  });
