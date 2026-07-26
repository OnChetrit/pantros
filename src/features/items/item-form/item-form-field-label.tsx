import { StyleSheet, Text } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

export function ItemFormFieldLabel({children}: {children: string}) {
  const styles = useThemedStyles(createStyles);

  return <Text style={styles.label}>{children}</Text>;
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    label: {
      color: colors.text,
      fontWeight: '700',
      textTransform: 'uppercase',
    },
  });
