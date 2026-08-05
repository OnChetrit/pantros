import assert from 'node:assert/strict';
import test from 'node:test';

import {isSupportedWatchVersion, reconcileWatchSelection} from '../src/services/watch/watch-protocol';

test('watch protocol accepts only the current version', () => {
  assert.equal(isSupportedWatchVersion(1), true);
  assert.equal(isSupportedWatchVersion(2), false);
  assert.equal(isSupportedWatchVersion('1'), false);
});

test('pending watch mutations reconcile selections without duplicating entries', () => {
  const selection = reconcileWatchSelection(
    ['item-1'],
    [
      {kind: 'addItem', version: 1, requestId: 'a', pantryId: 'pantry-1', itemId: 'item-2'},
      {kind: 'addItem', version: 1, requestId: 'b', pantryId: 'pantry-1', itemId: 'item-2'},
      {kind: 'removeItem', version: 1, requestId: 'c', pantryId: 'pantry-1', itemId: 'item-1'},
    ],
    ['item-1', 'item-2', 'item-3'],
  );

  assert.deepEqual(selection, ['item-2']);
});

test('stale selections are removed during reconciliation', () => {
  assert.deepEqual(
    reconcileWatchSelection(['deleted-item'], [], ['current-item']),
    [],
  );
});
