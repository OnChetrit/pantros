import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAppTheme } from '@/lib/theme';

type CartCheckoutBarProps = {
  selectedCount: number;
  totalCount: number;
  processing: boolean;
  onSubmit: () => void;
  onSecondaryAction: () => void;
};

export function CartCheckoutBottomAccessory({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
  onSecondaryAction,
}: CartCheckoutBarProps) {
  NativeTabs.BottomAccessory.usePlacement();

  return (
    <CartCheckoutBar
      selectedCount={selectedCount}
      totalCount={totalCount}
      processing={processing}
      onSubmit={onSubmit}
      onSecondaryAction={onSecondaryAction}
      accessory
    />
  );
}

export function CartCheckoutFooter(props: CartCheckoutBarProps) {
  const insets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  return (
    <View
      style={[
        styles.footerWrap,
        {
          paddingBottom: Math.max(insets.bottom, 14),
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
      ]}
    >
      <CartCheckoutBar {...props} />
    </View>
  );
}

function CartCheckoutBar({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
  onSecondaryAction,
  accessory = false,
}: CartCheckoutBarProps & { accessory?: boolean }) {
  const { colors } = useAppTheme();
  const hasSelection = selectedCount > 0;
  const secondaryLabel = hasSelection && selectedCount === totalCount ? 'Clear' : 'Select All';
  const countLabel = selectedCount === 1 ? '1 selected' : `${selectedCount} selected`;
  const summaryLabel = hasSelection
    ? 'Move bought items now. Expiring items get reviewed after.'
    : 'Select items to finish shopping.';

  return (
    <View
      style={[
        styles.shell,
        accessory ? styles.shellAccessory : null,
        {
          backgroundColor: colors.card,
          borderColor: colors.borderStrong,
          shadowColor: colors.shadow,
        },
      ]}
    >
      <View style={styles.summaryWrap}>
        <Text style={[styles.count, { color: colors.text }]} numberOfLines={1}>
          {countLabel}
        </Text>
        <Text style={[styles.summary, { color: colors.muted }]} numberOfLines={1}>
          {summaryLabel}
        </Text>
      </View>
      <View style={[styles.actions, accessory ? styles.actionsAccessory : null]}>
        <Pressable
          disabled={processing}
          onPress={onSecondaryAction}
          style={({ pressed }) => [
            styles.secondaryButton,
            {
              borderColor: colors.borderStrong,
              backgroundColor: colors.background,
            },
            (pressed || processing) && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>{secondaryLabel}</Text>
        </Pressable>
        <Pressable
          disabled={!hasSelection || processing}
          onPress={onSubmit}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              backgroundColor: hasSelection && !processing ? colors.tint : colors.borderStrong,
            },
            (pressed || processing || !hasSelection) && styles.buttonPressed,
          ]}
        >
          <Text style={[styles.primaryButtonText, { color: colors.textInverse }]}>
            {processing ? 'Moving…' : 'Move to Pantry'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  shell: {
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowOpacity: 0.1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  shellAccessory: {
    paddingVertical: 10,
    borderRadius: 18,
  },
  summaryWrap: {
    flex: 1,
    minWidth: 0,
  },
  count: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
  summary: {
    fontSize: 12,
    lineHeight: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionsAccessory: {
    flexShrink: 0,
  },
  secondaryButton: {
    minHeight: 36,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  primaryButton: {
    minHeight: 36,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.72,
  },
});
