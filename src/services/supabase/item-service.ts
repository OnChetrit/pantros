import type { PantryItem, PantryItemInput } from '@/domain/models';

import { supabase } from './client';

export function mapItem(row: Record<string, any>): PantryItem {
  return {
    id: row.id,
    pantryId: row.pantry_id,
    name: row.name,
    barcode: row.barcode,
    image: row.image,
    expirationDate: row.expiration_date,
    createdAt: row.created_at,
    isInCart: row.is_in_cart,
    cartId: row.cart_id,
    quantity: row.quantity,
  };
}

function toItemRow(input: PantryItemInput) {
  return {
    pantry_id: input.pantryId,
    name: input.name,
    barcode: input.barcode,
    image: input.image,
    expiration_date: input.expirationDate,
    is_in_cart: input.isInCart,
    cart_id: input.cartId,
    quantity: input.quantity,
  };
}

export async function createPantryItem(input: PantryItemInput) {
  const { data, error } = await supabase
    .from('items')
    .insert(toItemRow(input))
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapItem(data);
}

export async function updatePantryItem(itemId: string, input: PantryItemInput) {
  const { data, error } = await supabase
    .from('items')
    .update(toItemRow(input))
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapItem(data);
}

export async function movePantryItemToCart(itemId: string, cartId: string | null) {
  const { data, error } = await supabase
    .from('items')
    .update({
      is_in_cart: true,
      cart_id: cartId,
    })
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapItem(data);
}

export async function movePantryItemToPantry(itemId: string) {
  const { data, error } = await supabase
    .from('items')
    .update({
      is_in_cart: false,
      cart_id: null,
    })
    .eq('id', itemId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapItem(data);
}

export async function deletePantryItem(itemId: string) {
  const { error } = await supabase
    .from('items')
    .delete()
    .eq('id', itemId);

  if (error) {
    throw error;
  }
}
