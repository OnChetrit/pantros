import type { StyleProp, ViewStyle } from 'react-native';
import { Image, Text, View } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { createStyles } from './shared/primitives.shared';

export function AvatarBadge({
  name,
  size = 38,
  imageUrl,
  showBackground = true,
  style,
}: {
  name?: string | null;
  size?: number;
  imageUrl?: string | null;
  showBackground?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);

  const initials = (name ?? 'Pantros User')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <View
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: showBackground ? colors.tint : 'transparent',
          borderWidth: showBackground ? 1 : 0,
        },
        style,
      ]}
    >
      {imageUrl ? (
        <Image
          source={{uri: imageUrl}}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
        />
      ) : (
        <Text style={[styles.avatarText, {fontSize: Math.max(12, size * 0.34)}]}>{initials}</Text>
      )}
    </View>
  );
}
