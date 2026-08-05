import {useCallback, useEffect, useMemo, useRef} from 'react';
import {AppState} from 'react-native';

import type {WatchSnapshot} from '@/domain/models';
import {fetchWatchSnapshot} from '@/services/supabase/shopping-cart-service';
import {
  activateWatchConnectivity,
  clearPendingWatchRequest,
  clearWatchAuthenticatedData,
  getPendingWatchRequests,
  sendWatchResponse,
  subscribeToWatchRequests,
  updateWatchSnapshot,
  type WatchRequest,
} from '@/services/watch/watch-connectivity';

import {useAuthState} from './auth-state';
import {useShoppingCartState} from './shopping-cart-state';
import {useWorkspaceState} from './workspace-state';

function buildLocalSnapshot(
  pantry: ReturnType<typeof useWorkspaceState>['selectedPantry'],
  items: ReturnType<typeof useWorkspaceState>['pantryItems'],
  selectedItems: ReturnType<typeof useWorkspaceState>['activeShoppingCartItems']
): WatchSnapshot | null {
  if (!pantry) return null;
  const cartItems = items.filter((item) => item.isInCart);
  const selectedIds = new Set(selectedItems.map((item) => item.itemId));

  return {
    version: 1,
    pantryId: pantry.id,
    pantryName: pantry.name,
    revision: new Date().toISOString(),
    selectedItemIds: cartItems.filter((item) => selectedIds.has(item.id)).map((item) => item.id),
    items: cartItems.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      cartId: item.cartId,
      isSelected: selectedIds.has(item.id),
    })),
  };
}

export function useWatchConnectivitySync() {
  const {session, isAuthenticated} = useAuthState();
  const workspace = useWorkspaceState();
  const refreshWorkspace = workspace.refreshWorkspace;
  const shoppingCart = useShoppingCartState();
  const processedRequestIds = useRef(new Set<string>());
  const inFlightRequestIds = useRef(new Set<string>());
  const localSnapshot = useMemo(
    () => buildLocalSnapshot(workspace.selectedPantry, workspace.pantryItems, workspace.activeShoppingCartItems),
    [workspace.activeShoppingCartItems, workspace.pantryItems, workspace.selectedPantry]
  );

  const sendFreshSnapshot = useCallback(async (pantryId: string | null = workspace.selectedPantryId) => {
    if (!isAuthenticated || !pantryId) return;
    try {
      const snapshot = await fetchWatchSnapshot(pantryId);
      updateWatchSnapshot(snapshot as unknown as Record<string, unknown>);
    } catch (error) {
      sendWatchResponse({
        kind: 'error',
        code: 'snapshot_failed',
        message: error instanceof Error ? error.message : 'Unable to refresh Pantros on Apple Watch.',
      });
    }
  }, [isAuthenticated, workspace.selectedPantryId]);

  const handleRequest = useCallback(async (request: WatchRequest) => {
    if (request.kind === 'reachability') return;
    if (request.requestId && (processedRequestIds.current.has(request.requestId) || inFlightRequestIds.current.has(request.requestId))) return;
    if (request.requestId) inFlightRequestIds.current.add(request.requestId);

    const requestId = request.requestId;
    const pantryId = workspace.selectedPantryId;
    const fail = (code: string, message: string, permanent = false) => {
      sendWatchResponse({kind: 'error', code, message, requestId});
      if (requestId) {
        inFlightRequestIds.current.delete(requestId);
        if (permanent) {
          processedRequestIds.current.add(requestId);
          clearPendingWatchRequest(requestId);
        }
      }
    };

    if (request.version !== 1) {
      fail('unsupported_version', 'This watch app needs a newer Pantros iPhone app.', true);
      return;
    }
    if (!session?.user || !isAuthenticated) {
      fail('signed_out', 'Sign in on your iPhone to use Pantros on Apple Watch.', true);
      return;
    }
    if (!pantryId || (request.pantryId && request.pantryId !== pantryId)) {
      fail('pantry_changed', 'The active pantry changed. Refresh the watch and try again.', true);
      return;
    }

    try {
      if (request.kind === 'refresh') {
        await workspace.refreshWorkspace();
      } else if (request.kind === 'addItem') {
        const item = workspace.pantryItems.find((candidate) => candidate.id === request.itemId);
        if (!item || !item.isInCart) throw new Error('That item is no longer in the Pantros cart.');
        await shoppingCart.addShoppingCartItem(item.id);
      } else if (request.kind === 'removeItem') {
        if (!request.itemId) throw new Error('The watch request did not include an item.');
        await shoppingCart.removeShoppingCartItem(request.itemId);
      } else if (request.kind === 'completeItems') {
        const result = await shoppingCart.completeShoppingCartItems(request.itemIds ?? []);
        const snapshot = await fetchWatchSnapshot(pantryId);
        sendWatchResponse({
          kind: 'acknowledgement',
          requestId,
          message: result.failed.length > 0 ? 'Some items were unavailable and remain selected.' : 'Items moved back to your pantry.',
          succeeded: result.succeeded,
          failed: result.failed,
          snapshot: snapshot as unknown as Record<string, unknown>,
          revision: snapshot.revision,
        });
        if (requestId) {
          inFlightRequestIds.current.delete(requestId);
          processedRequestIds.current.add(requestId);
          clearPendingWatchRequest(requestId);
        }
        return;
      } else {
        throw new Error('This watch action is not supported by the iPhone app.');
      }

      const snapshot = await fetchWatchSnapshot(pantryId);
      sendWatchResponse({
        kind: 'acknowledgement',
        requestId,
        message: 'Pantros synced your shopping cart.',
        snapshot: snapshot as unknown as Record<string, unknown>,
        revision: snapshot.revision,
      });
      updateWatchSnapshot(snapshot as unknown as Record<string, unknown>);
      if (requestId) {
        inFlightRequestIds.current.delete(requestId);
        processedRequestIds.current.add(requestId);
        clearPendingWatchRequest(requestId);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Pantros could not complete that action.';
      try {
        const snapshot = await fetchWatchSnapshot(pantryId);
        sendWatchResponse({
          kind: 'acknowledgement',
          requestId,
          message,
          snapshot: snapshot as unknown as Record<string, unknown>,
          revision: snapshot.revision,
        });
        updateWatchSnapshot(snapshot as unknown as Record<string, unknown>);
        if (requestId) {
          inFlightRequestIds.current.delete(requestId);
          processedRequestIds.current.add(requestId);
          clearPendingWatchRequest(requestId);
        }
      } catch {
        fail('mutation_failed', message);
      }
    }
  }, [isAuthenticated, session?.user, shoppingCart, workspace]);

  useEffect(() => {
    activateWatchConnectivity();
    const unsubscribe = subscribeToWatchRequests((request) => {
      void handleRequest(request);
    });
    getPendingWatchRequests().forEach((request) => {
      void handleRequest(request as unknown as WatchRequest);
    });
    return unsubscribe;
  }, [handleRequest]);

  useEffect(() => {
    if (!isAuthenticated) {
      clearWatchAuthenticatedData();
      return;
    }
    if (localSnapshot) updateWatchSnapshot(localSnapshot as unknown as Record<string, unknown>);
  }, [isAuthenticated, localSnapshot]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        void refreshWorkspace().then(() => sendFreshSnapshot());
        getPendingWatchRequests().forEach((request) => {
          void handleRequest(request as unknown as WatchRequest);
        });
      }
    });
    return () => subscription.remove();
  }, [handleRequest, refreshWorkspace, sendFreshSnapshot]);
}
