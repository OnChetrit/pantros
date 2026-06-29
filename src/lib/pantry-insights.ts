import type { Cart, PantryItem } from '@/domain/models';

type NormalizedBarcode = {
  raw: string;
  digits: string | null;
};

export type PantryItemMatchResult = {
  normalizedQuery: string;
  exactMatch: PantryItem | null;
  exactNameMatch: PantryItem | null;
  exactBarcodeMatch: PantryItem | null;
  partialMatches: PantryItem[];
  visibleResults: PantryItem[];
};

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

function normalizeItemName(value: string) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function normalizeBarcode(value: string | null): NormalizedBarcode | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const digits = trimmed.replace(/\D/g, '');

  return {
    raw: trimmed.toLowerCase(),
    digits: digits.length > 0 ? digits : null,
  };
}

function isBarcodeLikeQuery(value: NormalizedBarcode | null) {
  const digitCount = value?.digits?.length ?? 0;
  return digitCount >= 8 && digitCount <= 14;
}

function isExactBarcodeMatch(item: PantryItem, query: NormalizedBarcode | null) {
  const itemBarcode = normalizeBarcode(item.barcode);

  if (!itemBarcode || !query) {
    return false;
  }

  return (
    itemBarcode.raw === query.raw ||
    Boolean(itemBarcode.digits && query.digits && itemBarcode.digits === query.digits)
  );
}

function isVisibleBarcodeMatch(item: PantryItem, query: NormalizedBarcode | null) {
  const itemBarcode = normalizeBarcode(item.barcode);

  if (!itemBarcode || !query) {
    return false;
  }

  return (
    itemBarcode.raw.includes(query.raw) ||
    Boolean(itemBarcode.digits && query.digits && itemBarcode.digits.includes(query.digits))
  );
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

export function matchPantryItems(items: PantryItem[], rawQuery: string): PantryItemMatchResult {
  const normalizedQuery = normalizeItemName(rawQuery);

  if (!normalizedQuery) {
    return {
      normalizedQuery,
      exactMatch: null,
      exactNameMatch: null,
      exactBarcodeMatch: null,
      partialMatches: [],
      visibleResults: items,
    };
  }

  const normalizedBarcodeQuery = normalizeBarcode(rawQuery);
  let exactNameMatch: PantryItem | null = null;
  let exactBarcodeMatch: PantryItem | null = null;
  const partialMatches: PantryItem[] = [];
  const visibleResults: PantryItem[] = [];

  for (const item of items) {
    const normalizedName = normalizeItemName(item.name);
    const nameMatchesExactly = normalizedName === normalizedQuery;
    const nameMatchesPartially = normalizedName.includes(normalizedQuery);
    const barcodeMatchesVisibly = isVisibleBarcodeMatch(item, normalizedBarcodeQuery);

    if (nameMatchesExactly && !exactNameMatch) {
      exactNameMatch = item;
    } else if (nameMatchesPartially) {
      partialMatches.push(item);
    }

    if (nameMatchesPartially || barcodeMatchesVisibly) {
      visibleResults.push(item);
    }
  }

  if (isBarcodeLikeQuery(normalizedBarcodeQuery)) {
    exactBarcodeMatch = items.find((item) => isExactBarcodeMatch(item, normalizedBarcodeQuery)) ?? null;
  }

  return {
    normalizedQuery,
    exactMatch: exactNameMatch ?? exactBarcodeMatch,
    exactNameMatch,
    exactBarcodeMatch,
    partialMatches,
    visibleResults,
  };
}

export function searchItems(items: PantryItem[], query: string) {
  return matchPantryItems(items, query).visibleResults;
}
