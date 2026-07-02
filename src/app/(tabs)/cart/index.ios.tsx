import { Host, List, RNHostView } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function CartScreen() {
  const { deleteItem, moveItemToPantry, pantryItems, selectedPantry } = useAppContext();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');

  const itemsInCart = useMemo(() => {
    const cartItems = getCartItems(pantryItems);

    return [...cartItems].sort((left, right) => {
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

      return new Date(left.expirationDate).getTime() - new Date(right.expirationDate).getTime();
    });
  }, [pantryItems, sortOption]);

  if (!selectedPantry) {
    return (
      <View style={styles.emptyScreen}>
        <EmptyNotice
          title="No pantry workspace yet"
          body="Select a pantry first so the active shopping cart can be derived from that workspace."
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
          {itemsInCart.length > 0 ? (
            itemsInCart.map((item, index) => (
              <PantryItemNativeListRow
                key={item.id}
                item={item}
                displayMode="cart"
                isLast={index === itemsInCart.length - 1}
                onPress={() => router.push(`/items/${item.id}`)}
                onEdit={() => router.push(`/items/${item.id}`)}
                leftActionLabel="Move to Pantry"
                onLeftAction={() => void moveItemToPantry(item.id)}
                onDelete={() => void deleteItem(item.id)}
              />
            ))
          ) : (
            <RNHostView key="empty-cart" matchContents>
              <View style={styles.noticeRow}>
                <EmptyNotice
                  title="Nothing to buy right now"
                  body="Items moved into a shopping list will appear here with working native swipe actions."
                />
              </View>
            </RNHostView>
          )}
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
