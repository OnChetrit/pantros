import { ListItem } from '@expo/ui';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, View, Pressable } from 'react-native';

import { createIconHeaderButton } from '@/components/navigation/native-header-items';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

export default function SearchScreen() {
  const { deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry } = useAppContext();
  const { colors, isDark } = useAppTheme();
  const router = useRouter();
  const [query, setQuery] = useState('');

  const trimmedQuery = query.trim();
  const results = useMemo(() => matchPantryItems(pantryItems, query), [pantryItems, query]);
  const visibleItems = results.visibleResults;
  const primaryCart = pantryCarts.find(cart => cart.isPrimary) ?? pantryCarts[0] ?? null;

  const handleAddToCart = async (itemId: string) => {
    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    await moveItemToCart(itemId, primaryCart.id);
  };

  const handlePrimaryAction = () => {
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
      />
      <Host
        colorScheme={isDark ? 'dark' : 'light'}
        style={[styles.host, { backgroundColor: colors.background }]}
        useViewportSizeMeasurement
      >
        <List modifiers={[listStyle('insetGrouped')]}>
          <ListItem key="search-header">
            <View style={styles.searchSection}>
              <Text style={[styles.eyebrow, { color: colors.muted }]}>
                {trimmedQuery ? 'Search Results' : 'All Items'}
              </Text>
              <Text style={[styles.searchMeta, { color: colors.muted }]}>
                {trimmedQuery
                  ? `${visibleItems.length} ${visibleItems.length === 1 ? 'match' : 'matches'} in ${selectedPantry.name}`
                  : `${visibleItems.length} ${visibleItems.length === 1 ? 'item' : 'items'} in ${selectedPantry.name}`}
              </Text>
              {trimmedQuery ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={results.exactMatch ? 'Open existing item' : `Add ${trimmedQuery} as new item`}
                  onPress={handlePrimaryAction}
                  style={({ pressed }) => [
                    styles.primaryAction,
                    { backgroundColor: colors.tint },
                    pressed ? styles.primaryActionPressed : null,
                  ]}
                >
                  <Text style={[styles.primaryActionText, { color: colors.textInverse }]}>
                    {results.exactMatch ? 'Open existing item' : `Add "${trimmedQuery}" as new item`}
                  </Text>
                </Pressable>
                ) : null}
            </View>
          </ListItem>
          <Section title={trimmedQuery ? 'Results' : 'Items'}>
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
                  onLeftAction={item.isInCart ? () => void moveItemToPantry(item.id) : () => void handleAddToCart(item.id)}
                  onDelete={() => void deleteItem(item.id)}
                />
              ))
            ) : (
              <ListItem key="empty-search">
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
              </ListItem>
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
  searchSection: {
    paddingHorizontal: 4,
    paddingTop: 4,
    paddingBottom: 12,
    gap: 8,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  searchMeta: {
    fontSize: 13,
    paddingHorizontal: 2,
  },
  primaryAction: {
    minHeight: 46,
    borderRadius: 16,
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
    textAlign: 'center',
  },
  listEmpty: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
});
