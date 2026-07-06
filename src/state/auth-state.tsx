import type { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import type { BootstrapStatus } from '@/domain/models';
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
import { unregisterCurrentPushToken } from '@/services/supabase/notification-service';

type AuthStateContextValue = {
  status: BootstrapStatus;
  isEnvReady: boolean;
  isAuthenticated: boolean;
  session: Session | null;
  authBusy: boolean;
  errorMessage: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthStateContext = createContext<AuthStateContextValue | undefined>(undefined);

export function AuthStateProvider({children}: PropsWithChildren) {
  const [status, setStatus] = useState<BootstrapStatus>('loading');
  const [session, setSession] = useState<Session | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const isEnvReady = hasSupabaseEnv();

  const hydrateSession = useCallback(
    async (nextSession: Session | null) => {
      setSession(nextSession);

      if (!isEnvReady) {
        setStatus('error');
        setErrorMessage('Supabase environment variables are missing.');
        return;
      }

      setStatus('ready');
      setErrorMessage(null);
    },
    [isEnvReady]
  );

  useEffect(() => {
    getStoredSession()
      .then((storedSession) => hydrateSession(storedSession))
      .catch((error) => {
        const message = error instanceof Error ? error.message : 'Failed to restore session.';
        setStatus('error');
        setErrorMessage(message);
      });

    return subscribeToAuthChanges((nextSession) => {
      void hydrateSession(nextSession);
    });
  }, [hydrateSession]);

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

  const signOut = useCallback(async () => {
    try {
      await unregisterCurrentPushToken();
    } catch (error) {
      console.warn('Unable to unregister this device before signing out.', error);
    } finally {
      await signOutUser();
    }
  }, []);

  const value = useMemo<AuthStateContextValue>(
    () => ({
      status,
      isEnvReady,
      isAuthenticated: Boolean(session?.user),
      session,
      authBusy,
      errorMessage,
      signIn,
      signUp,
      signInWithGoogle: googleSignIn,
      signInWithApple: appleSignIn,
      signOut,
    }),
    [appleSignIn, authBusy, errorMessage, googleSignIn, isEnvReady, session, signIn, signOut, signUp, status]
  );

  return <AuthStateContext.Provider value={value}>{children}</AuthStateContext.Provider>;
}

export function useAuthState() {
  const value = useContext(AuthStateContext);

  if (!value) {
    throw new Error('useAuthState must be used inside AuthStateProvider');
  }

  return value;
}
