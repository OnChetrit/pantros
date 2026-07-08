import { Button, Host, Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { useAppTheme } from '@/lib/theme';

import { styles, type CartCheckoutBarProps } from '../cart-checkout-bar/cart-checkout-bar.shared';

export function CartCheckoutBar({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
  onSecondaryAction,
  sheet = false,
}: CartCheckoutBarProps & {sheet?: boolean}) {
  const {colors} = useAppTheme();
  const hasSelection = selectedCount > 0;
  const secondaryLabel = hasSelection && selectedCount === totalCount ? 'Clear' : 'Select All';
  const titleStyle = [styles.title, {color: colors.text}] as const;
  const countValueStyle = [styles.countBadgeValue, {color: colors.tint}] as const;
  const secondaryButtonStyle = StyleSheet.compose(styles.secondaryButton, {
    borderColor: colors.borderStrong,
    backgroundColor: colors.background,
  });
  const secondaryTextStyle = [styles.secondaryButtonText, {color: colors.tint}] as const;
  const primaryButtonStyle = StyleSheet.compose(styles.primaryButton, {
    backgroundColor: hasSelection && !processing ? colors.tint : colors.borderStrong,
  });
  const primaryTextStyle = [styles.primaryButtonText, {color: colors.textInverse}] as const;

  return (
    <View style={[styles.shell]}>
      <View style={styles.headerRow}>
        <View style={styles.summaryWrap}>
          <Text style={titleStyle as never} numberOfLines={1}>
            Shopping Complete
          </Text>
        </View>
        <View
          style={[
            styles.countBadge,
            {
              backgroundColor: colors.background,
              borderColor: colors.borderStrong,
            },
          ]}
        >
          <Text style={countValueStyle as never}>{String(selectedCount)}</Text>
        </View>
      </View>
      <View style={[styles.actions, sheet ? styles.actionsSheet : null]}>
        <Host>
        <Button
          disabled={processing}
          onPress={onSecondaryAction}
          variant="outlined"
          style={secondaryButtonStyle as never}
        >
          <Text textStyle={secondaryTextStyle as never}>{secondaryLabel}</Text>
        </Button>
        </Host>
        <Host>
        <Button
          disabled={!hasSelection || processing}
          onPress={onSubmit}
          variant="filled"
          style={primaryButtonStyle as never}
        >
          <Text textStyle={primaryTextStyle as never}>
            {processing ? 'Moving…' : 'Finish'}
          </Text>
        </Button>
        </Host>
      </View>
    </View>
  );
}
