import { Pressable, Text } from 'react-native';

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

  return (
    <Pressable
      disabled={isDisabled}
      onPress={onPress}
      style={({pressed}) => [
        styles.button,
        {
          backgroundColor: subtle ? 'transparent' : primary ? colors.tint : colors.tintSoft,
          borderColor: subtle ? colors.border : primary ? colors.tint : colors.borderStrong,
          opacity: isDisabled || pressed ? 0.55 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          {
            color: subtle ? colors.muted : primary ? colors.textInverse : colors.tint,
          },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}
