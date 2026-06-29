import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Alert, FlatList, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SearchBarCommands } from 'react-native-screens';

import { PantryItemRow } from '@/components/pantry/pantry-item-row';
import { AppTextInput, EmptyNotice, appColors } from '@/components/ui/primitives';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useAppContext } from '@/state/app-context';

const isIOS = Platform.OS === 'ios';

export default function SearchScreen() {
  const {deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry} = useAppContext();
  const {entry, nonce} = useLocalSearchParams<{entry?: string; nonce?: string}>();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<TextInput>(null);
  const searchBarRef = useRef<SearchBarCommands | null>(null);
  const openSwipeableRef = useRef<SwipeableMethods | null>(null);

  const trimmedQuery = query.trim();
  const results = useMemo(() => matchPantryItems(pantryItems, query), [pantryItems, query]);
  const visibleItems = results.visibleResults;
  const primaryCart = pantryCarts.find(cart => cart.isPrimary) ?? pantryCarts[0] ?? null;

  const focusSearch = useCallback(() => {
    if (isIOS) {
      searchBarRef.current?.focus();
      return;
    }

    searchInputRef.current?.focus();
  }, []);

  const blurSearch = useCallback(() => {
    if (isIOS) {
      searchBarRef.current?.blur();
      return;
    }

    searchInputRef.current?.blur();
  }, []);

  useEffect(() => {
    if (entry !== 'manual') {
      return;
    }

    setQuery('');

    const frame = requestAnimationFrame(() => {
      if (isIOS) {
        searchBarRef.current?.clearText();
      } else {
        searchInputRef.current?.clear();
      }

      focusSearch();
    });

    return () => cancelAnimationFrame(frame);
  }, [entry, focusSearch, nonce]);

  useFocusEffect(
    useCallback(() => {
      const frame = requestAnimationFrame(() => {
        focusSearch();
      });

      return () => cancelAnimationFrame(frame);
    }, [focusSearch])
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

  const handlePrimaryAction = () => {
    blurSearch();

    if (results.exactMatch) {
      router.push(`/items/${results.exactMatch.id}`);
      return;
    }

    if (!trimmedQuery) {
      return;
    }

    router.push(`/items/new?name=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleScanBarcode = () => {
    blurSearch();
    router.push('/items/scan');
  };

  const renderScanIconButton = () => (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Scan barcode"
      accessibilityHint="Open the barcode scanner to find or create an item"
      onPress={handleScanBarcode}
      style={({pressed}) => [styles.scanIconButton, pressed ? styles.scanIconButtonPressed : null]}
    >
      <Ionicons name="barcode-outline" size={18} color={appColors.text} />
    </Pressable>
  );

  if (!selectedPantry) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Search + Add',
          }}
        />
        <View style={styles.emptyScreen}>
          <EmptyNotice
            title="No pantry workspace yet"
            body="Select a pantry first so search can run against the active inventory."
          />
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Explore',
        }}
      />
      {isIOS ? (
        <Stack.SearchBar
          ref={searchBarRef}
          autoCapitalize="none"
          barTintColor={appColors.card}
          placeholder="Search by name or barcode"
          placement="automatic"
          textColor={appColors.text}
          tintColor={appColors.tint}
          hideWhenScrolling={false}
          allowToolbarIntegration={false}
          onCancelButtonPress={() => setQuery('')}
          onChangeText={event => setQuery(event.nativeEvent.text)}
        />
      ) : null}
      <FlatList
        style={styles.screen}
        data={visibleItems}
        keyExtractor={item => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={isIOS ? 'interactive' : 'on-drag'}
        ListHeaderComponent={
          <View style={styles.searchSection}>
            <Text style={styles.eyebrow}>{trimmedQuery ? 'Search Results' : 'All Items'}</Text>
            {isIOS ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Scan barcode"
                accessibilityHint="Open the barcode scanner to find or create an item"
                onPress={handleScanBarcode}
                style={({pressed}) => [styles.scanAction, pressed ? styles.scanActionPressed : null]}
              >
                <Ionicons name="barcode-outline" size={18} color={appColors.text} />
                <Text style={styles.scanActionText}>Scan barcode</Text>
              </Pressable>
            ) : (
              <AppTextInput
                value={query}
                onChangeText={setQuery}
                placeholder="Search by name or barcode"
                autoCapitalize="none"
                autoFocus
                inputRef={searchInputRef}
                rightSlot={renderScanIconButton()}
              />
            )}
            <Text style={styles.searchMeta}>
              {trimmedQuery
                ? `${visibleItems.length} ${visibleItems.length === 1 ? 'match' : 'matches'} in ${selectedPantry.name}`
                : `${visibleItems.length} ${visibleItems.length === 1 ? 'item' : 'items'} in ${selectedPantry.name}`}
            </Text>
            {trimmedQuery ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={results.exactMatch ? 'Open existing item' : `Add ${trimmedQuery} as new item`}
                onPress={handlePrimaryAction}
                style={({pressed}) => [styles.primaryAction, pressed ? styles.primaryActionPressed : null]}
              >
                <Text style={styles.primaryActionText}>
                  {results.exactMatch ? 'Open existing item' : `Add "${trimmedQuery}" as new item`}
                </Text>
              </Pressable>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.listEmpty}>
            <EmptyNotice
              title={trimmedQuery ? 'No matching items' : 'No search suggestions yet'}
              body={
                trimmedQuery
                  ? 'Try a broader name fragment or a full barcode value.'
                  : 'Add pantry items to search them here.'
              }
            />
          </View>
        }
        renderItem={({item, index}) => {
          const cartName = pantryCarts.find(cart => cart.id === item.cartId)?.name ?? null;

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
  primaryAction: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: appColors.tint,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  primaryActionPressed: {
    opacity: 0.75,
  },
  primaryActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: appColors.textInverse,
    textAlign: 'center',
  },
  scanIconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.tintSoft,
  },
  scanIconButtonPressed: {
    opacity: 0.75,
  },
  scanAction: {
    minHeight: 46,
    borderRadius: 16,
    backgroundColor: appColors.tintSoft,
    borderWidth: 1,
    borderColor: appColors.border,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  scanActionPressed: {
    opacity: 0.75,
  },
  scanActionText: {
    fontSize: 15,
    fontWeight: '700',
    color: appColors.text,
  },
  listEmpty: {
    paddingHorizontal: 16,
    paddingTop: 6,
  },
});
