import type { ShoppingCartItem, WatchSnapshot } from '@/domain/models';

import { supabase } from './client';

function mapShoppingCartItem(row: Record<string, any>): ShoppingCartItem {
  return {
    id: row.id,
    userId: row.user_id,
    pantryId: row.pantry_id,
    itemId: row.item_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function fetchShoppingCartItems(userId: string, pantryIds: string[]) {
  if (pantryIds.length === 0) {
    return [];
  }

  const {data, error} = await supabase
    .from('shopping_cart_items')
    .select('*')
    .eq('user_id', userId)
    .in('pantry_id', pantryIds)
    .order('created_at', {ascending: true});

  if (error) {
    throw error;
  }

  return (data ?? []).map(mapShoppingCartItem);
}

export async function addShoppingCartItem(pantryId: string, itemId: string) {
  const {data, error} = await supabase.rpc('shopping_cart_add_item', {
    p_pantry_id: pantryId,
    p_item_id: itemId,
  });

  if (error) {
    throw error;
  }

  return data as {shopping_cart_item_id: string; item_id: string};
}

export async function removeShoppingCartItem(pantryId: string, itemId: string) {
  const {data, error} = await supabase.rpc('shopping_cart_remove_item', {
    p_pantry_id: pantryId,
    p_item_id: itemId,
  });

  if (error) {
    throw error;
  }

  return data as {item_id: string; removed: boolean};
}

export type ShoppingCartCompletionResult = {
  succeeded: string[];
  failed: {itemId: string; reason: string}[];
};

export async function completeShoppingCartItems(pantryId: string, itemIds: string[]) {
  const {data, error} = await supabase.rpc('shopping_cart_complete_items', {
    p_pantry_id: pantryId,
    p_item_ids: itemIds,
  });

  if (error) {
    throw error;
  }

  const result = (data ?? {}) as Partial<ShoppingCartCompletionResult>;
  return {
    succeeded: result.succeeded ?? [],
    failed: result.failed ?? [],
  } satisfies ShoppingCartCompletionResult;
}

export async function fetchWatchSnapshot(pantryId: string) {
  const {data, error} = await supabase.rpc('shopping_cart_watch_snapshot', {
    p_pantry_id: pantryId,
  });

  if (error) {
    throw error;
  }

  return data as WatchSnapshot;
}
