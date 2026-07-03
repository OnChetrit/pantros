import { Pressable, StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

export function ItemExpirationModeChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable onPress={onPress} style={[styles.modeChip, active ? styles.modeChipActive : null]}>
      <Text style={[styles.modeChipText, active ? styles.modeChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    modeChip: {
      flex: 1,
      minHeight: 40,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.listRow,
      borderWidth: 1,
      borderColor: colors.border,
    },
    modeChipActive: {
      backgroundColor: colors.tintSoft,
      borderColor: colors.borderStrong,
    },
    modeChipText: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '700',
    },
    modeChipTextActive: {
      color: colors.text,
    },
  });
