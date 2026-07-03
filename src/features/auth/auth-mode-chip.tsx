import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

export function AuthModeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.modeChip,
        active ? styles.modeChipActive : null,
        pressed ? styles.modeChipPressed : null,
      ]}
    >
      <Text style={[styles.modeChipText, active ? styles.modeChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    modeChip: {
      position: 'relative',
      flex: 1,
      minHeight: 46,
      borderRadius: 16,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    modeChipActive: {
      borderColor: 'transparent',
    },
    modeChipPressed: {
      opacity: 0.78,
    },
    modeChipText: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '700',
    },
    modeChipTextActive: {
      color: colors.textInverse,
    },
  });
