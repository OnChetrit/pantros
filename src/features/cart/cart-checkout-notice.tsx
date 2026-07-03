import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

export function CartCheckoutNotice({
  tone,
  message,
  onDismiss,
}: {
  tone: 'success' | 'error';
  message: string;
  onDismiss: () => void;
}) {
  const {colors} = useAppTheme();

  return (
    <View
      style={[
        styles.noticeBanner,
        {
          backgroundColor: tone === 'success' ? colors.tintSoft : colors.dangerSoft,
          borderColor: tone === 'success' ? colors.borderStrong : colors.danger,
        },
      ]}
    >
      <Text style={[styles.noticeBannerText, {color: colors.text}]}>{message}</Text>
      <Pressable onPress={onDismiss}>
        <Text style={[styles.noticeBannerDismiss, {color: colors.tint}]}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  noticeBanner: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  noticeBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  noticeBannerDismiss: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '700',
  },
});
