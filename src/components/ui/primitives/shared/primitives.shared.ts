import type { AppThemeColors } from '@/lib/theme';
import { StyleSheet } from 'react-native';

export type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
};

export const createStyles = (colors: AppThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      gap: 16,
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: 24,
      padding: 18,
      gap: 14,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardHeader: {
      flexDirection: 'row',
      gap: 12,
      alignItems: 'flex-start',
      justifyContent: 'space-between',
    },
    cardCopy: {
      flex: 1,
      gap: 4,
    },
    cardTitle: {
      color: colors.text,
      fontSize: 18,
      fontWeight: '700',
    },
    cardSubtitle: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    button: {
      minHeight: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
    },
    primaryButton: {
      backgroundColor: colors.tint,
    },
    secondaryButton: {
      backgroundColor: colors.tintSoft,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    buttonPressed: {
      opacity: 0.55,
    },
    primaryButtonText: {
      color: colors.textInverse,
      fontSize: 15,
      fontWeight: '700',
    },
    secondaryButtonText: {
      color: colors.tint,
      fontSize: 15,
      fontWeight: '700',
    },
    inputShell: {
      position: 'relative',
    },
    inputRow: {
      minHeight: 52,
    },
    inputRowLarge: {
      minHeight: 60,
    },
    input: {
      borderRadius: 16,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.input,
      color: colors.text,
      paddingHorizontal: 14,
      fontSize: 16,
    },
    inputLarge: {
      minHeight: 60,
      paddingHorizontal: 16,
      fontSize: 18,
    },
    inputRightSlot: {
      position: 'absolute',
      right: 12,
      top: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    rowSpacer: {
      flex: 1,
    },
    rowLabel: {
      color: colors.muted,
      fontSize: 14,
    },
    rowValue: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '600',
    },
    emptyState: {
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 18,
      gap: 6,
    },
    emptyTitle: {
      color: colors.text,
      fontSize: 16,
      fontWeight: '700',
    },
    emptyBody: {
      color: colors.muted,
      fontSize: 14,
      lineHeight: 20,
    },
    metricPill: {
      minWidth: 88,
      borderRadius: 18,
      paddingHorizontal: 14,
      paddingVertical: 12,
      gap: 2,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    metricPillAccent: {
      backgroundColor: colors.tintSoft,
      borderColor: colors.tint,
    },
    metricPillWarning: {
      backgroundColor: colors.warningSoft,
      borderColor: colors.warning,
    },
    metricValue: {
      color: colors.text,
      fontSize: 20,
      fontWeight: '800',
    },
    metricLabel: {
      color: colors.muted,
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    metricGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    avatar: {
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderColor: colors.borderStrong,
    },
    avatarText: {
      color: colors.textInverse,
      fontWeight: '800',
    },
    listRow: {
      minHeight: 58,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    listRowContent: {
      flexDirection: 'row',
      alignItems: 'center',
      width: '100%',
      gap: 12,
    },
    listRowEmphasized: {
      borderColor: colors.tint,
      backgroundColor: colors.tintSoft,
    },
    listRowPressed: {
      opacity: 0.72,
    },
    listRowCopy: {
      flex: 1,
      gap: 3,
    },
    listRowSpacer: {
      flex: 1,
    },
    listRowTitle: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    listRowSubtitle: {
      color: colors.muted,
      fontSize: 13,
      lineHeight: 18,
    },
    listRowValue: {
      color: colors.tint,
      fontSize: 14,
      fontWeight: '700',
    },
  });
