import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from '../primitives.shared';

export function MetricGrid({children}: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);

  return <View style={styles.metricGrid}>{children}</View>;
}
