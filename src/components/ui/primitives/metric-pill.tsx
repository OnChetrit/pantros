import { Text, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from '../primitives.shared';

export function MetricPill({
  value,
  label,
  tone = 'default',
}: {
  value: string;
  label: string;
  tone?: 'default' | 'accent' | 'warning';
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View
      style={[
        styles.metricPill,
        tone === 'accent' ? styles.metricPillAccent : null,
        tone === 'warning' ? styles.metricPillWarning : null,
      ]}
    >
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}
