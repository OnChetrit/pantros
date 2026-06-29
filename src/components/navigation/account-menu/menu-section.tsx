import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

type MenuSectionProps = {
  title: string;
  children: ReactNode;
};

export function MenuSection({ title, children }: MenuSectionProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    section: {
      gap: 10,
    },
    sectionTitle: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
      paddingHorizontal: 4,
    },
    sectionCard: {
      borderRadius: 26,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 18,
      paddingVertical: 2,
    },
  });
