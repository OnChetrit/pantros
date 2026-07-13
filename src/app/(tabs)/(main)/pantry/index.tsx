import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, FlatList, LayoutAnimation, StyleSheet, View } from 'react-native';

import { PantryFilterMenu } from '@/components/pantry/pantry-filter-menu/pantry-filter-menu';
import { PantryItemRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { AppButton, EmptyNotice } from '@/components/ui/primitives';
import { parsePantrySortOption } from '@/features/pantry/pantry-sort/pantry-sort-options';
import { useThemedStyles } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function PantryScreen() {
  const {deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry} = useAppContext();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const {sort} = useLocalSearchParams<{sort?: string | string[]}>();
  const sortOption = parsePantrySortOption(sort);

  const visibleItems = useMemo(() => {
    const compareBySort = (left: (typeof pantryItems)[number], right: (typeof pantryItems)[number]) => {
      if (left.isInCart !== right.isInCart) {
        return left.isInCart ? 1 : -1;
      }

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

    return [...pantryItems].sort(compareBySort);
  }, [pantryItems, sortOption]);

  const primaryCart = pantryCarts.find(cart => cart.isPrimary) ?? pantryCarts[0] ?? null;

  const handleAddToCart = async (itemId: string) => {
    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await moveItemToCart(itemId, primaryCart.id);
  };

  const handleMoveToPantry = async (itemId: string) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    await moveItemToPantry(itemId);
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
    const onLeftAction = item.isInCart ? () => void handleMoveToPantry(item.id) : () => void handleAddToCart(item.id);

    return (
      <PantryItemRow
        item={item}
        displayMode={item.isInCart ? 'cart' : displayMode}
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
          headerLeft: () => <PantryFilterMenu sortOption={sortOption} sheetHref="/pantry/sort" />,
        }}
      />
      <FlatList
        style={styles.screen}
        data={visibleItems}
        keyExtractor={item => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={[styles.content, visibleItems.length > 0 ? styles.filledContent : null]}
        ListEmptyComponent={
          <View style={styles.listEmpty}>
            <EmptyNotice
              title="No pantry items yet"
              body="Add your first inventory item to start using the pantry as a real iOS-style list with quick actions."
            />
            <View style={styles.emptyAction}>
              <AppButton label="Add Item" onPress={() => router.push('/items/new')} />
            </View>
          </View>
        }
        renderItem={({item, index}) => {
          return renderItemRow(item, index, visibleItems.length, 'pantry');
        }}
      />
    </>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      paddingHorizontal: 12,
      paddingBottom: 40,
    },
    emptyScreen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      justifyContent: 'center',
    },
    listEmpty: {
      paddingHorizontal: 16,
      paddingTop: 6,
      gap: 12,
    },
    emptyAction: {
      paddingHorizontal: 4,
    },
    filledContent: {
      marginHorizontal: 12,
      borderRadius: 26,
      backgroundColor: colors.card,
      overflow: 'hidden',
    },
  });
