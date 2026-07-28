import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { AddItemDestination } from '@/domain/models';

import { useAuthState } from './auth-state';
import { useWorkspaceState } from './workspace-state';

type AddItemDestinationState = {
  destination: AddItemDestination;
  ready: boolean;
  setDestination: (destination: AddItemDestination) => void;
};

const DEFAULT_DESTINATION: AddItemDestination = 'pantry';
const STORAGE_PREFIX = 'pantros.add-item-destination';

const AddItemDestinationContext = createContext<AddItemDestinationState | undefined>(undefined);

function parseDestination(value: string | null): AddItemDestination {
  return value === 'cart' || value === 'pantry' ? value : DEFAULT_DESTINATION;
}

export function AddItemDestinationProvider({children}: PropsWithChildren) {
  const {session} = useAuthState();
  const {selectedPantryId} = useWorkspaceState();
  const storageKey = session?.user?.id && selectedPantryId
    ? `${STORAGE_PREFIX}.${session.user.id}.${selectedPantryId}`
    : null;
  const [storedDestinations, setStoredDestinations] = useState<Record<string, AddItemDestination>>({});
  const [loadedKeys, setLoadedKeys] = useState<Record<string, boolean>>({});
  const storageReady = !storageKey || loadedKeys[storageKey] === true;

  useEffect(() => {
    if (!storageKey || storageReady) {
      return;
    }

    let cancelled = false;

    AsyncStorage.getItem(storageKey)
      .then(value => {
        if (cancelled) {
          return;
        }

        setStoredDestinations(current => ({
          ...current,
          [storageKey]: parseDestination(value),
        }));
        setLoadedKeys(current => ({...current, [storageKey]: true}));
      })
      .catch(() => {
        if (!cancelled) {
          setLoadedKeys(current => ({...current, [storageKey]: true}));
        }
      });

    return () => {
      cancelled = true;
    };
  }, [storageKey, storageReady]);

  const destination = storageKey
    ? storedDestinations[storageKey] ?? DEFAULT_DESTINATION
    : DEFAULT_DESTINATION;

  const setDestination = useCallback(
    (nextDestination: AddItemDestination) => {
      if (storageKey) {
        setStoredDestinations(current => ({...current, [storageKey]: nextDestination}));
        void AsyncStorage.setItem(storageKey, nextDestination).catch(() => undefined);
      }
    },
    [storageKey]
  );

  const value = useMemo<AddItemDestinationState>(
    () => ({
      destination,
      ready: storageReady,
      setDestination,
    }),
    [destination, setDestination, storageReady]
  );

  return <AddItemDestinationContext.Provider value={value}>{children}</AddItemDestinationContext.Provider>;
}

export function useAddItemDestination() {
  const value = useContext(AddItemDestinationContext);

  if (!value) {
    throw new Error('useAddItemDestination must be used inside AddItemDestinationProvider');
  }

  return value;
}
