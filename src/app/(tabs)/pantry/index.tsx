import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { PantryFilterMenu, type PantryListSortOption } from '@/components/pantry/pantry-filter-menu';
import { PantryItemRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { appColors } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function PantryScreen() {
  const {deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry} = useAppContext();
  const router = useRouter();
  const [sortOption, setSortOption] = useState<PantryListSortOption>('expiration');

  const {cartItems, pantryListItems} = useMemo(() => {
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

  const renderItemRow = (
    item: (typeof pantryItems)[number],
    index: number,
    total: number,
    displayMode: 'pantry' | 'cart'
  ) => {
    const leftActionLabel = item.isInCart ? 'Move to Pantry' : 'Add to Cart';
    const onLeftAction = item.isInCart ? () => void moveItemToPantry(item.id) : () => void handleAddToCart(item.id);

    return (
      <PantryItemRow
        item={item}
        displayMode={displayMode}
        isLast={index === total - 1}
        onPress={() => router.push(`/items/${item.id}`)}
        onEdit={() => router.push(`/items/${item.id}`)}
        leftActionLabel={leftActionLabel}
        onLeftAction={onLeftAction}
        onDelete={() => void deleteItem(item.id)}
      />
    );
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerLeft: () => <PantryFilterMenu sortOption={sortOption} onSelectSort={setSortOption} />,
        }}
      />
      <FlatList
        style={styles.screen}
        data={pantryListItems}
        keyExtractor={item => item.id}
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
        ListFooterComponent={
          cartItems.length > 0 ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Cart</Text>
              <View style={styles.sectionCard}>
                {cartItems.map((item, index) => (
                  <View key={item.id}>{renderItemRow(item, index, cartItems.length, 'cart')}</View>
                ))}
              </View>
            </View>
          ) : null
        }
        ListFooterComponentStyle={styles.footer}
        renderItem={({item, index}) => {
          return renderItemRow(item, index, pantryListItems.length, 'pantry');
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
  footer: {
    marginTop: 18,
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
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: appColors.muted,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 26,
    backgroundColor: appColors.card,
    paddingVertical: 2,
    overflow: 'hidden',
  },
});
