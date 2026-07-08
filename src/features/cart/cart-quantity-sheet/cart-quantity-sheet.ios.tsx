import { BottomSheet, Button, Column, Host, RNHostView, Text } from '@expo/ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  padding,
} from '@expo/ui/swift-ui/modifiers';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NumberWheelInput } from '@/components/ui/primitives';
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

  return (
    <Host style={{flex: 1}}>
      <BottomSheet isPresented={visible} snapPoints={[{fraction: 0.4}]} onDismiss={onCancel}>
        <Column spacing={16} modifiers={[padding({top: 18, leading: 16, trailing: 16, bottom: 16})]}>
          <RNHostView>
            <View style={styles.topRow}>
              <Host matchContents>
                <Text modifiers={[font({weight: 'bold', size: 24}), foregroundStyle(colors.text)]}>{item.name}</Text>
              </Host>
              <View style={styles.wheelWrap}>
                <NumberWheelInput
                  compact
                  value={quantity}
                  options={quantityOptions}
                  onChange={setQuantity}
                  disabled={processing}
                />
              </View>
            </View>
          </RNHostView>

          {errorMessage ? (
            <Text modifiers={[font({weight: 'semibold', size: 14}), foregroundStyle(colors.danger)]}>
              {errorMessage}
            </Text>
          ) : null}

          <Button
            label={processing ? 'Saving…' : 'Save'}
            onPress={() => onSave(quantity)}
            modifiers={[
              disabled(processing),
              controlSize('large'),
              buttonStyle('glassProminent'),
              buttonBorderShape('roundedRectangle', 16),
            ]}
          />
          <Button
            label="Cancel"
            onPress={onCancel}
            modifiers={[
              disabled(processing),
              controlSize('large'),
              buttonStyle('glass'),
              buttonBorderShape('roundedRectangle', 16),
            ]}
          />
        </Column>
      </BottomSheet>
    </Host>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  wheelWrap: {
    width: 132,
    flexShrink: 0,
  },
});
