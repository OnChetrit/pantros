import { ListItem } from '@expo/ui';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import { createIconHeaderButton } from '@/components/navigation/native-header-items/native-header-items';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function SearchScreen() {
  const {deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry} = useAppContext();
  const {colors, isDark} = useAppTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

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
            createIconHeaderButton({
              label: 'Scan barcode',
              icon: 'barcode.viewfinder',
              onPress: handleScanBarcode,
              tintColor: colors.tint,
              accessibilityHint: 'Open the barcode scanner to find or create an item',
            }),
            createIconHeaderButton({
              label: 'Open account menu',
              icon: 'person.crop.circle',
              onPress: () => router.push('/account/menu'),
              tintColor: colors.tint,
            }),
          ],
        }}
      />
      <Stack.SearchBar
        autoCapitalize="none"
        barTintColor={colors.card}
        placeholder="Search by name or barcode"
        placement="automatic"
        textColor={colors.text}
        tintColor={colors.tint}
        hideWhenScrolling={false}
        allowToolbarIntegration={false}
        onCancelButtonPress={() => setQuery('')}
        onChangeText={event => setQuery(event.nativeEvent.text)}
        autoFocus
      />
      <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.background}]}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title={trimmedQuery ? 'Search Results' : 'All Items'}>
            {shouldShowCreateItem ? (
              <ListItem onPress={handleCreateItem}>
                <View style={styles.createRowContent}>
                  <Text numberOfLines={1} style={[styles.createTitle, {color: colors.text}]}>
                    {trimmedQuery}
                  </Text>
                  <Text style={[styles.createMeta, {color: colors.muted}]}>Create a new item with this name</Text>
                </View>
              </ListItem>
            ) : null}
            {visibleItems.length > 0 ? (
              visibleItems.map((item, index) => (
                <PantryItemNativeListRow
                  key={item.id}
                  item={item}
                  displayMode="pantry"
                  isLast={index === visibleItems.length - 1}
                  onPress={() => router.push(`/items/${item.id}`)}
                  onEdit={() => router.push(`/items/${item.id}`)}
                  leftActionLabel={item.isInCart ? 'Move to Pantry' : 'Add to Cart'}
                  onLeftAction={
                    item.isInCart ? () => void moveItemToPantry(item.id) : () => void handleAddToCart(item.id)
                  }
                  onDelete={() => void deleteItem(item.id)}
                />
              ))
            ) : (
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
            )}
          </Section>
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
  createRowContent: {
    minHeight: 54,
    justifyContent: 'center',
    gap: 4,
  },
  createTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 22,
  },
  createMeta: {
    fontSize: 13,
    lineHeight: 18,
  },
  listEmpty: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
});
