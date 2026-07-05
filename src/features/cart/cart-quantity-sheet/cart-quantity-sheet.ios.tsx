import { BottomSheet, Button, Host } from '@expo/ui';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  SHEET_BOTTOM_PADDING,
  SHEET_HORIZONTAL_PADDING,
  SHEET_TOP_PADDING,
} from '@/components/sheets/sheet-presets/sheet-presets';
import type { PantryItem } from '@/domain/models';
import { useAppTheme } from '@/lib/theme';
import { HStack } from '@expo/ui/swift-ui';

type CartQuantitySheetProps = {
  visible: boolean;
  item: PantryItem | null;
  processing: boolean;
  errorMessage: string | null;
  onSave: (quantity: number) => void;
  onCancel: () => void;
};

export function CartQuantitySheet({visible, item, processing, errorMessage, onSave, onCancel}: CartQuantitySheetProps) {
  const {colors} = useAppTheme();
  const [quantity, setQuantity] = useState(1);
  const quantityOptions = useMemo(() => Array.from({length: 50}, (_, index) => index + 1), []);

  useEffect(() => {
    setQuantity(item?.quantity ?? 1);
  }, [item]);

  if (!item) {
    return null;
  }

  return (
    <BottomSheet isPresented={visible} onDismiss={onCancel} snapPoints={[{height: 220}]}>
      <Host style={{flex: 1}}>
        <HStack alignment="firstTextBaseline">
          <Text style={[styles.title, {color: colors.text}]} numberOfLines={1}>
            {item.name}
          </Text>

          <View style={[styles.quantityInput, {backgroundColor: colors.background, borderColor: colors.border}]}>
            <View style={styles.quantityPickerContainer}>
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
          </View>
        </HStack>
      </Host>

      {errorMessage ? <Text style={[styles.error, {color: colors.danger}]}>{errorMessage}</Text> : null}

      <Host matchContents style={styles.actionsHost}>
        <HStack spacing={12}>
          <Button
            label={processing ? 'Saving…' : 'Save'}
            variant="filled"
            disabled={processing}
            onPress={() => {
              onSave(quantity);
            }}
          />
          <Button label="Cancel" variant="text" disabled={processing} onPress={onCancel} />
        </HStack>
      </Host>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheet: {
    gap: 12,
    paddingHorizontal: SHEET_HORIZONTAL_PADDING,
    paddingTop: SHEET_TOP_PADDING,
    paddingBottom: SHEET_BOTTOM_PADDING,
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
    // minWidth: 0,
    height: 88,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 14,
  },
  quantityPicker: {
    flex: 1,
    height: 88,
    display: 'flex',
    justifyContent: 'center',
  },
  quantityPickerContainer: {
    flex: 1,
    height: 88,
    minWidth: 0,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  quantityPickerItem: {
    fontSize: 20,
  },
  quantitySuffix: {
    fontSize: 18,
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
  actionsHost: {
    flex: 1,
  },
  actionButton: {
    flex: 1,
    minWidth: 0,
  },
});
