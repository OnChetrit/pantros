import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type {
  BootstrapStatus,
  AccountDeletionDecision,
  Cart,
  NotificationPreferences,
  Pantry,
  PantryItem,
  PantryItemInput,
  UserProfile,
} from '@/domain/models';
import { hasSupabaseEnv } from '@/lib/env';
import { deleteCurrentAccount } from '@/services/supabase/account-service';
import {
  getStoredSession,
  signInWithApple,
  signInWithEmail,
  signInWithGoogle,
  signOutUser,
  signUpWithEmail,
  subscribeToAuthChanges,
} from '@/services/supabase/auth-service';
import { createPantryItem, deletePantryItem, movePantryItemToCart, movePantryItemToPantry, updatePantryItem } from '@/services/supabase/item-service';
import {
  fetchNotificationPreferences,
  clearStoredPushToken,
  syncPushTokenIfPermitted,
  unregisterCurrentPushToken,
  updateNotificationPreferences,
} from '@/services/supabase/notification-service';
import { fetchWorkspaceBundle } from '@/services/supabase/workspace-service';

type AppContextValue = {
  status: BootstrapStatus;
  isEnvReady: boolean;
  session: Session | null;
  profile: UserProfile | null;
  notificationPreferences: NotificationPreferences | null;
  pantries: Pantry[];
  selectedPantryId: string | null;
  selectedPantry: Pantry | null;
  items: PantryItem[];
  carts: Cart[];
  pantryItems: PantryItem[];
  pantryCarts: Cart[];
  isAuthenticated: boolean;
  errorMessage: string | null;
  authBusy: boolean;
  itemBusy: boolean;
  notificationBusy: boolean;
  accountDeletionBusy: boolean;
  refreshAppState: () => Promise<void>;
  selectPantry: (pantryId: string) => void;
  addItem: (input: PantryItemInput) => Promise<PantryItem>;
  updateItem: (itemId: string, input: PantryItemInput) => Promise<PantryItem>;
  moveItemToCart: (itemId: string, cartId: string | null) => Promise<PantryItem>;
  moveItemToPantry: (itemId: string) => Promise<PantryItem>;
  moveItemsToPantry: (itemIds: string[]) => Promise<PantryItem[]>;
  completeCartItemWithExpiration: (
    itemId: string,
    expirationDate: string | null
  ) => Promise<PantryItem>;
  deleteItem: (itemId: string) => Promise<void>;
  saveNotificationPreferences: (
    preferences: NotificationPreferences
  ) => Promise<NotificationPreferences>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: (decisions: AccountDeletionDecision[]) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export class PartialItemActionError extends Error {
  completedItemIds: string[];
  failedItemId: string | null;

  constructor(message: string, options?: { completedItemIds?: string[]; failedItemId?: string | null }) {
    super(message);
    this.name = 'PartialItemActionError';
    this.completedItemIds = options?.completedItemIds ?? [];
    this.failedItemId = options?.failedItemId ?? null;
  }
}

export function AppProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<BootstrapStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [itemBusy, setItemBusy] = useState(false);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [accountDeletionBusy, setAccountDeletionBusy] = useState(false);

  const isEnvReady = hasSupabaseEnv();

  const hydrateWorkspace = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!isEnvReady) {
      setStatus('error');
      setErrorMessage('Supabase environment variables are missing.');
      setProfile(null);
      setNotificationPreferences(null);
      setPantries([]);
      setItems([]);
      setCarts([]);
      setSelectedPantryId(null);
      return;
    }

    if (!nextSession?.user) {
      setStatus('ready');
      setErrorMessage(null);
      setProfile(null);
      setNotificationPreferences(null);
      setPantries([]);
      setItems([]);
      setCarts([]);
      setSelectedPantryId(null);
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const [bundle, nextNotificationPreferences] = await Promise.all([
        fetchWorkspaceBundle(nextSession.user),
        fetchNotificationPreferences(nextSession.user.id),
      ]);

      setProfile(bundle.profile);
      setNotificationPreferences(nextNotificationPreferences);
      setPantries(bundle.pantries);
      setItems(bundle.items);
      setCarts(bundle.carts);
      setSelectedPantryId((current) => {
        if (current && bundle.pantries.some((pantry) => pantry.id === current)) {
          return current;
        }

        return bundle.pantries[0]?.id ?? null;
      });
      setStatus('ready');

      if (nextNotificationPreferences.cartRemindersEnabled) {
        void syncPushTokenIfPermitted();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load app state.';
      setStatus('error');
      setErrorMessage(message);
    }
  }, [isEnvReady]);

  useEffect(() => {
    getStoredSession()
      .then((storedSession) => hydrateWorkspace(storedSession))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to restore session.';
        setStatus('error');
        setErrorMessage(message);
      });

    return subscribeToAuthChanges((nextSession) => {
      void hydrateWorkspace(nextSession);
    });
  }, [hydrateWorkspace]);

  const selectedPantry = useMemo(
    () => pantries.find((pantry) => pantry.id === selectedPantryId) ?? null,
    [pantries, selectedPantryId]
  );

  const pantryItems = useMemo(
    () => items.filter((item) => item.pantryId === selectedPantryId),
    [items, selectedPantryId]
  );

  const pantryCarts = useMemo(
    () => carts.filter((cart) => cart.pantryId === selectedPantryId),
    [carts, selectedPantryId]
  );

  const refreshAppState = useCallback(async () => {
    await hydrateWorkspace(session);
  }, [hydrateWorkspace, session]);

  const signOut = useCallback(async () => {
    try {
      await unregisterCurrentPushToken();
    } catch (error) {
      console.warn('Unable to unregister this device before signing out.', error);
    } finally {
      await signOutUser();
    }
  }, []);

  const deleteAccount = useCallback(async (decisions: AccountDeletionDecision[]) => {
    setAccountDeletionBusy(true);
    setErrorMessage(null);

    try {
      await deleteCurrentAccount(decisions);
      await clearStoredPushToken();
      await signOutUser();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to delete your account.';
      setErrorMessage(message);
      throw error;
    } finally {
      setAccountDeletionBusy(false);
    }
  }, []);

  const saveNotificationPreferences = useCallback(
    async (preferences: NotificationPreferences) => {
      setNotificationBusy(true);
      setErrorMessage(null);

      try {
        const savedPreferences = await updateNotificationPreferences(preferences);
        setNotificationPreferences(savedPreferences);
        return savedPreferences;
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to save notification preferences.';
        setErrorMessage(message);
        throw error;
      } finally {
        setNotificationBusy(false);
      }
    },
    []
  );

  const addItem = useCallback(async (input: PantryItemInput) => {
    setItemBusy(true);
    setErrorMessage(null);

    try {
      const createdItem = await createPantryItem(input);
      setItems((currentItems) => [createdItem, ...currentItems]);
      return createdItem;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to add item.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, []);

  const updateItem = useCallback(async (itemId: string, input: PantryItemInput) => {
    setItemBusy(true);
    setErrorMessage(null);

    try {
      const savedItem = await updatePantryItem(itemId, input);
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to update item.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, []);

  const moveItemToCart = useCallback(async (itemId: string, cartId: string | null) => {
    setItemBusy(true);
    setErrorMessage(null);
    const previousItem = items.find((item) => item.id === itemId) ?? null;

    if (previousItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isInCart: true,
                cartId,
              }
            : item
        )
      );
    }

    try {
      const savedItem = await movePantryItemToCart(itemId, cartId);
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      if (previousItem) {
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? previousItem : item)));
      }

      const message = error instanceof Error ? error.message : 'Unable to move item to cart.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [items]);

  const deleteItem = useCallback(async (itemId: string) => {
    setItemBusy(true);
    setErrorMessage(null);

    try {
      await deletePantryItem(itemId);
      setItems((currentItems) => currentItems.filter((item) => item.id !== itemId));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete item.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, []);

  const moveItemToPantry = useCallback(async (itemId: string) => {
    setItemBusy(true);
    setErrorMessage(null);
    const previousItem = items.find((item) => item.id === itemId) ?? null;

    if (previousItem) {
      setItems((currentItems) =>
        currentItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                isInCart: false,
                cartId: null,
              }
            : item
        )
      );
    }

    try {
      const savedItem = await movePantryItemToPantry(itemId);
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      if (previousItem) {
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? previousItem : item)));
      }

      const message = error instanceof Error ? error.message : 'Unable to move item back to pantry.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [items]);

  const moveItemsToPantry = useCallback(async (itemIds: string[]) => {
    if (itemIds.length === 0) {
      return [];
    }

    setItemBusy(true);
    setErrorMessage(null);

    const previousItems = new Map(
      itemIds
        .map((itemId) => {
          const item = items.find((candidate) => candidate.id === itemId);
          return item ? [itemId, item] : null;
        })
        .filter(Boolean) as [string, PantryItem][]
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        previousItems.has(item.id)
          ? {
              ...item,
              isInCart: false,
              cartId: null,
            }
          : item
      )
    );

    const completedItems: PantryItem[] = [];

    try {
      for (const itemId of itemIds) {
        const savedItem = await movePantryItemToPantry(itemId);
        completedItems.push(savedItem);
        setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      }

      return completedItems;
    } catch (error) {
      const failedItemId = itemIds.find((itemId) => !completedItems.some((item) => item.id === itemId)) ?? null;

      if (failedItemId) {
        const previousItem = previousItems.get(failedItemId);

        if (previousItem) {
          setItems((currentItems) =>
            currentItems.map((item) => (item.id === failedItemId ? previousItem : item))
          );
        }
      }

      const message = error instanceof Error ? error.message : 'Unable to move selected items back to pantry.';
      setErrorMessage(message);
      throw new PartialItemActionError(message, {
        completedItemIds: completedItems.map((item) => item.id),
        failedItemId,
      });
    } finally {
      setItemBusy(false);
    }
  }, [items]);

  const completeCartItemWithExpiration = useCallback(async (itemId: string, expirationDate: string | null) => {
    setItemBusy(true);
    setErrorMessage(null);
    const previousItem = items.find((item) => item.id === itemId) ?? null;

    if (!previousItem) {
      setItemBusy(false);
      throw new Error('Item no longer exists.');
    }

    const optimisticItem: PantryItem = {
      ...previousItem,
      expirationDate,
      isInCart: false,
      cartId: null,
    };

    setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? optimisticItem : item)));

    try {
      const savedItem = await updatePantryItem(itemId, {
        pantryId: previousItem.pantryId,
        name: previousItem.name,
        barcode: previousItem.barcode,
        image: previousItem.image,
        expirationDate,
        isInCart: false,
        cartId: null,
        quantity: previousItem.quantity,
      });
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? savedItem : item)));
      return savedItem;
    } catch (error) {
      setItems((currentItems) => currentItems.map((item) => (item.id === itemId ? previousItem : item)));

      const message =
        error instanceof Error ? error.message : 'Unable to save expiration and move item back to pantry.';
      setErrorMessage(message);
      throw error;
    } finally {
      setItemBusy(false);
    }
  }, [items]);

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthBusy(true);
    setErrorMessage(null);
    try {
      await signInWithEmail(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in.';
      setErrorMessage(message);
      throw error;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName?: string) => {
    setAuthBusy(true);
    setErrorMessage(null);
    try {
      await signUpWithEmail(email, password, fullName);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign up.';
      setErrorMessage(message);
      throw error;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const googleSignIn = useCallback(async () => {
    setAuthBusy(true);
    setErrorMessage(null);
    try {
      await signInWithGoogle();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in with Google.';
      setErrorMessage(message);
      throw error;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const appleSignIn = useCallback(async () => {
    setAuthBusy(true);
    setErrorMessage(null);
    try {
      await signInWithApple();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in with Apple.';
      setErrorMessage(message);
      throw error;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const value = useMemo<AppContextValue>(() => ({
    status,
    isEnvReady,
    session,
    profile,
    notificationPreferences,
    pantries,
    selectedPantryId,
    selectedPantry,
    items,
    carts,
    pantryItems,
    pantryCarts,
    isAuthenticated: Boolean(session?.user),
    errorMessage,
    authBusy,
    itemBusy,
    notificationBusy,
    accountDeletionBusy,
    refreshAppState,
    selectPantry: setSelectedPantryId,
    addItem,
    updateItem,
    moveItemToCart,
    moveItemToPantry,
    moveItemsToPantry,
    completeCartItemWithExpiration,
    deleteItem,
    saveNotificationPreferences,
    signIn,
    signUp,
    signInWithGoogle: googleSignIn,
    signInWithApple: appleSignIn,
    signOut,
    deleteAccount,
  }), [
    appleSignIn,
    accountDeletionBusy,
    authBusy,
    addItem,
    carts,
    errorMessage,
    googleSignIn,
    isEnvReady,
    itemBusy,
    items,
    notificationBusy,
    notificationPreferences,
    deleteItem,
    deleteAccount,
    moveItemToCart,
    moveItemToPantry,
    moveItemsToPantry,
    completeCartItemWithExpiration,
    pantries,
    pantryCarts,
    pantryItems,
    profile,
    refreshAppState,
    saveNotificationPreferences,
    selectedPantry,
    selectedPantryId,
    session,
    signIn,
    signOut,
    signUp,
    status,
    updateItem,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return value;
}
