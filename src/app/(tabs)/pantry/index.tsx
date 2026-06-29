import { Stack, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, View } from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { appColors } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function PantryScreen() {
  const { deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry } = useAppContext();
  const router = useRouter();
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');

  const sortedItems = useMemo(() => {
    const compareBySort = (left: typeof pantryItems[number], right: typeof pantryItems[number]) => {
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

    return [...pantryItems].sort((left, right) => {
      if (left.isInCart !== right.isInCart) {
        return Number(left.isInCart) - Number(right.isInCart);
      }

      return compareBySort(left, right);
    });
  }, [pantryItems, sortOption]);

  const primaryCart = pantryCarts.find((cart) => cart.isPrimary) ?? pantryCarts[0] ?? null;

  const handleAddToCart = async (itemId: string) => {
    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    await moveItemToCart(itemId, primaryCart.id);
  };

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
      <FlatList
        style={styles.screen}
        data={sortedItems}
        keyExtractor={(item) => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        ListEmptyComponent={
          <View style={styles.listEmpty}>
            <EmptyNotice
              title="No pantry items yet"
              body="Add your first inventory item to start using the pantry as a real iOS-style list with quick actions."
            />
          </View>
        }
        renderItem={({ item, index }) => {
          const leftActionLabel = item.isInCart ? 'Move to Pantry' : 'Add to Cart';
          const leftActionIcon = item.isInCart ? 'return-up-back-outline' : 'cart-outline';
          const onLeftAction = item.isInCart
            ? () => void moveItemToPantry(item.id)
            : () => void handleAddToCart(item.id);

          return (
            <PantryItemRow
              item={item}
              isFirst={index === 0}
              isLast={index === sortedItems.length - 1}
              onPress={() => router.push(`/items/${item.id}`)}
              onEdit={() => router.push(`/items/${item.id}`)}
              leftActionLabel={leftActionLabel}
              leftActionIcon={leftActionIcon}
              onLeftAction={onLeftAction}
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
    paddingHorizontal: 12,
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
