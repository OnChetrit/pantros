export const WATCH_PROTOCOL_VERSION = 1 as const;

export type WatchMutation = {
  kind: 'addItem' | 'removeItem' | 'completeItems';
  version: number;
  requestId: string;
  pantryId: string;
  itemId?: string;
  itemIds?: string[];
};

export function isSupportedWatchVersion(version: unknown): version is typeof WATCH_PROTOCOL_VERSION {
  return version === WATCH_PROTOCOL_VERSION;
}

export function reconcileWatchSelection(
  selectedItemIds: readonly string[],
  pendingMutations: readonly WatchMutation[],
  validItemIds: readonly string[]
) {
  const selected = new Set(selectedItemIds);

  for (const mutation of pendingMutations) {
    if (mutation.kind === 'addItem' && mutation.itemId) selected.add(mutation.itemId);
    if (mutation.kind === 'removeItem' && mutation.itemId) selected.delete(mutation.itemId);
  }

  const valid = new Set(validItemIds);
  return [...selected].filter((itemId) => valid.has(itemId));
}
