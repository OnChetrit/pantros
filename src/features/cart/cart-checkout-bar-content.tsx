import { Text, View, Pressable } from 'react-native';

import { useAppTheme } from '@/lib/theme';

import { styles, type CartCheckoutBarProps } from './cart-checkout-bar.shared';

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
  const countLabel = selectedCount === 1 ? '1 item selected' : `${selectedCount} items selected`;

  return (
    <View
      style={[
        styles.shell,
        {
          borderColor: colors.borderStrong,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.summaryWrap}>
          <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
            Shopping Complete
          </Text>
          <Text style={[styles.count, {color: colors.muted}]} numberOfLines={1}>
            {countLabel}
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
          <Text style={[styles.countBadgeValue, {color: colors.tint}]}>{selectedCount}</Text>
        </View>
      </View>
      <View style={[styles.actions, sheet ? styles.actionsSheet : null]}>
        <Pressable
          disabled={processing}
          onPress={onSecondaryAction}
          style={({pressed}) => [
            styles.secondaryButton,
            {
              borderColor: colors.borderStrong,
              backgroundColor: colors.background,
            },
            (pressed || processing) && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.secondaryButtonText, {color: colors.tint}]}>{secondaryLabel}</Text>
        </Pressable>
        <Pressable
          disabled={!hasSelection || processing}
          onPress={onSubmit}
          style={({pressed}) => [
            styles.primaryButton,
            {
              backgroundColor: hasSelection && !processing ? colors.tint : colors.borderStrong,
            },
            (pressed || processing || !hasSelection) && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.primaryButtonText, {color: colors.textInverse}]}>
            {processing ? 'Moving…' : 'Finish'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
