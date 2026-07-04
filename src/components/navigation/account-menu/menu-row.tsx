import { Ionicons } from '@expo/vector-icons';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { appColors, useThemedStyles } from '@/lib/theme';

type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightSlot?: ReactNode;
  danger?: boolean;
  hideDivider?: boolean;
};

export function MenuRow({
  icon,
  label,
  value,
  onPress,
  rightSlot,
  danger = false,
  hideDivider = false,
}: MenuRowProps) {
  const styles = useThemedStyles(createStyles);

  const content = (
    <View style={[styles.menuRow, hideDivider ? null : styles.menuRowDivider]}>
      <View style={styles.menuRowLead}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? appColors.danger : appColors.text}
          style={styles.menuRowIcon}
        />
        <Text style={[styles.menuRowLabel, danger ? styles.menuRowLabelDanger : null]}>{label}</Text>
      </View>

      {rightSlot ?? (
        <View style={styles.menuRowTrail}>
          {value ? <Text style={styles.menuRowValue}>{value}</Text> : null}
          {onPress ? <Ionicons name="chevron-forward" size={18} color={appColors.muted} /> : null}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.menuRowPressed : null]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    menuRow: {
      minHeight: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 14,
    },
    menuRowDivider: {
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.borderStrong,
    },
    menuRowPressed: {
      opacity: 0.76,
    },
    menuRowLead: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
    },
    menuRowIcon: {
      width: 22,
      textAlign: 'center',
    },
    menuRowLabel: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '600',
    },
    menuRowLabelDanger: {
      color: appColors.danger,
    },
    menuRowTrail: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 8,
      flexShrink: 1,
    },
    menuRowValue: {
      color: colors.muted,
      fontSize: 15,
      textAlign: 'right',
      flexShrink: 1,
    },
  });
