import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';
import { ListItem } from '@expo/ui';
import { Host, HStack, List, Section, Spacer, Text } from '@expo/ui/swift-ui';
import { font, foregroundStyle, listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { SearchBarCommands } from 'react-native-screens';
import { Alert, Image, LayoutAnimation, StyleSheet, Text as RNText, View } from 'react-native';

const searchEmptyIllustration = require('../../../../../assets/images/search-empty-state-transparent.png');

export default function SearchScreen() {
  const {deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry} = useAppContext();
  const {colors, isDark} = useAppTheme();
  const router = useRouter();
  const searchBarRef = useRef<SearchBarCommands | null>(null);
  const {entry, q} = useLocalSearchParams<{entry?: string | string[]; q?: string | string[]}>();
  const query = Array.isArray(q) ? (q[0] ?? '') : (q ?? '');
  const entryMode = Array.isArray(entry) ? entry[0] : entry;

  const trimmedQuery = query.trim();
  const results = useMemo(() => matchPantryItems(pantryItems, query), [pantryItems, query]);
  const visibleItems = results.visibleResults;
  const shouldShowCreateItem = Boolean(trimmedQuery) && !results.exactMatch;
  const primaryCart = pantryCarts.find(cart => cart.isPrimary) ?? pantryCarts[0] ?? null;

  const animateListLayout = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const handleAddToCart = async (itemId: string) => {
    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    animateListLayout();
    await moveItemToCart(itemId, primaryCart.id);
  };

  const handleMoveToPantry = async (itemId: string) => {
    animateListLayout();
    await moveItemToPantry(itemId);
  };

  const handleDelete = async (itemId: string) => {
    animateListLayout();
    await deleteItem(itemId);
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

  useEffect(() => {
    if (entryMode !== 'manual') {
      return;
    }

    router.setParams({entry: undefined, nonce: undefined});
  }, [entryMode, router]);

  useFocusEffect(
    useCallback(() => {
      const focusFrame = requestAnimationFrame(() => {
        searchBarRef.current?.setText(query);
        searchBarRef.current?.focus();
      });

      return () => cancelAnimationFrame(focusFrame);
    }, [query])
  );

  if (!selectedPantry) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Explore',
            headerSearchBarOptions: {
              ref: searchBarRef,
              placeholder: 'Search by name or barcode',
              autoCapitalize: 'none',
              hideWhenScrolling: false,
              placement: 'automatic',
              onChangeText: event => {
                const text = event.nativeEvent.text;
                router.setParams({
                  q: text.length > 0 ? text : undefined,
                  entry: undefined,
                  nonce: undefined,
                });
              },
              onCancelButtonPress: () => {
                router.setParams({
                  q: undefined,
                  entry: undefined,
                  nonce: undefined,
                });
              },
            },
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
          headerSearchBarOptions: {
            ref: searchBarRef,
            placeholder: 'Search by name or barcode',
            autoCapitalize: 'none',
            hideWhenScrolling: false,
            placement: 'automatic',
            onChangeText: event => {
              const text = event.nativeEvent.text;
              router.setParams({
                q: text.length > 0 ? text : undefined,
                entry: undefined,
                nonce: undefined,
              });
            },
            onCancelButtonPress: () => {
              router.setParams({
                q: undefined,
                entry: undefined,
                nonce: undefined,
              });
            },
          },
        }}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="barcode.viewfinder" onPress={handleScanBarcode} />
        <Stack.Toolbar.Button icon="person.crop.circle" onPress={() => router.push('/account/menu')} />
      </Stack.Toolbar>
      {visibleItems.length === 0 && !shouldShowCreateItem ? (
        <View style={[styles.emptyStateScreen, {backgroundColor: colors.background}]}>
          <View style={styles.emptyStateContent}>
            <Image source={searchEmptyIllustration} style={styles.illustration} resizeMode="contain" />
            <View style={styles.emptyStateCopy}>
              <RNText style={[styles.emptyStateTitle, {color: colors.text}]}>
                {trimmedQuery ? 'No matches yet' : 'Search the pantry'}
              </RNText>
              <RNText style={[styles.emptyStateBody, {color: colors.muted}]}>
                {trimmedQuery
                  ? 'Try a broader item name or scan a barcode to look again.'
                  : 'Search by name or barcode to quickly find what is already in your pantry.'}
              </RNText>
            </View>
          </View>
        </View>
      ) : (
        <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.background}]}>
          <List modifiers={[listStyle('insetGrouped')]}>
            <Section title={trimmedQuery ? 'Search Results' : 'All Items'}>
              {shouldShowCreateItem ? (
                <ListItem onPress={handleCreateItem}>
                  <HStack spacing={4}>
                    <Text modifiers={[font({weight: 'semibold', size: 17}), foregroundStyle(colors.text)]}>
                      {trimmedQuery}
                    </Text>
                    <Spacer />
                    <Text modifiers={[font({size: 13}), foregroundStyle(colors.muted)]}>
                      Create a new item with this name
                    </Text>
                  </HStack>
                </ListItem>
              ) : null}
              {visibleItems.map((item, index) => (
                <PantryItemNativeListRow
                  key={item.id}
                  item={item}
                  displayMode="pantry"
                  isLast={index === visibleItems.length - 1}
                  onPress={() => router.push(`/items/${item.id}`)}
                  onEdit={() => router.push(`/items/${item.id}`)}
                  leftActionLabel={item.isInCart ? 'Move to Pantry' : 'Add to Cart'}
                  onLeftAction={
                    item.isInCart ? () => void handleMoveToPantry(item.id) : () => void handleAddToCart(item.id)
                  }
                  onDelete={() => void handleDelete(item.id)}
                />
              ))}
            </Section>
          </List>
        </Host>
      )}
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
  emptyStateScreen: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyStateContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 72,
    gap: 18,
  },
  emptyStateCopy: {
    maxWidth: 320,
    gap: 8,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyStateBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
  },
  illustration: {
    width: 260,
    height: 260,
    alignSelf: 'center',
  },
});
