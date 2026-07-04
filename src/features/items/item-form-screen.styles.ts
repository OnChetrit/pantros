import { StyleSheet } from 'react-native';

export const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 16,
      paddingBottom: 18,
      gap: 10,
    },
    heroRow: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerActionButton: {
      width: 32,
      height: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerActionButtonPressed: {
      opacity: 0.5,
    },
    card: {
      borderRadius: 20,
      padding: 12,
      gap: 12,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
  });
