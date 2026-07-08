import { Button, Host, Text } from '@expo/ui';
import { StyleSheet } from 'react-native';

import { useAppTheme } from '@/lib/theme';

import { styles } from './cart-expiration-review-modal.shared';

export function ActionButton({
  label,
  onPress,
  disabled: isDisabled,
  primary = false,
  subtle = false,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
  primary?: boolean;
  subtle?: boolean;
}) {
  const {colors} = useAppTheme();
  const buttonStyle = StyleSheet.compose(styles.button, {
    backgroundColor: subtle ? 'transparent' : primary ? colors.tint : colors.tintSoft,
    borderColor: subtle ? colors.border : primary ? colors.tint : colors.borderStrong,
  });
  const textStyle = [
    styles.buttonText,
    {
      color: subtle ? colors.muted : primary ? colors.textInverse : colors.tint,
    },
  ] as const;

  return (
    <Host matchContents style={{flex: 1}}>
      <Button
        disabled={isDisabled}
        onPress={onPress}
        variant={subtle ? 'text' : primary ? 'filled' : 'outlined'}
        style={buttonStyle as never}
      >
        <Text textStyle={textStyle as never}>{label}</Text>
      </Button>
    </Host>
  );
}
