import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { BootstrapStatus, Cart, Pantry, PantryItem, UserProfile } from '@/domain/models';
import { fetchWorkspaceBundle } from '@/services/supabase/workspace-service';

import { useAuthState } from './auth-state';

type WorkspaceStateContextValue = {
  status: BootstrapStatus;
  errorMessage: string | null;
  profile: UserProfile | null;
  pantries: Pantry[];
  items: PantryItem[];
  carts: Cart[];
  selectedPantryId: string | null;
  selectedPantry: Pantry | null;
  pantryItems: PantryItem[];
  pantryCarts: Cart[];
  selectPantry: (pantryId: string) => void;
  setItems: React.Dispatch<React.SetStateAction<PantryItem[]>>;
  refreshWorkspace: () => Promise<void>;
};

const WorkspaceStateContext = createContext<WorkspaceStateContextValue | undefined>(undefined);

export function WorkspaceStateProvider({children}: PropsWithChildren) {
  const {isEnvReady, session, status: authStatus} = useAuthState();
  const [status, setStatus] = useState<BootstrapStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pantries, setPantries] = useState<Pantry[]>([]);
  const [items, setItems] = useState<PantryItem[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [selectedPantryId, setSelectedPantryId] = useState<string | null>(null);

  const resetWorkspace = useCallback(() => {
    setProfile(null);
    setPantries([]);
    setItems([]);
    setCarts([]);
    setSelectedPantryId(null);
  }, []);

  const hydrateWorkspace = useCallback(async () => {
    if (!isEnvReady) {
      setStatus('error');
      setErrorMessage('Supabase environment variables are missing.');
      resetWorkspace();
      return;
    }

    if (!session?.user) {
      setStatus(authStatus === 'loading' ? 'loading' : 'ready');
      setErrorMessage(null);
      resetWorkspace();
      return;
    }

    setStatus('loading');
    setErrorMessage(null);

    try {
      const bundle = await fetchWorkspaceBundle(session.user);

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
      resetWorkspace();
    }
  }, [authStatus, isEnvReady, resetWorkspace, session]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void hydrateWorkspace();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
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

  const value = useMemo<WorkspaceStateContextValue>(
    () => ({
      status,
      errorMessage,
      profile,
      pantries,
      items,
      carts,
      selectedPantryId,
      selectedPantry,
      pantryItems,
      pantryCarts,
      selectPantry: setSelectedPantryId,
      setItems,
      refreshWorkspace: hydrateWorkspace,
    }),
    [
      carts,
      errorMessage,
      hydrateWorkspace,
      items,
      pantries,
      pantryCarts,
      pantryItems,
      profile,
      selectedPantry,
      selectedPantryId,
      status,
    ]
  );

  return <WorkspaceStateContext.Provider value={value}>{children}</WorkspaceStateContext.Provider>;
}

export function useWorkspaceState() {
  const value = useContext(WorkspaceStateContext);

  if (!value) {
    throw new Error('useWorkspaceState must be used inside WorkspaceStateProvider');
  }

  return value;
}
