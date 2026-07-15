import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { PantryItem, PantryItemInput } from '@/domain/models';
import {
  createPantryItem,
  deletePantryItem,
  movePantryItemToCart,
  movePantryItemToPantry,
  updatePantryItem,
} from '@/services/supabase/item-service';

import { useWorkspaceState } from './workspace-state';

type ItemStateContextValue = {
  itemBusy: boolean;
  errorMessage: string | null;
  addItem: (input: PantryItemInput) => Promise<PantryItem>;
  updateItem: (itemId: string, input: PantryItemInput) => Promise<PantryItem>;
  moveItemToCart: (itemId: string, cartId: string | null) => Promise<PantryItem>;
  moveItemsToCart: (itemIds: string[], cartId: string | null) => Promise<PantryItem[]>;
  moveItemToPantry: (itemId: string) => Promise<PantryItem>;
  moveItemsToPantry: (itemIds: string[]) => Promise<PantryItem[]>;
  completeCartItemWithExpiration: (
    itemId: string,
    expirationDate: string | null
  ) => Promise<PantryItem>;
  deleteItem: (itemId: string) => Promise<void>;
  deleteItems: (itemIds: string[]) => Promise<void>;
};

const ItemStateContext = createContext<ItemStateContextValue | undefined>(undefined);

export class PartialItemActionError extends Error {
  completedItemIds: string[];
  failedItemId: string | null;

  constructor(message: string, options?: {completedItemIds?: string[]; failedItemId?: string | null}) {
    super(message);
    this.name = 'PartialItemActionError';
    this.completedItemIds = options?.completedItemIds ?? [];
    this.failedItemId = options?.failedItemId ?? null;
  }
}

