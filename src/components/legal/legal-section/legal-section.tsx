import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';

export function LegalSection({
  title,
  children,
}: PropsWithChildren<{
  title: string;
}>) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
  },
  sectionTitle: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  sectionBody: {
    gap: 6,
  },
});
