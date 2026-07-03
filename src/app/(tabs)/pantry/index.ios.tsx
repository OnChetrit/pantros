import { Host, List, RNHostView, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function PantryScreen() {
  const { deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry } =
    useAppContext();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');

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

  const handleAddToCart = async (itemId: string) => {
    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    await moveItemToCart(itemId, primaryCart.id);
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
          headerLeft: () => <PantryFilterMenu sortOption={sortOption} onSelectSort={setSortOption} />,
        }}
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
                    leftActionLabel={leftActionLabel}
                    onLeftAction={onLeftAction}
                    onDelete={() => void deleteItem(item.id)}
                  />
                );
              })
            ) : (
              <RNHostView key="empty-pantry" matchContents>
                <View style={styles.noticeRow}>
                  <EmptyNotice
                    title="No pantry items yet"
                    body="Add your first inventory item to start using the pantry as a real iOS-style list with quick actions."
                  />
                </View>
              </RNHostView>
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
                  leftActionLabel="Move to Pantry"
                  onLeftAction={() => void moveItemToPantry(item.id)}
                  onDelete={() => void deleteItem(item.id)}
                />
              ))}
            </Section>
          ) : null}
        </List>
      </Host>
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
