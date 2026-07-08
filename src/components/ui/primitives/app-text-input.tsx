import type { ReactElement, ReactNode, Ref } from 'react';
import { Host, RNHostView, TextInput } from '@expo/ui';
import type { TextInputRef } from '@expo/ui';
import { View } from 'react-native';

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
    <Host style={styles.inputShell}>
      <View style={styles.inputShell}>
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
        {rightSlot ? (
          <View style={styles.inputRightSlot}>
            <RNHostView matchContents>{rightSlot as ReactElement}</RNHostView>
          </View>
        ) : null}
      </View>
    </Host>
  );
}
