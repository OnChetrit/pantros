import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { PantryItem } from '@/domain/models';
import { PartialItemActionError, useItemState } from '@/state/item-state';
import { useWorkspaceState } from '@/state/workspace-state';

type CheckoutProgress = {
  totalCount: number;
  completedCount: number;
  processing: boolean;
  errorMessage: string | null;
  completionMessage: string | null;
};

type CartCheckoutContextValue = {
  isSelectionMode: boolean;
  selectedItemIds: string[];
  checkoutQueue: PantryItem[];
  checkoutProgress: CheckoutProgress;
  reviewDate: string;
  currentReviewItem: PantryItem | null;
  setVisibleItems: (items: PantryItem[]) => void;
  enterSelectionMode: (itemId?: string) => void;
  exitSelectionMode: () => void;
  toggleItemSelection: (itemId: string) => void;
  selectAll: (itemIds: string[]) => void;
  clearSelection: () => void;
  startCheckout: () => Promise<void>;
  setReviewDate: (value: string) => void;
  saveAndContinueReview: () => Promise<void>;
  skipCurrentReview: () => Promise<void>;
  cancelReview: () => void;
  dismissCompletionMessage: () => void;
  clearCheckoutError: () => void;
};

const CartCheckoutContext = createContext<CartCheckoutContextValue | undefined>(undefined);

function buildCompletionMessage(count: number) {
  return count === 1 ? '1 item moved to pantry.' : `${count} items moved to pantry.`;
}

function buildCompletionSummary(count: number) {
  return count === 1 ? '1 item moved to pantry' : `${count} items moved to pantry`;
}

function formatErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function parseIsoDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next.toISOString().split('T')[0]!;
}

function resolveReviewDate(item: PantryItem | null, defaultExpirationDays: number | null) {
  const existingDate = parseIsoDate(item?.expirationDate ?? null);

  if (existingDate) {
    return toIsoDate(existingDate);
  }

  const fallback = new Date();
  fallback.setHours(0, 0, 0, 0);
  fallback.setDate(fallback.getDate() + (defaultExpirationDays ?? 7));
  return toIsoDate(fallback);
}

