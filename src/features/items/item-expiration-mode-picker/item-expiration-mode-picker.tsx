import { Host, RNHostView, Row } from '@expo/ui';
import { StyleSheet } from 'react-native';

import { useThemedStyles } from '@/lib/theme';
import { ItemExpirationModeChip } from '../item-expiration-mode-chip/item-expiration-mode-chip';

type ExpirationMode = 'manual' | 'relative';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

export function ItemExpirationModePicker({ mode, onChange }: ItemExpirationModePickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <Host style={styles.modeRow}>
      <Row spacing={8}>
        <RNHostView matchContents>
          <ItemExpirationModeChip active={mode === 'manual'} label="Manual" onPress={() => onChange('manual')} />
        </RNHostView>
        <RNHostView matchContents>
          <ItemExpirationModeChip active={mode === 'relative'} label="Relative" onPress={() => onChange('relative')} />
        </RNHostView>
      </Row>
    </Host>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  modeRow: {
    width: '100%',
  },
});
