import type { ReactNode, Ref } from 'react';
import { TextInput, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

type AppTextInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  inputRef?: Ref<TextInput>;
  rightSlot?: ReactNode;
};

export function AppTextInput({
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  autoCorrect = false,
  autoFocus = false,
  inputRef,
  rightSlot,
}: AppTextInputProps) {
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.inputShell}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        autoCapitalize={autoCapitalize}
        autoCorrect={autoCorrect}
        autoFocus={autoFocus}
        style={styles.input}
      />
      {rightSlot ? <View style={styles.inputRightSlot}>{rightSlot}</View> : null}
    </View>
  );
}
