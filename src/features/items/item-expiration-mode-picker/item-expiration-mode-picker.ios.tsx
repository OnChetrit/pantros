import { SegmentedControl } from '@expo/ui/community/segmented-control';

type ExpirationMode = 'manual' | 'relative';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

export function ItemExpirationModePicker({mode, onChange}: ItemExpirationModePickerProps) {
  return (
    <SegmentedControl
      style={{width: '100%'}}
      values={['Manual', 'Relative']}
      selectedIndex={mode === 'manual' ? 0 : 1}
      onChange={({nativeEvent}) => onChange(nativeEvent.selectedSegmentIndex === 0 ? 'manual' : 'relative')}
    />
  );
}
