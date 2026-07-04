import { Text, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { createStyles } from '../primitives.shared';

export function KeyValueRow({label, value}: {label: string; value: string}) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}
