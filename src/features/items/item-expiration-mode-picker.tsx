import { StyleSheet, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';
import { ItemExpirationModeChip } from './item-expiration-mode-chip';

type ExpirationMode = 'manual' | 'relative';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

export function ItemExpirationModePicker({ mode, onChange }: ItemExpirationModePickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.modeRow}>
      <ItemExpirationModeChip active={mode === 'manual'} label="Manual" onPress={() => onChange('manual')} />
      <ItemExpirationModeChip active={mode === 'relative'} label="Relative" onPress={() => onChange('relative')} />
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
});
