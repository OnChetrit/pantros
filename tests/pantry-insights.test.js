import assert from 'node:assert/strict';
import test from 'node:test';

import { matchPantryItems } from '../src/lib/pantry-insights';

const items = [
  {
    id: 'item-1',
    pantryId: 'pantry-1',
    name: 'Whole Milk',
    barcode: '7290012345678',
    image: null,
    expirationDate: null,
    createdAt: '2026-06-29T00:00:00.000Z',
    isInCart: false,
    cartId: null,
    quantity: 1,
  },
  {
    id: 'item-2',
    pantryId: 'pantry-1',
    name: 'Almond Milk',
    barcode: '12345678',
    image: null,
    expirationDate: null,
    createdAt: '2026-06-29T00:00:00.000Z',
    isInCart: false,
    cartId: null,
    quantity: 1,
  },
  {
    id: 'item-3',
    pantryId: 'pantry-1',
    name: 'Pasta',
    barcode: null,
    image: null,
    expirationDate: null,
    createdAt: '2026-06-29T00:00:00.000Z',
    isInCart: false,
    cartId: null,
    quantity: 1,
  },
];

test('empty query returns full visible list with no exact match', () => {
  const result = matchPantryItems(items, '   ');

  assert.equal(result.exactMatch, null);
  assert.equal(result.exactNameMatch, null);
  assert.equal(result.exactBarcodeMatch, null);
  assert.deepEqual(
    result.visibleResults.map((item) => item.id),
    items.map((item) => item.id),
  );
});

test('case-insensitive exact name matches are detected', () => {
  const result = matchPantryItems(items, '  whole MILK ');

  assert.equal(result.exactMatch?.id, 'item-1');
  assert.equal(result.exactNameMatch?.id, 'item-1');
  assert.equal(result.exactBarcodeMatch, null);
});

test('exact barcode matches are detected for barcode-like queries', () => {
  const result = matchPantryItems(items, '7290012345678');

  assert.equal(result.exactMatch?.id, 'item-1');
  assert.equal(result.exactNameMatch, null);
  assert.equal(result.exactBarcodeMatch?.id, 'item-1');
});

test('partial name matches stay partial and do not count as exact matches', () => {
  const result = matchPantryItems(items, 'milk');

  assert.equal(result.exactMatch, null);
  assert.equal(result.exactNameMatch, null);
  assert.deepEqual(
    result.partialMatches.map((item) => item.id),
    ['item-1', 'item-2'],
  );
});