export function ItemStateProvider({children}: PropsWithChildren) {
  const {items, setItems} = useWorkspaceState();
  const [itemBusy, setItemBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const addItem = useCallback(async (input: PantryItemInput) => {
    setItemBusy(true);
    setErrorMessage(null);

    try {
      const createdItem = await createPantryItem(input);
      setItems((currentItems) => [createdItem, ...currentItems]);
      return createdItem;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add item.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [setItems]);

  const updateItem = useCallback(async (itemId: string, input: PantryItemInput) => {
    setItemBusy(true);
    setErrorMessage(null);

    try {
      const savedItem = await updatePantryItem(itemId, input);
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update item.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [setItems]);

  const moveItemToCart = useCallback(async (itemId: string, cartId: string | null) => {
    setItemBusy(true);
    setErrorMessage(null);
    const previousItem = items.find((item) => item.id === itemId) ?? null;

    if (previousItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isInCart: true,
                cartId,
              }
            : item
        )
      );
    }

    try {
      const savedItem = await movePantryItemToCart(itemId, cartId);
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      if (previousItem) {
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? previousItem : item)));
      }

      const message = error instanceof Error ? error.message : 'Unable to move item to cart.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [items, setItems]);

  const deleteItem = useCallback(async (itemId: string) => {
    setItemBusy(true);
    setErrorMessage(null);

    try {
      await deletePantryItem(itemId);
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete item.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [setItems]);

  const deleteItems = useCallback(async (itemIds: string[]) => {
    if (itemIds.length === 0) {
      return;
    }

    setItemBusy(true);
    setErrorMessage(null);

    const previousItems = items;

    setItems((currentItems) => currentItems.filter((item) => !itemIds.includes(item.id)));

    const completedItemIds: string[] = [];

    try {
      for (const itemId of itemIds) {
        await deletePantryItem(itemId);
        completedItemIds.push(itemId);
      }
    } catch (error) {
      setItems(previousItems);

      const failedItemId = itemIds.find((itemId) => !completedItemIds.includes(itemId)) ?? null;
      const message = error instanceof Error ? error.message : 'Unable to delete selected items.';
      setErrorMessage(message);
      throw new PartialItemActionError(message, {
        completedItemIds,
        failedItemId,
      });
    } finally {
      setItemBusy(false);
    }
  }, [items, setItems]);

  const moveItemToPantry = useCallback(async (itemId: string) => {
    setItemBusy(true);
    setErrorMessage(null);
    const previousItem = items.find((item) => item.id === itemId) ?? null;

    if (previousItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isInCart: false,
                cartId: null,
              }
            : item
        )
      );
    }

    try {
      const savedItem = await movePantryItemToPantry(itemId);
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      if (previousItem) {
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? previousItem : item)));
      }

      const message = error instanceof Error ? error.message : 'Unable to move item back to pantry.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [items, setItems]);

  const moveItemsToCart = useCallback(async (itemIds: string[], cartId: string | null) => {
    if (itemIds.length === 0) {
      return [];
    }

    setItemBusy(true);
    setErrorMessage(null);

    const previousItems = new Map(
      itemIds
        .map((itemId) => {
          const item = items.find((candidate) => candidate.id === itemId);
          return item ? [itemId, item] : null;
        })
        .filter(Boolean) as [string, PantryItem][]
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        previousItems.has(item.id)
          ? {
              ...item,
              isInCart: true,
              cartId,
            }
          : item
      )
    );

    const completedItems: PantryItem[] = [];

    try {
      for (const itemId of itemIds) {
        const savedItem = await movePantryItemToCart(itemId, cartId);
        completedItems.push(savedItem);
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      }

      return completedItems;
    } catch (error) {
      const failedItemId = itemIds.find((itemId) => !completedItems.some((item) => item.id === itemId)) ?? null;

      if (failedItemId) {
        const previousItem = previousItems.get(failedItemId);

        if (previousItem) {
          setItems((currentItems) =>
            currentItems.map((item) => (item.id === failedItemId ? previousItem : item))
          );
        }
      }

      const message = error instanceof Error ? error.message : 'Unable to move selected items to cart.';
      setErrorMessage(message);
      throw new PartialItemActionError(message, {
        completedItemIds: completedItems.map((item) => item.id),
        failedItemId,
      });
    } finally {
      setItemBusy(false);
    }
  }, [items, setItems]);

  const moveItemsToPantry = useCallback(async (itemIds: string[]) => {
    if (itemIds.length === 0) {
      return [];
    }

    setItemBusy(true);
    setErrorMessage(null);

    const previousItems = new Map(
      itemIds
        .map((itemId) => {
          const item = items.find((candidate) => candidate.id === itemId);
          return item ? [itemId, item] : null;
        })
        .filter(Boolean) as [string, PantryItem][]
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        previousItems.has(item.id)
          ? {
              ...item,
              isInCart: false,
              cartId: null,
            }
          : item
      )
    );

    const completedItems: PantryItem[] = [];

    try {
      for (const itemId of itemIds) {
        const savedItem = await movePantryItemToPantry(itemId);
        completedItems.push(savedItem);
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      }

      return completedItems;
    } catch (error) {
      const failedItemId = itemIds.find((itemId) => !completedItems.some((item) => item.id === itemId)) ?? null;

      if (failedItemId) {
        const previousItem = previousItems.get(failedItemId);

        if (previousItem) {
          setItems((currentItems) =>
            currentItems.map((item) => (item.id === failedItemId ? previousItem : item))
          );
        }
      }

      const message = error instanceof Error ? error.message : 'Unable to move selected items back to pantry.';
      setErrorMessage(message);
      throw new PartialItemActionError(message, {
        completedItemIds: completedItems.map((item) => item.id),
        failedItemId,
      });
    } finally {
      setItemBusy(false);
    }
  }, [items, setItems]);

  const completeCartItemWithExpiration = useCallback(async (itemId: string, expirationDate: string | null) => {
    setItemBusy(true);
    setErrorMessage(null);
    const previousItem = items.find((item) => item.id === itemId) ?? null;

    if (!previousItem) {
      setItemBusy(false);
      throw new Error('Item no longer exists.');
    }

    const optimisticItem: PantryItem = {
      ...previousItem,
      expirationDate,
      isInCart: false,
      cartId: null,
    };

    setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? optimisticItem : item)));

    try {
      const savedItem = await updatePantryItem(itemId, {
        pantryId: previousItem.pantryId,
        name: previousItem.name,
        barcode: previousItem.barcode,
        image: previousItem.image,
        expirationDate,
        isInCart: false,
        cartId: null,
        quantity: previousItem.quantity,
      });
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? previousItem : item)));
      const message = error instanceof Error ? error.message : 'Unable to save expiration and move item back to pantry.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [items, setItems]);

  const value = useMemo<ItemStateContextValue>(
    () => ({
      itemBusy,
      errorMessage,
      addItem,
      updateItem,
      moveItemToCart,
      moveItemsToCart,
      moveItemToPantry,
      moveItemsToPantry,
      completeCartItemWithExpiration,
      deleteItem,
      deleteItems,
    }),
    [
      addItem,
      completeCartItemWithExpiration,
      deleteItem,
      deleteItems,
      errorMessage,
      itemBusy,
      moveItemToCart,
      moveItemsToCart,
      moveItemToPantry,
      moveItemsToPantry,
      updateItem,
    ]
  );

  return <ItemStateContext.Provider value={value}>{children}</ItemStateContext.Provider>;
}

export function useItemState() {
  const value = useContext(ItemStateContext);

  if (!value) {
    throw new Error('useItemState must be used inside ItemStateProvider');
  }

  return value;
}
