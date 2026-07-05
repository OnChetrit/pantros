import type { PropsWithChildren } from 'react';
import { View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

export function AppScreen({children}: PropsWithChildren) {
  const styles = useThemedStyles(createStyles);

  return <View style={styles.screen}>{children}</View>;
}
