import {createContext, useCallback, useContext, useMemo, useState} from 'react';
import type {PropsWithChildren} from 'react';

import type {ShoppingCartCompletionResult} from '@/services/supabase/shopping-cart-service';
import {
  addShoppingCartItem as addShoppingCartItemRequest,
  completeShoppingCartItems as completeShoppingCartItemsRequest,
  fetchShoppingCartItems,
  removeShoppingCartItem as removeShoppingCartItemRequest,
} from '@/services/supabase/shopping-cart-service';

import {useAuthState} from './auth-state';
import {useWorkspaceState} from './workspace-state';

type ShoppingCartStateContextValue = {
  shoppingCartBusy: boolean;
  shoppingCartError: string | null;
  refreshShoppingCart: () => Promise<void>;
  addShoppingCartItem: (itemId: string) => Promise<void>;
  removeShoppingCartItem: (itemId: string) => Promise<void>;
  completeShoppingCartItems: (itemIds: string[]) => Promise<ShoppingCartCompletionResult>;
};

const ShoppingCartStateContext = createContext<ShoppingCartStateContextValue | undefined>(undefined);

export function ShoppingCartStateProvider({children}: PropsWithChildren) {
  const {session} = useAuthState();
  const {pantries, selectedPantryId, setShoppingCartItems, refreshWorkspace} = useWorkspaceState();
  const [shoppingCartBusy, setShoppingCartBusy] = useState(false);
  const [shoppingCartError, setShoppingCartError] = useState<string | null>(null);

  const refreshShoppingCart = useCallback(async () => {
    if (!session?.user) {
      setShoppingCartItems([]);
      return;
    }

    try {
      const items = await fetchShoppingCartItems(session.user.id, pantries.map((pantry) => pantry.id));
      setShoppingCartItems(items);
    } catch (error) {
      setShoppingCartError(error instanceof Error ? error.message : 'Unable to refresh shopping cart.');
      throw error;
    }
  }, [pantries, session, setShoppingCartItems]);

  const run = useCallback(async (action: () => Promise<void>) => {
    setShoppingCartBusy(true);
    setShoppingCartError(null);

    try {
      await action();
    } catch (error) {
      setShoppingCartError(error instanceof Error ? error.message : 'Unable to update shopping cart.');
      throw error;
    } finally {
      setShoppingCartBusy(false);
    }
  }, []);

  const addShoppingCartItem = useCallback(async (itemId: string) => {
    if (!selectedPantryId) throw new Error('Select a pantry before adding a shopping item.');
    await run(async () => {
      await addShoppingCartItemRequest(selectedPantryId, itemId);
      await refreshShoppingCart();
    });
  }, [refreshShoppingCart, run, selectedPantryId]);

  const removeShoppingCartItem = useCallback(async (itemId: string) => {
    if (!selectedPantryId) throw new Error('Select a pantry before removing a shopping item.');
    await run(async () => {
      await removeShoppingCartItemRequest(selectedPantryId, itemId);
      await refreshShoppingCart();
    });
  }, [refreshShoppingCart, run, selectedPantryId]);

  const completeShoppingCartItems = useCallback(async (itemIds: string[]) => {
    if (!selectedPantryId) throw new Error('Select a pantry before completing shopping items.');
    let result: ShoppingCartCompletionResult = {succeeded: [], failed: []};
    await run(async () => {
      result = await completeShoppingCartItemsRequest(selectedPantryId, itemIds);
      await refreshWorkspace();
    });
    return result;
  }, [refreshWorkspace, run, selectedPantryId]);

  const value = useMemo<ShoppingCartStateContextValue>(() => ({
    shoppingCartBusy,
    shoppingCartError,
    refreshShoppingCart,
    addShoppingCartItem,
    removeShoppingCartItem,
    completeShoppingCartItems,
  }), [addShoppingCartItem, completeShoppingCartItems, refreshShoppingCart, removeShoppingCartItem, shoppingCartBusy, shoppingCartError]);

  return <ShoppingCartStateContext.Provider value={value}>{children}</ShoppingCartStateContext.Provider>;
}

export function useShoppingCartState() {
  const value = useContext(ShoppingCartStateContext);
  if (!value) throw new Error('useShoppingCartState must be used inside ShoppingCartStateProvider');
  return value;
}
