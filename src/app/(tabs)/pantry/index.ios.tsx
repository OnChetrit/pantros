import { ListItem } from '@expo/ui';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { createIconHeaderButton } from '@/components/navigation/native-header-items';
import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import type { PantryItem } from '@/domain/models';
import { CartQuantitySheet } from '@/features/cart/cart-quantity-sheet';
import { ItemExpirationReviewSheet } from '@/features/items/item-expiration-review-sheet';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function PantryScreen() {
  const { deleteItem, itemBusy, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry, updateItem } =
    useAppContext();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');
  const [isSortMenuVisible, setIsSortMenuVisible] = useState(false);
  const [reviewItem, setReviewItem] = useState<PantryItem | null>(null);
  const [reviewDate, setReviewDate] = useState('');
  const [reviewErrorMessage, setReviewErrorMessage] = useState<string | null>(null);
  const [quantityItem, setQuantityItem] = useState<PantryItem | null>(null);
  const [quantityErrorMessage, setQuantityErrorMessage] = useState<string | null>(null);

  const { cartItems, pantryListItems } = useMemo(() => {
    const compareBySort = (left: (typeof pantryItems)[number], right: (typeof pantryItems)[number]) => {
      if (sortOption === 'name') {
        return left.name.localeCompare(right.name);
      }

      if (sortOption === 'recent') {
        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }

      if (!left.expirationDate && !right.expirationDate) {
        return left.name.localeCompare(right.name);
      }

      if (!left.expirationDate) {
        return 1;
      }

      if (!right.expirationDate) {
        return -1;
      }

      const leftTime = new Date(left.expirationDate).getTime();
      const rightTime = new Date(right.expirationDate).getTime();

      return leftTime - rightTime;
    };

    const sorted = [...pantryItems].sort(compareBySort);

    return {
      pantryListItems: sorted.filter(item => !item.isInCart),
      cartItems: sorted.filter(item => item.isInCart),
    };
  }, [pantryItems, sortOption]);

  const primaryCart = pantryCarts.find(cart => cart.isPrimary) ?? pantryCarts[0] ?? null;

  const openReviewSheet = (item: PantryItem) => {
    setReviewItem(item);
    setReviewDate(item.expirationDate ?? '');
    setReviewErrorMessage(null);
  };

  const closeReviewSheet = () => {
    setReviewItem(null);
    setReviewDate('');
    setReviewErrorMessage(null);
  };

  const openQuantitySheet = (item: PantryItem) => {
    setQuantityItem(item);
    setQuantityErrorMessage(null);
  };

  const closeQuantitySheet = () => {
    setQuantityItem(null);
    setQuantityErrorMessage(null);
  };

  const handleAddToCart = async (itemId: string) => {
    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    await moveItemToCart(itemId, primaryCart.id);
  };

  const handleSaveReview = async () => {
    if (!reviewItem) {
      return;
    }

    try {
      setReviewErrorMessage(null);
      await updateItem(reviewItem.id, {
        pantryId: reviewItem.pantryId,
        name: reviewItem.name,
        barcode: reviewItem.barcode,
        image: reviewItem.image,
        expirationDate: reviewDate || null,
        isInCart: reviewItem.isInCart,
        cartId: reviewItem.cartId,
        quantity: reviewItem.quantity,
      });
      closeReviewSheet();
    } catch (error) {
      setReviewErrorMessage(error instanceof Error ? error.message : 'Unable to save expiration date.');
    }
  };

  const handleSaveQuantity = async (quantity: number) => {
    if (!quantityItem) {
      return;
    }

    try {
      setQuantityErrorMessage(null);
      await updateItem(quantityItem.id, {
        pantryId: quantityItem.pantryId,
        name: quantityItem.name,
        barcode: quantityItem.barcode,
        image: quantityItem.image,
        expirationDate: quantityItem.expirationDate,
        isInCart: quantityItem.isInCart,
        cartId: quantityItem.cartId,
        quantity,
      });
      closeQuantitySheet();
    } catch (error) {
      setQuantityErrorMessage(error instanceof Error ? error.message : 'Unable to update quantity.');
    }
  };

  if (!selectedPantry) {
    return (
      <View style={styles.emptyScreen}>
        <EmptyNotice
          title="No pantry workspace yet"
          body="The app is authenticated and loaded correctly, but there is no pantry membership yet. The next workspace step is pantry creation and join-by-code flows."
        />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          unstable_headerLeftItems: () => [
            createIconHeaderButton({
              label: 'Open sort menu',
              icon: 'arrow.up.arrow.down',
              onPress: () => setIsSortMenuVisible(true),
              tintColor: colors.tint,
            }),
          ],
        }}
      />
      <PantryFilterMenu
        hideTrigger
        sortOption={sortOption}
        onSelectSort={setSortOption}
        visible={isSortMenuVisible}
        onVisibilityChange={setIsSortMenuVisible}
      />
      <Host
        colorScheme={isDark ? 'dark' : 'light'}
        style={[styles.host, { backgroundColor: colors.background }]}
        useViewportSizeMeasurement
      >
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title="Pantry">
            {pantryListItems.length > 0 ? (
              pantryListItems.map((item, index) => {
                const leftActionLabel = item.isInCart ? 'Move to Pantry' : 'Add to Cart';
                const onLeftAction = item.isInCart
                  ? () => void moveItemToPantry(item.id)
                  : () => void handleAddToCart(item.id);

                return (
                  <PantryItemNativeListRow
                    key={item.id}
                    item={item}
                    displayMode="pantry"
                    isLast={index === pantryListItems.length - 1}
                    onPress={() => router.push(`/items/${item.id}`)}
                    onEdit={() => router.push(`/items/${item.id}`)}
                    onReviewExpiration={() => openReviewSheet(item)}
                    leftActionLabel={leftActionLabel}
                    onLeftAction={onLeftAction}
                    onDelete={() => void deleteItem(item.id)}
                  />
                );
              })
            ) : (
              <ListItem key="empty-pantry">
                <View style={styles.noticeRow}>
                  <EmptyNotice
                    title="No pantry items yet"
                    body="Add your first inventory item to start using the pantry as a real iOS-style list with quick actions."
                  />
                </View>
              </ListItem>
            )}
          </Section>
          {cartItems.length > 0 ? (
            <Section title="Cart">
              {cartItems.map((item, index) => (
                <PantryItemNativeListRow
                  key={item.id}
                  item={item}
                  displayMode="cart"
                  isLast={index === cartItems.length - 1}
                  onPress={() => router.push(`/items/${item.id}`)}
                  onEdit={() => router.push(`/items/${item.id}`)}
                  onReviewQuantity={() => openQuantitySheet(item)}
                  leftActionLabel="Move to Pantry"
                  onLeftAction={() => void moveItemToPantry(item.id)}
                  onDelete={() => void deleteItem(item.id)}
                />
              ))}
            </Section>
          ) : null}
        </List>
      </Host>
      <ItemExpirationReviewSheet
        visible={reviewItem !== null}
        item={reviewItem}
        reviewDate={reviewDate}
        processing={itemBusy}
        errorMessage={reviewErrorMessage}
        onChangeDate={setReviewDate}
        onSave={() => void handleSaveReview()}
        onCancel={closeReviewSheet}
      />
      <CartQuantitySheet
        visible={quantityItem !== null}
        item={quantityItem}
        processing={itemBusy}
        errorMessage={quantityErrorMessage}
        onSave={(quantity) => void handleSaveQuantity(quantity)}
        onCancel={closeQuantitySheet}
      />
    </>
  );
}

const styles = StyleSheet.create({
  host: {
    flex: 1,
  },
  emptyScreen: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  noticeRow: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
});
