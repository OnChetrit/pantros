import type { TextInputRef } from '@expo/ui';
import { Host, TextInput } from '@expo/ui';
import type { Ref } from 'react';

import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

type AppTextInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  inputRef?: Ref<TextInputRef>;
};

export function AppTextInput({
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  autoCorrect = false,
  autoFocus = false,
  inputRef,
}: AppTextInputProps) {
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <Host style={[styles.inputShell, styles.inputRow]}>
      <TextInput
        key={`app-text-input-${placeholder}-${value}`}
        ref={inputRef}
        defaultValue={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        style={styles.input}
      />
    </Host>
  );
}
