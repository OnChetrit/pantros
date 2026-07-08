import type { PropsWithChildren, ReactNode } from 'react';
import { Host, Text } from '@expo/ui';
import { View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

export function SectionCard({
  title,
  subtitle,
  children,
  rightSlot,
}: PropsWithChildren<{
  title: string;
  subtitle?: string;
  rightSlot?: ReactNode;
}>) {
  const styles = useThemedStyles(createStyles);

  return (
    <Host>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.cardCopy}>
            <Text textStyle={styles.cardTitle}>{title}</Text>
            {subtitle ? <Text textStyle={styles.cardSubtitle}>{subtitle}</Text> : null}
          </View>
          {rightSlot}
        </View>
        {children}
      </View>
    </Host>
  );
}
