import { Host, RNHostView, Row } from '@expo/ui';

import { ItemExpirationModeChip } from '../item-expiration-mode-chip/item-expiration-mode-chip';

type ExpirationMode = 'manual' | 'relative';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

export function ItemExpirationModePicker({mode, onChange}: ItemExpirationModePickerProps) {
  return (
    <Host matchContents>
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
