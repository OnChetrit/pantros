import type { Cart, PantryItem } from '@/domain/models';

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function startOfToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getCartItems(items: PantryItem[]) {
  return items.filter((item) => item.isInCart);
}

export function getSoonestExpiringItems(items: PantryItem[], limit = 5) {
  return [...items]
    .filter((item) => parseDate(item.expirationDate))
    .sort((left, right) => {
      const leftTime = parseDate(left.expirationDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const rightTime = parseDate(right.expirationDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
      return leftTime - rightTime;
    })
    .slice(0, limit);
}

export function countItemsExpiringWithinDays(items: PantryItem[], days: number) {
  const today = startOfToday().getTime();
  const max = today + days * 24 * 60 * 60 * 1000;

  return items.filter((item) => {
    const date = parseDate(item.expirationDate);
    const time = date?.getTime();

    return typeof time === 'number' && time >= today && time <= max;
  }).length;
}

export function formatExpirationLabel(value: string | null) {
  const date = parseDate(value);

  if (!date) {
    return 'No expiration date';
  }

  const today = startOfToday().getTime();
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const days = Math.round((target.getTime() - today) / (24 * 60 * 60 * 1000));

  if (days < 0) {
    return 'Expired';
  }

  if (days === 0) {
    return 'Today';
  }

  if (days === 1) {
    return 'Tomorrow';
  }

  return `${days}d`;
}

export function formatPantryItemMeta(item: PantryItem, carts: Cart[]) {
  if (!item.isInCart) {
    return '';
  }

  const cart = carts.find((entry) => entry.id === item.cartId);
  const quantityLabel = item.quantity === 1 ? '1 unit' : `${item.quantity} units`;

  if (cart) {
    return `${quantityLabel} · ${cart.name}`;
  }

  return `${quantityLabel} · In cart`;
}

export function searchItems(items: PantryItem[], query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return items;
  }

  return items.filter((item) => {
    return (
      item.name.toLowerCase().includes(normalizedQuery) ||
      item.barcode?.toLowerCase().includes(normalizedQuery)
    );
  });
}
