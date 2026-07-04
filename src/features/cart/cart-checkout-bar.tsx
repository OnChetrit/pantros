import { BottomSheet } from '@expo/ui';
import { presentationBackgroundInteraction } from '@expo/ui/swift-ui/modifiers';
import { useMemo } from 'react';
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

export function CartCheckoutSheet({
  selectedCount,
  totalCount,
  processing,
  onSubmit,
  onSecondaryAction,
  isPresented,
  onDismiss,
}: CartCheckoutBarProps & {
  isPresented: boolean;
  onDismiss: () => void;
}) {
  const modifiers = useMemo(() => [presentationBackgroundInteraction('enabled')], []);

  return (
    <BottomSheet
      isPresented={isPresented}
      onDismiss={onDismiss}
      testID="cart-checkout-sheet"
      modifiers={modifiers}
    >
      <CartCheckoutBar
        selectedCount={selectedCount}
        totalCount={totalCount}
        processing={processing}
        onSubmit={onSubmit}
        onSecondaryAction={onSecondaryAction}
        sheet
      />
    </BottomSheet>
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
  sheet = false,
}: CartCheckoutBarProps & { sheet?: boolean }) {
  const { colors } = useAppTheme();
  const hasSelection = selectedCount > 0;
  const secondaryLabel = hasSelection && selectedCount === totalCount ? 'Clear' : 'Select All';
  const titleLabel = 'Shopping Complete';
  const countLabel = selectedCount === 1 ? '1 item selected' : `${selectedCount} items selected`;

  return (
    <View
      style={[
        styles.shell,
        sheet ? styles.shellSheet : null,
        {
          borderColor: colors.borderStrong,
        },
      ]}
      >
        <View style={styles.headerRow}>
          <View style={styles.summaryWrap}>
            <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
              {titleLabel}
            </Text>
            <Text style={[styles.count, { color: colors.muted }]} numberOfLines={1}>
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
            <Text style={[styles.countBadgeValue, { color: colors.tint }]}>{selectedCount}</Text>
          </View>
        </View>
      <View style={[styles.actions, sheet ? styles.actionsSheet : null]}>
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
            {processing ? 'Moving…' : 'Finish'}
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
    borderWidth: 0,
    borderRadius: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    gap: 14,
  },
  shellSheet: {
    minWidth: 320,
    maxWidth: 520,
  },
  summaryWrap: {
    flex: 1,
    minWidth: 0,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '800',
  },
  count: {
    fontSize: 13,
    lineHeight: 16,
    fontWeight: '700',
  },
  countBadge: {
    minWidth: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeValue: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  actionsSheet: {
    width: '100%',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1.3,
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.72,
  },
});
