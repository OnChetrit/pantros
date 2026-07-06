import { BottomSheet, Button, Host } from '@expo/ui';
import { Picker as NativePicker } from '@react-native-picker/picker';
import { useMemo, useState } from 'react';
import { Text, View } from 'react-native';

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

function CartQuantitySheetContent({visible, item, processing, errorMessage, onSave, onCancel}: CartQuantitySheetProps & {item: PantryItem}) {
  const {colors} = useAppTheme();
  const [quantity, setQuantity] = useState(item.quantity);
  const quantityOptions = useMemo(() => Array.from({length: 50}, (_, index) => index + 1), []);

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
const styles = {
  title: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '800' as const,
  },
  quantityInput: {
    height: 88,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden' as const,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    paddingRight: 14,
  },
  quantityPicker: {
    flex: 1,
    height: 88,
    display: 'flex' as const,
    justifyContent: 'center' as const,
  },
  quantityPickerContainer: {
    flex: 1,
    height: 88,
    minWidth: 0,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  },
  quantityPickerItem: {
    fontSize: 20,
  },
  error: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600' as const,
  },
  actionsHost: {
    flex: 1,
  },
};
