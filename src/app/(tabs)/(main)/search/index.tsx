import type { TextInputRef } from '@expo/ui';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Alert, FlatList, StyleSheet, Text, View } from 'react-native';

import { createIconHeaderButton } from '@/components/navigation/native-header-items/native-header-items';
import { PantryItemRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { EmptyNotice, ListRow } from '@/components/ui/primitives';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useAppTheme, useThemedStyles } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function SearchScreen() {
  const {deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry} = useAppContext();
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);
  const router = useRouter();
  const [query, setQuery] = useState('');
  const searchInputRef = useRef<TextInputRef>(null);

  const trimmedQuery = query.trim();
  const results = useMemo(() => matchPantryItems(pantryItems, query), [pantryItems, query]);
  const visibleItems = results.visibleResults;
  const shouldShowCreateItem = Boolean(trimmedQuery) && !results.exactMatch;
  const primaryCart = pantryCarts.find(cart => cart.isPrimary) ?? pantryCarts[0] ?? null;

  const handleAddToCart = async (itemId: string) => {
    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    await moveItemToCart(itemId, primaryCart.id);
  };

  const handleCreateItem = () => {
    if (!trimmedQuery) {
      return;
    }

    router.push(`/items/new?name=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleScanBarcode = () => {
    router.push('/items/scan');
  };

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
          unstable_headerRightItems: () => [
            createIconHeaderButton({icon: 'barcode', label: 'Barcode', onPress: handleScanBarcode}),
          ],
          // headerRight: () => (
          //   <Host style={styles.headerActions} matchContents>
          //     <Row alignment="center" spacing={10}>
          //       <RNHostView matchContents>
          //         <Pressable
          //           accessibilityRole="button"
          //           accessibilityLabel="Scan barcode"
          //           accessibilityHint="Open the barcode scanner to find or create an item"
          //           onPress={handleScanBarcode}
          //           style={({pressed}) => [styles.headerIconButton, pressed ? styles.headerIconButtonPressed : null]}
          //         >
          //           <Ionicons name="barcode-outline" size={22} color={colors.tint} />
          //         </Pressable>
          //       </RNHostView>
          //       <RNHostView matchContents>
          //         <AvatarSidebarButton />
          //       </RNHostView>
          //     </Row>
          //   </Host>
          // ),
        }}
      />
      <FlatList
        style={styles.screen}
        data={visibleItems}
        keyExtractor={item => item.id}
        contentInsetAdjustmentBehavior="automatic"
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        ListHeaderComponent={
          <View style={styles.searchSection}>
            <Text style={styles.eyebrow}>{trimmedQuery ? 'Search Results' : 'All Items'}</Text>
            {/* <AppTextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search by name or barcode"
              autoCapitalize="none"
              autoFocus
              inputRef={searchInputRef}
            /> */}
            <Text style={styles.searchMeta}>
              {trimmedQuery
                ? `${visibleItems.length} ${visibleItems.length === 1 ? 'match' : 'matches'} in ${selectedPantry.name}`
                : `${visibleItems.length} ${visibleItems.length === 1 ? 'item' : 'items'} in ${selectedPantry.name}`}
            </Text>
            {shouldShowCreateItem ? (
              <ListRow title={trimmedQuery} subtitle="Create a new item with this name" onPress={handleCreateItem} />
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
          return (
            <PantryItemRow
              item={item}
              displayMode="pantry"
              isLast={index === visibleItems.length - 1}
              onPress={() => router.push(`/items/${item.id}`)}
              onEdit={() => router.push(`/items/${item.id}`)}
              leftActionLabel={item.isInCart ? 'Move to Pantry' : 'Add to Cart'}
              onLeftAction={item.isInCart ? () => void moveItemToPantry(item.id) : () => void handleAddToCart(item.id)}
              onDelete={() => void deleteItem(item.id)}
            />
          );
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
      paddingBottom: 40,
    },
    emptyScreen: {
      flex: 1,
      backgroundColor: colors.background,
      padding: 20,
      justifyContent: 'center',
    },
    headerActions: {},
    headerIconButton: {
      minWidth: 36,
      minHeight: 36,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerIconButtonPressed: {
      opacity: 0.76,
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
      color: colors.muted,
    },
    searchMeta: {
      fontSize: 13,
      color: colors.muted,
      paddingHorizontal: 2,
    },
    listEmpty: {
      paddingHorizontal: 16,
      paddingTop: 6,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
  });
