import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { BootstrapStatus, Cart, Pantry, PantryItem, PantryItemInput, UserProfile } from '@/domain/models';
import { hasSupabaseEnv } from '@/lib/env';
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
import { fetchWorkspaceBundle } from '@/services/supabase/workspace-service';

type AppContextValue = {
  status: BootstrapStatus;
  isEnvReady: boolean;
  session: Session | null;
  profile: UserProfile | null;
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
  refreshAppState: () => Promise<void>;
  selectPantry: (pantryId: string) => void;
  addItem: (input: PantryItemInput) => Promise<PantryItem>;
  updateItem: (itemId: string, input: PantryItemInput) => Promise<PantryItem>;
  moveItemToCart: (itemId: string, cartId: string | null) => Promise<PantryItem>;
  moveItemToPantry: (itemId: string) => Promise<PantryItem>;
  deleteItem: (itemId: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: PropsWithChildren) {
  const [status, setStatus] = useState<BootstrapStatus>('idle');
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [itemBusy, setItemBusy] = useState(false);

  const isEnvReady = hasSupabaseEnv();

  const hydrateWorkspace = useCallback(async (nextSession: Session | null) => {
    setSession(nextSession);

    if (!isEnvReady) {
      setStatus('error');
      setErrorMessage('Supabase environment variables are missing.');
      setProfile(null);
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
      setPantries([]);
      setItems([]);
      setCarts([]);
      setSelectedPantryId(null);
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const bundle = await fetchWorkspaceBundle(nextSession.user);

      setProfile(bundle.profile);
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
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load app state.';
      setStatus('error');
      setErrorMessage(message);
    }
  }, [isEnvReady]);

  useEffect(() => {
    setStatus('loading');

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
    await signOutUser();
  }, []);

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
    refreshAppState,
    selectPantry: setSelectedPantryId,
    addItem,
    updateItem,
    moveItemToCart,
    moveItemToPantry,
    deleteItem,
    signIn,
    signUp,
    signInWithGoogle: googleSignIn,
    signInWithApple: appleSignIn,
    signOut,
  }), [
    appleSignIn,
    authBusy,
    addItem,
    carts,
    errorMessage,
    googleSignIn,
    isEnvReady,
    itemBusy,
    items,
    deleteItem,
    moveItemToCart,
    moveItemToPantry,
    pantries,
    pantryCarts,
    pantryItems,
    profile,
    refreshAppState,
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
