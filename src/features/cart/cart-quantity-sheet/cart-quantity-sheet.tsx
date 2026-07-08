import { BottomSheet, Button, Host, RNHostView, Row, Spacer, Text } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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

function CartQuantitySheetContent({visible, item, processing, errorMessage, onSave, onCancel}: CartQuantitySheetProps & {item: PantryItem}) {
  const {colors} = useAppTheme();
  const [quantity, setQuantity] = useState(item.quantity);
  const modifiers = useMemo(() => createBottomSheetModifiers(280), []);

  return (
    <BottomSheet isPresented={visible} onDismiss={onCancel} modifiers={modifiers}>
      <View style={styles.sheet}>
        <Text textStyle={[styles.title, {color: colors.text}] as never}>{item.name}</Text>

        <Host style={[styles.stepper, {backgroundColor: colors.card, borderColor: colors.border}]}>
          <Row alignment="center" spacing={12}>
          <Button
            disabled={processing || quantity <= 1}
            onPress={() => setQuantity(current => Math.max(1, current - 1))}
            variant="outlined"
            style={[
              styles.stepperButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                opacity: processing || quantity <= 1 ? 0.4 : 1,
              },
            ] as never}
          >
            <RNHostView matchContents>
              <Ionicons name="remove" size={24} color={colors.text} />
            </RNHostView>
          </Button>
          <Spacer flexible />
          <Text textStyle={[styles.value, {color: colors.text}] as never}>{String(quantity)}</Text>
          <Spacer flexible />
          <Button
            disabled={processing}
            onPress={() => setQuantity(current => current + 1)}
            variant="outlined"
            style={[
              styles.stepperButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                opacity: processing ? 0.4 : 1,
              },
            ] as never}
          >
            <RNHostView matchContents>
              <Ionicons name="add" size={24} color={colors.text} />
            </RNHostView>
          </Button>
          </Row>
        </Host>

        {errorMessage ? <Text textStyle={[styles.error, {color: colors.danger}] as never}>{errorMessage}</Text> : null}

        <View style={styles.actions}>
          <Host>
          <Button
            disabled={processing}
            onPress={() => onSave(quantity)}
            variant="filled"
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.tint,
                borderColor: colors.tint,
                opacity: processing ? 0.45 : 1,
              },
            ] as never}
          >
            <Text textStyle={[styles.actionButtonLabel, {color: colors.textInverse}] as never}>Save quantity</Text>
          </Button>
          </Host>
          <Host>
          <Button
            disabled={processing}
            onPress={onCancel}
            variant="outlined"
            style={[
              styles.actionButton,
              {
                backgroundColor: colors.background,
                borderColor: colors.border,
                opacity: processing ? 0.45 : 1,
              },
            ] as never}
          >
            <Text textStyle={[styles.actionButtonLabel, {color: colors.text}] as never}>Cancel</Text>
          </Button>
          </Host>
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
