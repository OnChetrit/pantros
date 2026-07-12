import type { PantryItem } from '@/domain/models';
import type { PantryListSortOption } from '@/features/pantry/pantry-sort/pantry-sort-options';

export function sortCartItems(items: PantryItem[], sortOption: PantryListSortOption) {
  return [...items].sort((left, right) => {
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

    return new Date(left.expirationDate).getTime() - new Date(right.expirationDate).getTime();
  });
}
