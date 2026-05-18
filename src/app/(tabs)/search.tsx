import { useRouter } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';
import type { TextInput } from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useFocusEffect } from '@react-navigation/native';

import { PantryItemRow } from '@/components/pantry/pantry-item-row';
import { AppTextInput, EmptyNotice, appColors } from '@/components/ui/primitives';
import { searchItems } from '@/lib/pantry-insights';
import { useAppContext } from '@/state/app-context';

export default function SearchScreen() {
  const {
    deleteItem,
    moveItemToCart,
    moveItemToPantry,
    pantryCarts,
    pantryItems,
    selectedPantry,
  } = useAppContext();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);

  const results = useMemo(() => searchItems(pantryItems, query), [pantryItems, query]);
  const visibleItems = results;
  const primaryCart = pantryCarts.find((cart) => cart.isPrimary) ?? pantryCarts[0] ?? null;

  useFocusEffect(
    useCallback(() => {
      const frame = requestAnimationFrame(() => {
        searchInputRef.current?.focus();
      });

      return () => cancelAnimationFrame(frame);
    }, []),
  );

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
          body="Select a pantry first so search can run against the active inventory."
        />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      data={visibleItems}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.searchSection}>
          <Text style={styles.eyebrow}>{query.trim() ? 'Search Results' : 'All Items'}</Text>
          <AppTextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search milk, pasta, 729001..."
            autoCapitalize="none"
            autoFocus
            inputRef={searchInputRef}
          />
          <Text style={styles.searchMeta}>
            {query.trim()
              ? `${results.length} ${results.length === 1 ? 'match' : 'matches'} in ${selectedPantry.name}`
              : `${visibleItems.length} ${visibleItems.length === 1 ? 'item' : 'items'} in ${selectedPantry.name}`}
          </Text>
        </View>
      }
      ListEmptyComponent={
        <View style={styles.listEmpty}>
          <EmptyNotice
            title={query.trim() ? 'No matching items' : 'No search suggestions yet'}
            body={
              query.trim()
                ? 'Try a broader name fragment or a full barcode value.'
                : 'Add pantry items to search them here.'
            }
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
            isLast={index === visibleItems.length - 1}
            onPress={() => router.push(`/items/${item.id}`)}
            leftActionLabel={item.isInCart ? 'Move to Pantry' : 'Add to Cart'}
            leftActionIcon={item.isInCart ? 'return-up-back-outline' : 'cart-outline'}
            onLeftAction={item.isInCart ? () => void moveItemToPantry(item.id) : () => void handleAddToCart(item.id)}
            onDelete={() => void deleteItem(item.id)}
            onWillOpen={handleWillOpen}
          />
        );
      }}
    />
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
  searchSection: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    color: appColors.muted,
  },
  searchMeta: {
    fontSize: 13,
    color: appColors.muted,
    paddingHorizontal: 2,
  },
  listEmpty: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
});
