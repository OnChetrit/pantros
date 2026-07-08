import { Button, Host, RNHostView, Row, Spacer, Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

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
  const messageStyle = [styles.noticeBannerText, {color: colors.text}] as const;
  const dismissStyle = [styles.noticeBannerDismiss, {color: colors.tint}] as const;

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
            <Text style={messageStyle as never}>{message}</Text>
          </View>
        </RNHostView>
        <Spacer flexible />
        <RNHostView matchContents>
          <Button onPress={onDismiss} variant="text">
            <Text textStyle={dismissStyle as never}>Dismiss</Text>
          </Button>
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
