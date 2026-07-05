import { BottomSheet } from '@expo/ui';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PantryItem } from '@/domain/models';
import { useAppTheme } from '@/lib/theme';

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
  const quantityOptions = useMemo(() => Array.from({ length: 50 }, (_, index) => index + 1), []);

  useEffect(() => {
    setQuantity(item?.quantity ?? 1);
  }, [item]);

  if (!item) {
    return null;
  }

  return (
    <BottomSheet
      isPresented={visible}
      onDismiss={onCancel}
      snapPoints={[{ height: 248 }]}
    >
      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Quantity
          </Text>
        </View>

        <View style={[styles.quantityInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <NativePicker
            selectedValue={quantity}
            enabled={!processing}
            onValueChange={(nextValue) => {
              if (typeof nextValue === 'number') {
                setQuantity(nextValue);
              }
            }}
            itemStyle={[styles.quantityPickerItem, { color: colors.text }]}
            style={[styles.quantityPicker, { color: colors.text }]}
          >
            {quantityOptions.map((option) => (
              <NativePicker.Item key={option} label={String(option)} value={option} />
            ))}
          </NativePicker>
          <Text style={[styles.quantitySuffix, { color: colors.text }]}>units</Text>
        </View>

        {errorMessage ? <Text style={[styles.error, { color: colors.danger }]}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            disabled={processing}
            onPress={() => onSave(quantity)}
            style={({ pressed }) => [
              styles.actionButton,
              styles.primaryButton,
              {
                backgroundColor: colors.tint,
                borderColor: colors.tint,
                opacity: processing ? 0.45 : pressed ? 0.82 : 1,
              },
            ]}
          >
            <Text style={[styles.primaryButtonLabel, { color: colors.textInverse }]}>
              {processing ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
          <Pressable
            disabled={processing}
            onPress={onCancel}
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                opacity: processing ? 0.45 : pressed ? 0.82 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonLabel, { color: colors.text }]}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
  },
  header: {
    gap: 2,
  },
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '600',
  },
  quantityInput: {
    height: 72,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 16,
  },
  quantityPicker: {
    flex: 1,
    height: 120,
    marginTop: -20,
    marginBottom: -20,
  },
  quantityPickerItem: {
    fontSize: 22,
  },
  quantitySuffix: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryButton: {
    minWidth: 0,
  },
  primaryButtonLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
  secondaryButtonLabel: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '700',
  },
});