export function CartCheckoutProvider({ children }: PropsWithChildren) {
  const {completeCartItemWithExpiration, moveItemsToPantry} = useItemState();
  const {selectedPantry} = useWorkspaceState();
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [visibleItems, setVisibleItems] = useState<PantryItem[]>([]);
  const [checkoutQueue, setCheckoutQueue] = useState<PantryItem[]>([]);
  const [queueIndex, setQueueIndex] = useState(0);
  const [reviewDate, setReviewDate] = useState('');
  const [checkoutProgress, setCheckoutProgress] = useState<CheckoutProgress>({
    totalCount: 0,
    completedCount: 0,
    processing: false,
    errorMessage: null,
    completionMessage: null,
  });

  const currentReviewItem = checkoutQueue[queueIndex] ?? null;
  const defaultExpirationDays = selectedPantry?.settings.defaultExpirationDays ?? null;

  useEffect(() => {
    if (!currentReviewItem) {
      return;
    }

    setReviewDate(resolveReviewDate(currentReviewItem, defaultExpirationDays));
  }, [currentReviewItem, defaultExpirationDays]);

  useEffect(() => {
    const visibleIds = new Set(visibleItems.map((item) => item.id));

    setSelectedItemIds((current) => current.filter((itemId) => visibleIds.has(itemId)));
    setIsSelectionMode((current) => (visibleIds.size === 0 ? false : current));
  }, [visibleItems]);

  const resetSelection = useCallback(() => {
    setIsSelectionMode(false);
    setSelectedItemIds([]);
  }, []);

  const enterSelectionMode = useCallback((itemId?: string) => {
    setCheckoutProgress((current) => ({
      ...current,
      errorMessage: null,
      completionMessage: null,
    }));
    setIsSelectionMode(true);
    setSelectedItemIds((current) => {
      if (!itemId) {
        return current;
      }

      return current.includes(itemId) ? current : [...current, itemId];
    });
  }, []);

  const exitSelectionMode = useCallback(() => {
    resetSelection();
  }, [resetSelection]);

  const toggleItemSelection = useCallback((itemId: string) => {
    setSelectedItemIds((current) =>
      current.includes(itemId) ? current.filter((candidate) => candidate !== itemId) : [...current, itemId]
    );
  }, []);

  const selectAll = useCallback((itemIds: string[]) => {
    setSelectedItemIds(itemIds);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedItemIds([]);
  }, []);

  const dismissCompletionMessage = useCallback(() => {
    setCheckoutProgress((current) => ({
      ...current,
      completionMessage: null,
    }));
  }, []);

  const clearCheckoutError = useCallback(() => {
    setCheckoutProgress((current) => ({
      ...current,
      errorMessage: null,
    }));
  }, []);

  const startCheckout = useCallback(async () => {
    const orderedSelection = visibleItems.filter((item) => selectedItemIds.includes(item.id));

    if (orderedSelection.length === 0) {
      return;
    }

    const noExpirationItems = orderedSelection.filter((item) => item.expirationDate === null);
    const queuedItems = orderedSelection.filter((item) => item.expirationDate !== null);

    setCheckoutProgress({
      totalCount: orderedSelection.length,
      completedCount: 0,
      processing: true,
      errorMessage: null,
      completionMessage: null,
    });

    try {
      let completedCount = 0;

      if (noExpirationItems.length > 0) {
        const movedItems = await moveItemsToPantry(noExpirationItems.map((item) => item.id));
        completedCount += movedItems.length;
      }

      if (queuedItems.length > 0) {
        setCheckoutQueue(queuedItems);
        setQueueIndex(0);
        resetSelection();
        setCheckoutProgress({
          totalCount: orderedSelection.length,
          completedCount,
          processing: false,
          errorMessage: null,
          completionMessage: null,
        });
        return;
      }

      resetSelection();
      setCheckoutProgress({
        totalCount: orderedSelection.length,
        completedCount,
        processing: false,
        errorMessage: null,
        completionMessage: buildCompletionMessage(completedCount),
      });
    } catch (error) {
      const completedItemIds =
        error instanceof PartialItemActionError ? error.completedItemIds : [];
      const completedCount = completedItemIds.length;

      if (completedCount > 0) {
        setSelectedItemIds((current) => current.filter((itemId) => !completedItemIds.includes(itemId)));
      }

      setCheckoutProgress({
        totalCount: orderedSelection.length,
        completedCount,
        processing: false,
        errorMessage: formatErrorMessage(error, 'Unable to finish moving selected items.'),
        completionMessage: completedCount > 0 ? buildCompletionMessage(completedCount) : null,
      });
    }
  }, [moveItemsToPantry, resetSelection, selectedItemIds, visibleItems]);

  const finishReviewStep = useCallback((completedCount: number) => {
    const isLastItem = queueIndex >= checkoutQueue.length - 1;

    if (isLastItem) {
      setCheckoutQueue([]);
      setQueueIndex(0);
      setCheckoutProgress((current) => ({
        ...current,
        completedCount,
        processing: false,
        errorMessage: null,
        completionMessage: buildCompletionMessage(completedCount),
      }));
      return;
    }

    setQueueIndex((current) => current + 1);
    setCheckoutProgress((current) => ({
      ...current,
      completedCount,
      processing: false,
      errorMessage: null,
    }));
  }, [checkoutQueue.length, queueIndex]);

  const runReviewStep = useCallback(async (expirationDate: string | null) => {
    if (!currentReviewItem) {
      return;
    }

    setCheckoutProgress((current) => ({
      ...current,
      processing: true,
      errorMessage: null,
      completionMessage: null,
    }));

    try {
      await completeCartItemWithExpiration(currentReviewItem.id, expirationDate);
      finishReviewStep(checkoutProgress.completedCount + 1);
    } catch (error) {
      setCheckoutProgress((current) => ({
        ...current,
        processing: false,
        errorMessage: formatErrorMessage(error, 'Unable to complete this cart item.'),
      }));
    }
  }, [checkoutProgress.completedCount, completeCartItemWithExpiration, currentReviewItem, finishReviewStep]);

  const saveAndContinueReview = useCallback(async () => {
    await runReviewStep(reviewDate);
  }, [reviewDate, runReviewStep]);

  const skipCurrentReview = useCallback(async () => {
    await runReviewStep(currentReviewItem?.expirationDate ?? null);
  }, [currentReviewItem, runReviewStep]);

  const cancelReview = useCallback(() => {
    const remainingCount = checkoutQueue.length - queueIndex;

    setCheckoutQueue([]);
    setQueueIndex(0);
    setCheckoutProgress((current) => ({
      ...current,
      processing: false,
      errorMessage: null,
      completionMessage:
        remainingCount > 0 && current.completedCount > 0
          ? `${buildCompletionSummary(current.completedCount)}. ${remainingCount} left in cart.`
          : current.completedCount > 0
            ? buildCompletionMessage(current.completedCount)
            : 'Review cancelled. Remaining items stayed in cart.',
    }));
  }, [checkoutQueue.length, queueIndex]);

  const value = useMemo<CartCheckoutContextValue>(() => ({
    isSelectionMode,
    selectedItemIds,
    checkoutQueue,
    checkoutProgress,
    reviewDate,
    currentReviewItem,
    setVisibleItems,
    enterSelectionMode,
    exitSelectionMode,
    toggleItemSelection,
    selectAll,
    clearSelection,
    startCheckout,
    setReviewDate,
    saveAndContinueReview,
    skipCurrentReview,
    cancelReview,
    dismissCompletionMessage,
    clearCheckoutError,
  }), [
    checkoutProgress,
    checkoutQueue,
    clearCheckoutError,
    clearSelection,
    currentReviewItem,
    dismissCompletionMessage,
    enterSelectionMode,
    exitSelectionMode,
    isSelectionMode,
    reviewDate,
    saveAndContinueReview,
    setVisibleItems,
    selectAll,
    selectedItemIds,
    skipCurrentReview,
    startCheckout,
    toggleItemSelection,
    cancelReview,
  ]);

  return <CartCheckoutContext.Provider value={value}>{children}</CartCheckoutContext.Provider>;
}

export function useCartCheckout() {
  const value = useContext(CartCheckoutContext);

  if (!value) {
    throw new Error('useCartCheckout must be used inside CartCheckoutProvider');
  }

  return value;
}
