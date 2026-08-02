import type { PantryItem } from '@/domain/models';

export function createSearchSuggestionItem(pantryId: string, name: string): PantryItem {
  return {
    id: `new-item:${pantryId}:${name}`,
    pantryId,
    name,
    barcode: null,
    image: null,
    expirationDate: null,
    createdAt: '',
    isInCart: false,
    cartId: null,
    quantity: 1,
  };
}
