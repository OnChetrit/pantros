import { Stack, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { appColors } from '@/lib/theme';
import { getCartItems } from '@/lib/pantry-insights';
import { useAppContext } from '@/state/app-context';

export default function CartScreen() {
  const { deleteItem, moveItemToPantry, pantryCarts, pantryItems, selectedPantry } = useAppContext();
  const router = useRouter();
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);
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
  const handleWillOpen = (row: SwipeableMethods | null) => {
    if (openSwipeableRef.current && openSwipeableRef.current !== row) {
      openSwipeableRef.current.close();
    }

    openSwipeableRef.current = row;
  };

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
      <FlatList
        style={styles.screen}
        data={itemsInCart}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.listEmpty}>
            <EmptyNotice
              title="Nothing to buy right now"
              body="Items moved into a shopping list will appear here with the same native list layout as Pantros."
            />
          </View>
        }
        renderItem={({ item, index }) => {
          const cartName = pantryCarts.find((cart) => cart.id === item.cartId)?.name ?? null;

          return (
            <PantryItemRow
              item={item}
              cartName={cartName}
              isFirst={index === 0}
              isLast={index === itemsInCart.length - 1}
              onPress={() => router.push(`/items/${item.id}`)}
              leftActionLabel="Move to Pantry"
              leftActionIcon="return-up-back-outline"
              onLeftAction={() => void moveItemToPantry(item.id)}
              onDelete={() => void deleteItem(item.id)}
              onWillOpen={handleWillOpen}
            />
          );
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  content: {
    paddingBottom: 40,
  },
  emptyScreen: {
    flex: 1,
    backgroundColor: appColors.background,
    padding: 20,
    justifyContent: 'center',
  },
  listEmpty: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
});
