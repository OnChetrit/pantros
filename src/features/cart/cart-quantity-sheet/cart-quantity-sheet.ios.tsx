import { BottomSheet } from '@expo/ui';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { createBottomSheetModifiers } from '@/components/sheets/sheet-presets/sheet-presets';
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

export function CartQuantitySheet({visible, item, processing, errorMessage, onSave, onCancel}: CartQuantitySheetProps) {
  if (!item) {
    return null;
  }

  return (
    <CartQuantitySheetContent
      key={item.id}
      visible={visible}
      item={item}
      processing={processing}
      errorMessage={errorMessage}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

function CartQuantitySheetContent({
  visible,
  item,
  processing,
  errorMessage,
  onSave,
  onCancel,
}: CartQuantitySheetProps & {item: PantryItem}) {
  const {colors} = useAppTheme();
  const [quantity, setQuantity] = useState(item.quantity);
  const quantityOptions = useMemo(() => Array.from({length: 50}, (_, index) => index + 1), []);
  const modifiers = useMemo(() => createBottomSheetModifiers(320), []);

  return (
    <BottomSheet isPresented={visible} onDismiss={onCancel} modifiers={modifiers}>
      <View style={styles.sheet}>
        <Text numberOfLines={1} style={[styles.title, {color: colors.text}]}>
          {item.name}
        </Text>

        <View style={[styles.quantityInput, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <NativePicker
            selectedValue={quantity}
            enabled={!processing}
            onValueChange={nextValue => {
              if (typeof nextValue === 'number') {
                setQuantity(nextValue);
              }
            }}
            itemStyle={[styles.quantityPickerItem, {color: colors.text}]}
            style={[styles.quantityPicker, {color: colors.text}]}
          >
            {quantityOptions.map(option => (
              <NativePicker.Item key={option} label={String(option)} value={option} />
            ))}
          </NativePicker>
        </View>

        {errorMessage ? <Text style={[styles.error, {color: colors.danger}]}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <Pressable
            disabled={processing}
            onPress={() => onSave(quantity)}
            style={({pressed}) => [
              styles.primaryButton,
              {
                backgroundColor: colors.tint,
                borderColor: colors.tint,
                opacity: processing ? 0.45 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.primaryButtonText, {color: colors.textInverse}]}>
              {processing ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
          <Pressable
            disabled={processing}
            onPress={onCancel}
            style={({pressed}) => [
              styles.secondaryButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                opacity: processing ? 0.45 : pressed ? 0.8 : 1,
              },
            ]}
          >
            <Text style={[styles.secondaryButtonText, {color: colors.text}]}>Cancel</Text>
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
  quantityInput: {
    height: 120,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  quantityPicker: {
    height: 120,
    width: '100%',
  },
  quantityPickerItem: {
    fontSize: 24,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
  secondaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '700',
  },
});
