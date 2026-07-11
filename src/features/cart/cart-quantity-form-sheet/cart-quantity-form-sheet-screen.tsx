import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { createIconHeaderButton } from '@/components/navigation/native-header-items/native-header-items';
import { EmptyNotice, NumberWheelInput } from '@/components/ui/primitives';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export function CartQuantityFormSheetScreen() {
  const {itemId} = useLocalSearchParams<{itemId?: string | string[]}>();
  const resolvedItemId = Array.isArray(itemId) ? itemId[0] : itemId;
  const {itemBusy, pantryItems, updateItem} = useAppContext();
  const item = pantryItems.find(entry => entry.id === resolvedItemId);

  return (
    <>
      <Stack.Screen
        options={{
          title: item?.name,
          headerBackVisible: false,
          headerLargeTitleEnabled: false,
        }}
      />
      {item ? (
        <CartQuantityFormSheetContent key={item.id} item={item} itemBusy={itemBusy} updateItem={updateItem} />
      ) : (
        <EmptyNotice
          title="Item not found"
          body="The selected cart item is no longer present in the loaded workspace."
        />
      )}
    </>
  );
}

function CartQuantityFormSheetContent({
  item,
  itemBusy,
  updateItem,
}: {
  item: ReturnType<typeof useAppContext>['pantryItems'][number];
  itemBusy: boolean;
  updateItem: ReturnType<typeof useAppContext>['updateItem'];
}) {
  const {colors} = useAppTheme();
  const router = useRouter();
  const [quantity, setQuantity] = useState(item.quantity);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const quantityOptions = useMemo(() => Array.from({length: 50}, (_, index) => index + 1), []);
  const hasChanges = quantity !== item.quantity;
  const saveDisabled = itemBusy || quantity < 1 || !hasChanges;

  const handleSave = async () => {
    if (saveDisabled) {
      return;
    }

    try {
      setErrorMessage(null);
      await updateItem(item.id, {
        pantryId: item.pantryId,
        name: item.name,
        barcode: item.barcode,
        image: item.image,
        expirationDate: item.expirationDate,
        isInCart: item.isInCart,
        cartId: item.cartId,
        quantity,
      });
      router.back();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update quantity.');
    }
  };

  const handleClose = () => {
    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: item.name,
          headerBackVisible: false,
          headerLargeTitleEnabled: false,
          unstable_headerLeftItems: () => [
            createIconHeaderButton({
              label: 'Close quantity editor',
              icon: 'xmark',
              onPress: handleClose,
              tintColor: '#FFFFFF',
            }),
          ],
          unstable_headerRightItems: () => [
            createIconHeaderButton({
              label: itemBusy ? 'Saving quantity' : 'Save quantity',
              icon: 'checkmark',
              onPress: () => void handleSave(),
              disabled: saveDisabled,
              tintColor: colors.tint,
            }),
          ],
        }}
      />
      <View style={styles.screen}>
        <View style={styles.content}>
          <View style={[styles.wheelCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <NumberWheelInput value={quantity} options={quantityOptions} onChange={setQuantity} disabled={itemBusy} />
          </View>
        </View>

        <View style={styles.footer}>
          {errorMessage ? <Text style={[styles.errorText, {color: colors.danger}]}>{errorMessage}</Text> : null}
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  wheelCard: {
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 18,
  },
  footer: {
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
});
