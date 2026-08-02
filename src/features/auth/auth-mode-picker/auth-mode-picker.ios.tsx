import { SegmentedControl } from '@expo/ui/community/segmented-control';

import type { AuthMode } from './auth-mode-picker';

type AuthModePickerProps = {
  mode: AuthMode;
  disabled: boolean;
  onChange: (mode: AuthMode) => void;
};

export function AuthModePicker({mode, disabled, onChange}: AuthModePickerProps) {
  return (
    <SegmentedControl
      style={{width: '100%'}}
      values={['Sign in', 'Sign up']}
      selectedIndex={mode === 'signin' ? 0 : 1}
      enabled={!disabled}
      onValueChange={value => onChange(value === 'Sign in' ? 'signin' : 'signup')}
    />
  );
}
