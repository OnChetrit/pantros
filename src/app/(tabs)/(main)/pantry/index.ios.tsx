import { ListItem } from '@expo/ui';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { listStyle } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo } from 'react';
import { Alert, LayoutAnimation, StyleSheet, View } from 'react-native';
import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { EmptyNotice } from '@/components/ui/primitives';
import { parsePantrySortOption } from '@/features/pantry/pantry-sort/pantry-sort-options';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

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
        }}
      />
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
        <Stack.Toolbar.Button
          icon="person.crop.circle"
          onPress={() => router.push('/account/menu')}
        />
      </Stack.Toolbar>
      <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.background}]}>
        <List modifiers={[listStyle('insetGrouped')]}>
          <Section title="Pantry">
            {visibleItems.length > 0 ? (
              visibleItems.map((item, index) => {
                const leftActionLabel = item.isInCart ? 'Move to Pantry' : 'Add to Cart';
                const onLeftAction = item.isInCart
                  ? () => void handleMoveToPantry(item.id)
                  : () => void handleAddToCart(item.id);

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
                    onDelete={() => void deleteItem(item.id)}
                  />
                );
              })
            ) : (
              <ListItem key="empty-pantry">
                <View style={styles.noticeRow}>
                  <EmptyNotice
                    title="No pantry items yet"
                    body="Add your first inventory item to start using the pantry as a real iOS-style list with quick actions."
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
  noticeRow: {
    paddingHorizontal: 4,
    paddingVertical: 6,
  },
});
