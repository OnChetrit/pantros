import { AppButton } from '@/components/ui/primitives';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { parsePantrySortOption } from '@/features/pantry/pantry-sort/pantry-sort-options';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Image, LayoutAnimation, StyleSheet, Text, View } from 'react-native';

const pantryEmptyIllustration = require('../../../../../assets/images/pantry-empty-state-transparent.png');

export default function PantryScreen() {
  const {deleteItem, moveItemToCart, moveItemToPantry, pantryCarts, pantryItems, selectedPantry} = useAppContext();
  const {colors, isDark} = useAppTheme();
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
        <View style={styles.emptyStateCopy}>
          <Text style={[styles.emptyStateTitle, {color: colors.text}]}>No pantry workspace yet</Text>
          <Text style={[styles.emptyStateBody, {color: colors.muted}]}>
            The app is authenticated and loaded correctly, but there is no pantry membership yet. The next workspace step is pantry creation and join-by-code flows.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{}} />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="arrow.up.arrow.down"
          onPress={() =>
            router.push({
              pathname: '/pantry/sort',
              params: {sort: sortOption},
            })
          }
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button icon="person.crop.circle" onPress={() => router.push('/account/menu')} />
      </Stack.Toolbar>
      {visibleItems.length === 0 ? (
        <View style={[styles.emptyStateScreen, {backgroundColor: colors.background}]}>
          <View style={styles.emptyStateContent}>
            <Image source={pantryEmptyIllustration} style={styles.illustration} resizeMode="contain" />
            <View style={styles.emptyStateCopy}>
              <Text style={[styles.emptyStateTitle, {color: colors.text}]}>Your pantry is ready to stock</Text>
              <Text style={[styles.emptyStateBody, {color: colors.muted}]}>
                Add your first item to start tracking what&apos;s on hand and what needs to be bought next.
              </Text>
            </View>
            <View style={styles.emptyStateAction}>
              <AppButton label="Add Item" onPress={() => router.push('/items/new')} />
            </View>
          </View>
        </View>
      ) : (
        <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.background}]}>
          <List modifiers={[listStyle('insetGrouped')]}>
            <Section title="">
              {visibleItems.map((item, index) => {
                const leftActionLabel = item.isInCart ? 'Move to Pantry' : 'Add to Cart';
                const onLeftAction = item.isInCart
                  ? () => void handleMoveToPantry(item.id)
                  : () => void handleAddToCart(item.id);
                const handleDelete = async () => {
                  LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                  await deleteItem(item.id);
                };

                return (
                  <PantryItemNativeListRow
                    key={item.id}
                    item={item}
                    displayMode={item.isInCart ? 'cart' : 'pantry'}
                    isLast={index === visibleItems.length - 1}
                    onPress={() => router.push(`/items/${item.id}`)}
                    onEdit={() => router.push(`/items/${item.id}`)}
                    onReviewExpiration={
                      item.isInCart
                        ? undefined
                        : () =>
                            router.push({
                              pathname: '/pantry/review-expiration',
                              params: {itemId: item.id},
                            })
                    }
                    onReviewQuantity={
                      item.isInCart
                        ? () =>
                            router.push({
                              pathname: '/pantry/quantity',
                              params: {itemId: item.id},
                            })
                        : undefined
                    }
                    leftActionLabel={leftActionLabel}
                    onLeftAction={onLeftAction}
                    onDelete={() => void handleDelete()}
                  />
                );
              })}
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
  emptyStateAction: {
    width: '100%',
    maxWidth: 240,
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
