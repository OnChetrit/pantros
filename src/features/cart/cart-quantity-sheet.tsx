import { Ionicons } from '@expo/vector-icons';
import { BottomSheet } from '@expo/ui';
import {
  padding,
  presentationBackground,
  presentationDetents,
  presentationDragIndicator,
} from '@expo/ui/swift-ui/modifiers';
import { useMemo } from 'react';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PantryItem } from '@/domain/models';
import { appColors, useAppTheme } from '@/lib/theme';

type CartQuantitySheetProps = {
  visible: boolean;
  item: PantryItem | null;
  processing: boolean;
  errorMessage: string | null;
  onSave: (quantity: number) => void;
  onCancel: () => void;
};

export function CartQuantitySheet({
  visible,
  item,
  processing,
  errorMessage,
  onSave,
  onCancel,
}: CartQuantitySheetProps) {
  const { colors } = useAppTheme();
  const [quantity, setQuantity] = useState(1);
  const modifiers = useMemo(
    () => [
      padding({ top: 8, leading: 20, trailing: 20, bottom: 20 }),
      presentationDragIndicator('visible'),
      presentationBackground(appColors.background as string),
      presentationDetents([{ height: 280 }]),
    ],
    []
  );

  useEffect(() => {
    setQuantity(item?.quantity ?? 1);
  }, [item]);

  if (!item) {
    return null;
  }

  return (
    <BottomSheet isPresented={visible} onDismiss={onCancel} modifiers={modifiers}>
      <View style={styles.sheet}>
      <Text style={[styles.title, { color: colors.text }]}>{item.name}</Text>

      <View style={[styles.stepper, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Pressable
          disabled={processing || quantity <= 1}
          onPress={() => setQuantity(current => Math.max(1, current - 1))}
          style={({ pressed }) => [
            styles.stepperButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              opacity: processing || quantity <= 1 ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="remove" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.value, { color: colors.text }]}>{quantity}</Text>
        <Pressable
          disabled={processing}
          onPress={() => setQuantity(current => current + 1)}
          style={({ pressed }) => [
            styles.stepperButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              opacity: processing ? 0.4 : pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="add" size={24} color={colors.text} />
        </Pressable>
      </View>

      {errorMessage ? <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text> : null}

      <View style={styles.actions}>
        <Pressable
          disabled={processing}
          onPress={() => onSave(quantity)}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: colors.tint,
              borderColor: colors.tint,
              opacity: processing ? 0.45 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.actionButtonLabel, { color: colors.textInverse }]}>Save quantity</Text>
        </Pressable>
        <Pressable
          disabled={processing}
          onPress={onCancel}
          style={({ pressed }) => [
            styles.actionButton,
            {
              backgroundColor: colors.background,
              borderColor: colors.border,
              opacity: processing ? 0.45 : pressed ? 0.8 : 1,
            },
          ]}
        >
          <Text style={[styles.actionButtonLabel, { color: colors.text }]}>Cancel</Text>
        </Pressable>
      </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: 16,
  },
  title: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  stepper: {
    minHeight: 84,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    minWidth: 48,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
    textAlign: 'center',
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
  },
  actionButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonLabel: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
});
