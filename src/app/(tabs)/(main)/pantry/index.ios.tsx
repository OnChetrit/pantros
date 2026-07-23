import { PantryItemNativeListRow } from '@/components/pantry/pantry-item-row/pantry-item-row';
import { AppButton } from '@/components/ui/primitives';
import { useTabBarVisibility } from '@/features/navigation/tab-bar-visibility-context/tab-bar-visibility-context';
import { parsePantrySortOption, SORT_OPTIONS } from '@/features/pantry/pantry-sort/pantry-sort-options';
import { useAppTheme } from '@/lib/theme';
import { PartialItemActionError, useAppContext } from '@/state/app-context';
import { Host, List, Section } from '@expo/ui/swift-ui';
import { environment, listStyle, scrollContentBackground, tint } from '@expo/ui/swift-ui/modifiers';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, Image, LayoutAnimation, StyleSheet, Text, View } from 'react-native';

const pantryEmptyIllustration = require('../../../../../assets/images/pantry-empty-state-transparent.png');

export default function PantryScreen() {
  const {
    deleteItem,
    deleteItems,
    moveItemToCart,
    moveItemsToCart,
    moveItemToPantry,
    pantryCarts,
    pantryItems,
    selectedPantry,
  } = useAppContext();
  const {colors, isDark} = useAppTheme();
  const {setTabBarHidden} = useTabBarVisibility();
  const router = useRouter();
  const {sort} = useLocalSearchParams<{sort?: string | string[]}>();
  const sortOption = parsePantrySortOption(sort);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [manualItemOrder, setManualItemOrder] = useState<string[] | null>(null);

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

    const sortedItems = [...pantryItems].sort(compareBySort);

    if (!manualItemOrder) {
      return sortedItems;
    }

    const itemsById = new Map(sortedItems.map(item => [item.id, item]));
    const orderedItems = manualItemOrder
      .map(itemId => itemsById.get(itemId))
      .filter((item): item is (typeof sortedItems)[number] => Boolean(item));
    const orderedItemIds = new Set(orderedItems.map(item => item.id));

    return [...orderedItems, ...sortedItems.filter(item => !orderedItemIds.has(item.id))];
  }, [manualItemOrder, pantryItems, sortOption]);

  const primaryCart = pantryCarts.find(cart => cart.isPrimary) ?? pantryCarts[0] ?? null;
  const allSelectableItems = useMemo(() => visibleItems.filter(item => !item.isInCart), [visibleItems]);
  const selectableItemIds = useMemo(() => new Set(allSelectableItems.map(item => item.id)), [allSelectableItems]);
  const selectedSelectableItemIds = useMemo(
    () => selectedItemIds.filter(itemId => selectableItemIds.has(itemId)),
    [selectableItemIds, selectedItemIds]
  );
  const selectedCount = selectedSelectableItemIds.length;
  const selectionModeActive = isSelectionMode;
  const allSelected = allSelectableItems.length > 0 && selectedCount === allSelectableItems.length;

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

  const exitSelectionMode = () => {
    animateListLayout();
    setTabBarHidden(false);
    setIsSelectionMode(false);
    setSelectedItemIds([]);
  };

  const enterSelectionMode = (itemId?: string) => {
    animateListLayout();
    setTabBarHidden(true);
    setIsSelectionMode(true);
    setSelectedItemIds(itemId ? [itemId] : []);
  };

  const handleSelectAll = () => {
    animateListLayout();

    if (allSelected) {
      setSelectedItemIds([]);
      return;
    }

    setSelectedItemIds(allSelectableItems.map(item => item.id));
  };

  const handleAddSelectionToCart = async () => {
    if (selectedCount === 0) {
      return;
    }

    if (!primaryCart) {
      Alert.alert('No cart available', 'Create a cart before sending items to purchase.');
      return;
    }

    animateListLayout();

    try {
      await moveItemsToCart(selectedSelectableItemIds, primaryCart.id);
      exitSelectionMode();
    } catch (error) {
      const completedItemIds = error instanceof PartialItemActionError ? error.completedItemIds : [];

      if (completedItemIds.length > 0) {
        setSelectedItemIds(current => current.filter(itemId => !completedItemIds.includes(itemId)));
      }

      Alert.alert('Unable to add all items', error instanceof Error ? error.message : 'Try again in a moment.');
    }
  };

  const handleDeleteSelection = () => {
    if (selectedCount === 0) {
      return;
    }

    Alert.alert(
      selectedCount === 1 ? 'Delete Item' : 'Delete Items',
      selectedCount === 1 ? 'Delete the selected item?' : `Delete ${selectedCount} selected items?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              animateListLayout();

              try {
                await deleteItems(selectedSelectableItemIds);
                exitSelectionMode();
              } catch (error) {
                const completedItemIds = error instanceof PartialItemActionError ? error.completedItemIds : [];

                if (completedItemIds.length > 0) {
                  setSelectedItemIds(current => current.filter(itemId => !completedItemIds.includes(itemId)));
                }

                Alert.alert(
                  'Unable to delete all items',
                  error instanceof Error ? error.message : 'Try again in a moment.'
                );
              }
            })();
          },
        },
      ]
    );
  };

  if (!selectedPantry) {
    return (
      <View style={styles.emptyScreen}>
        <View style={styles.emptyStateCopy}>
          <Text style={[styles.emptyStateTitle, {color: colors.text}]}>No pantry workspace yet</Text>
          <Text style={[styles.emptyStateBody, {color: colors.muted}]}>
            The app is authenticated and loaded correctly, but there is no pantry membership yet. The next workspace
            step is pantry creation and join-by-code flows.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Pantry',
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button onPress={exitSelectionMode} hidden={!selectionModeActive}>
          Cancel
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Menu icon="arrow.up.arrow.down" title="Sort" hidden={selectionModeActive}>
          {SORT_OPTIONS.map(option => (
            <Stack.Toolbar.MenuAction
              key={option.key}
              isOn={option.key === sortOption}
              onPress={() =>
                (() => {
                  setManualItemOrder(null);
                  router.replace({
                    pathname: '/pantry',
                    params: {sort: option.key},
                  });
                })()
              }
            >
              {option.label}
            </Stack.Toolbar.MenuAction>
          ))}
        </Stack.Toolbar.Menu>
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={handleSelectAll}
          hidden={!selectionModeActive}
          disabled={allSelectableItems.length === 0}
          variant="prominent"
        >
          {allSelected ? 'Clear' : 'Select All'}
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          onPress={() => enterSelectionMode()}
          hidden={selectionModeActive}
          disabled={allSelectableItems.length === 0}
        >
          Select
        </Stack.Toolbar.Button>
        <Stack.Toolbar.Button
          icon="person.crop.circle"
          onPress={() => router.push('/account/menu')}
          hidden={selectionModeActive}
        />
      </Stack.Toolbar>
      {selectionModeActive ? (
        <Stack.Toolbar placement="bottom">
          <Stack.Toolbar.Button
            onPress={() => void handleAddSelectionToCart()}
            disabled={selectedCount === 0}
            tintColor={colors.warning}
            icon="cart.badge.plus"
          />
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.View>
            <View style={styles.selectionCountView}>
              <Text style={[styles.selectionCountText, {color: colors.text}]}>{selectedCount} selected</Text>
            </View>
          </Stack.Toolbar.View>
          <Stack.Toolbar.Spacer />
          <Stack.Toolbar.Button
            onPress={handleDeleteSelection}
            disabled={selectedCount === 0}
            tintColor={colors.danger}
            icon="trash"
          />
        </Stack.Toolbar>
      ) : null}
      {visibleItems.length === 0 ? (
        <View style={[styles.emptyStateScreen, {backgroundColor: colors.card}]}>
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
        <Host colorScheme={isDark ? 'dark' : 'light'} style={[styles.host, {backgroundColor: colors.card}]}>
          <List
            modifiers={[
              listStyle('plain'),
              scrollContentBackground('visible'),
              tint(colors.card),
              environment({key: 'editMode', value: selectionModeActive ? 'active' : 'inactive'}),
            ]}
            selection={selectionModeActive ? selectedSelectableItemIds : undefined}
            onSelectionChange={selection => {
              const nextSelectedItemIds = selection.filter(
                (itemId): itemId is string => typeof itemId === 'string' && selectableItemIds.has(itemId)
              );

              if (nextSelectedItemIds.length === 0) {
                setSelectedItemIds([]);
                return;
              }

              setSelectedItemIds(nextSelectedItemIds);
            }}
          >
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
                    onPress={() => {
                      if (selectionModeActive && !item.isInCart) {
                        return;
                      }

                      router.push(`/items/${item.id}`);
                    }}
                    onEdit={() => router.push(`/items/${item.id}`)}
                    onReviewExpiration={
                      item.isInCart || selectionModeActive
                        ? undefined
                        : () =>
                            router.push({
                              pathname: '/pantry/review-expiration',
                              params: {itemId: item.id},
                            })
                    }
                    onReviewQuantity={
                      item.isInCart && !selectionModeActive
                        ? () =>
                            router.push({
                              pathname: '/pantry/quantity',
                              params: {itemId: item.id},
                            })
                        : undefined
                    }
                    leftActionLabel={selectionModeActive ? undefined : leftActionLabel}
                    onLeftAction={selectionModeActive ? undefined : onLeftAction}
                    onDelete={() => void handleDelete()}
                    isSelectionMode={selectionModeActive}
                    isSelected={selectedSelectableItemIds.includes(item.id)}
                    onStartSelection={item.isInCart ? undefined : () => enterSelectionMode(item.id)}
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
  selectionCountView: {
    width: 120,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectionCountText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
    textAlign: 'center',
  },
});
