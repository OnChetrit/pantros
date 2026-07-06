import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { NotificationPreferences } from '@/domain/models';
import {
  clearStoredPushToken,
  fetchNotificationPreferences,
  syncPushTokenIfPermitted,
  updateNotificationPreferences,
} from '@/services/supabase/notification-service';

import { useAuthState } from './auth-state';

type NotificationStateContextValue = {
  notificationPreferences: NotificationPreferences | null;
  notificationBusy: boolean;
  errorMessage: string | null;
  refreshNotificationPreferences: () => Promise<void>;
  saveNotificationPreferences: (
    preferences: NotificationPreferences
  ) => Promise<NotificationPreferences>;
  clearNotificationState: () => Promise<void>;
};

const NotificationStateContext = createContext<NotificationStateContextValue | undefined>(undefined);

export function NotificationStateProvider({children}: PropsWithChildren) {
  const {isEnvReady, session} = useAuthState();
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences | null>(null);
  const [notificationBusy, setNotificationBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshNotificationPreferences = useCallback(async () => {
    if (!isEnvReady || !session?.user) {
      setNotificationPreferences(null);
      setErrorMessage(null);
      return;
    }

    try {
      const nextNotificationPreferences = await fetchNotificationPreferences(session.user.id);
      setNotificationPreferences(nextNotificationPreferences);
      setErrorMessage(null);

      if (nextNotificationPreferences.cartRemindersEnabled) {
        void syncPushTokenIfPermitted();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load notification preferences.';
      setNotificationPreferences(null);
      setErrorMessage(message);
    }
  }, [isEnvReady, session]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void refreshNotificationPreferences();
    }, 0);

    return () => {
      clearTimeout(timeout);
    };
  }, [refreshNotificationPreferences]);

  const saveNotificationPreferences = useCallback(async (preferences: NotificationPreferences) => {
    setNotificationBusy(true);
    setErrorMessage(null);

    try {
      const savedPreferences = await updateNotificationPreferences(preferences);
      setNotificationPreferences(savedPreferences);
      return savedPreferences;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save notification preferences.';
      setErrorMessage(message);
      throw error;
    } finally {
      setNotificationBusy(false);
    }
  }, []);

  const clearNotificationState = useCallback(async () => {
    setNotificationPreferences(null);
    setErrorMessage(null);
    await clearStoredPushToken();
  }, []);

  const value = useMemo<NotificationStateContextValue>(
    () => ({
      notificationPreferences,
      notificationBusy,
      errorMessage,
      refreshNotificationPreferences,
      saveNotificationPreferences,
      clearNotificationState,
    }),
    [
      clearNotificationState,
      errorMessage,
      notificationBusy,
      notificationPreferences,
      refreshNotificationPreferences,
      saveNotificationPreferences,
    ]
  );

  return <NotificationStateContext.Provider value={value}>{children}</NotificationStateContext.Provider>;
}

export function useNotificationState() {
  const value = useContext(NotificationStateContext);

  if (!value) {
    throw new Error('useNotificationState must be used inside NotificationStateProvider');
  }

  return value;
}
