import { StyleSheet } from 'react-native';

export const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    timeButton: {
      minWidth: 84,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 9,
      alignItems: 'center',
      backgroundColor: colors.input,
    },
    timeButtonPressed: {
      opacity: 0.76,
    },
    timeButtonText: {
      color: colors.tint,
      fontSize: 15,
      fontWeight: '700',
    },
    inlineActionButton: {
      marginTop: 14,
      minHeight: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tintSoft,
    },
    inlineActionButtonPressed: {
      opacity: 0.76,
    },
    inlineActionButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    notificationError: {
      marginTop: 10,
      color: colors.danger,
      fontSize: 13,
      lineHeight: 18,
    },
  });
