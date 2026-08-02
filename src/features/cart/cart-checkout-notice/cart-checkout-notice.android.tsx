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
        styles.notice,
        {
          backgroundColor: tone === 'success' ? colors.tintSoft : colors.dangerSoft,
          borderColor: tone === 'success' ? colors.borderStrong : colors.danger,
        },
      ]}
    >
      <Text style={[styles.message, {color: colors.text}]}>{message}</Text>
      <Pressable onPress={onDismiss} accessibilityRole="button">
        <Text style={[styles.dismiss, {color: colors.tint}]}>Dismiss</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  dismiss: {
    fontSize: 14,
    fontWeight: '700',
  },
});
