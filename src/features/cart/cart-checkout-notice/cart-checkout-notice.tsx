import { Host, RNHostView, Row, Spacer } from '@expo/ui';
import { StyleSheet, Text, Pressable, View } from 'react-native';

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
    <Host
      style={[
        styles.noticeBanner,
        {
          backgroundColor: tone === 'success' ? colors.tintSoft : colors.dangerSoft,
          borderColor: tone === 'success' ? colors.borderStrong : colors.danger,
        },
      ]}
    >
      <Row alignment="center" spacing={12}>
        <RNHostView matchContents>
          <View style={styles.noticeBannerCopy}>
            <Text style={[styles.noticeBannerText, {color: colors.text}]}>{message}</Text>
          </View>
        </RNHostView>
        <Spacer flexible />
        <RNHostView matchContents>
          <Pressable onPress={onDismiss}>
            <Text style={[styles.noticeBannerDismiss, {color: colors.tint}]}>Dismiss</Text>
          </Pressable>
        </RNHostView>
      </Row>
    </Host>
  );
}

const styles = StyleSheet.create({
  noticeBanner: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  noticeBannerCopy: {
    flex: 1,
  },
  noticeBannerText: {
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
