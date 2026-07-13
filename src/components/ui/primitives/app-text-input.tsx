import type { ReactNode, Ref } from 'react';
import { TextInput, View, type TextInput as RNTextInput } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

type AppTextInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  autoFocus?: boolean;
  inputRef?: Ref<RNTextInput>;
  size?: 'default' | 'large';
  rightAccessory?: ReactNode;
};

export function AppTextInput({
  value,
  onChangeText,
  placeholder,
  autoCapitalize = 'sentences',
  autoCorrect = false,
  autoFocus = false,
  inputRef,
  size = 'default',
  rightAccessory,
}: AppTextInputProps) {
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const inputStyle =
    size === 'large' ? {...styles.input, ...styles.inputLarge} : styles.input;

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
        style={rightAccessory ? [inputStyle, {paddingRight: size === 'large' ? 52 : 48}] : inputStyle}
      />
      {rightAccessory ? <View style={styles.inputRightSlot}>{rightAccessory}</View> : null}
    </View>
  );
}
