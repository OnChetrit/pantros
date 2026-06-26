import type { Session, User } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';

import type { UserProfile } from '@/domain/models';

import { supabase } from './client';

WebBrowser.maybeCompleteAuthSession();

export async function getStoredSession() {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  return data.session;
}

export function subscribeToAuthChanges(listener: (session: Session | null) => void) {
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    listener(session);
  });

  return () => {
    subscription.unsubscribe();
  };
}

export async function signOutUser() {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    aiConsentVersion: data.ai_consent_version ?? null,
    aiConsentGrantedAt: data.ai_consent_granted_at ?? null,
    aiConsentWithdrawnAt: data.ai_consent_withdrawn_at ?? null,
  };
}

export async function ensureUserProfile(user: User): Promise<UserProfile | null> {
  const existing = await fetchUserProfile(user.id);

  if (existing) {
    return existing;
  }

  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name || user.user_metadata?.name || null,
      avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    aiConsentVersion: data.ai_consent_version ?? null,
    aiConsentGrantedAt: data.ai_consent_granted_at ?? null,
    aiConsentWithdrawnAt: data.ai_consent_withdrawn_at ?? null,
  };
}

export async function updateAiConsent(
  userId: string,
  input:
    | {
        status: 'granted';
        version: string;
      }
    | {
        status: 'withdrawn';
      }
): Promise<UserProfile> {
  const patch =
    input.status === 'granted'
      ? {
          id: userId,
          ai_consent_version: input.version,
          ai_consent_granted_at: new Date().toISOString(),
          ai_consent_withdrawn_at: null,
        }
      : {
          id: userId,
          ai_consent_withdrawn_at: new Date().toISOString(),
        };

  const { data, error } = await supabase.from('profiles').upsert(patch).select('*').single();

  if (error) {
    throw error;
  }

  return {
    id: data.id,
    email: data.email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    createdAt: data.created_at,
    aiConsentVersion: data.ai_consent_version ?? null,
    aiConsentGrantedAt: data.ai_consent_granted_at ?? null,
    aiConsentWithdrawnAt: data.ai_consent_withdrawn_at ?? null,
  };
}

export async function signInWithEmail(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw error;
  }
}

export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName ?? null,
      },
    },
  });

  if (error) {
    throw error;
  }
}

function getRedirectUrl() {
  if (Platform.OS === 'web') {
    return globalThis.location?.origin ?? AuthSession.makeRedirectUri();
  }

  return AuthSession.makeRedirectUri({
    scheme: 'pantry',
    path: 'auth/callback',
  });
}

async function signInWithOAuthProvider(provider: 'google' | 'apple') {
  const redirectTo = getRedirectUrl();
  const isWeb = Platform.OS === 'web';

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      ...(isWeb ? {} : { skipBrowserRedirect: true }),
    },
  });

  if (error) {
    throw error;
  }

  if (isWeb) {
    return;
  }

  if (!data?.url) {
    throw new Error(`No ${provider} auth URL was returned.`);
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
    preferEphemeralSession: Platform.OS === 'ios',
  });

  if (result.type !== 'success' || !result.url) {
    return;
  }

  const url = new URL(result.url);
  const hash = new URLSearchParams(url.hash.replace(/^#/, ''));
  const accessToken = hash.get('access_token');
  const refreshToken = hash.get('refresh_token');

  if (!accessToken || !refreshToken) {
    throw new Error(`${provider} auth did not return an access token and refresh token.`);
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  if (sessionError) {
    throw sessionError;
  }
}

export async function signInWithGoogle() {
  await signInWithOAuthProvider('google');
}

export async function signInWithApple() {
  if (Platform.OS === 'web') {
    await signInWithOAuthProvider('apple');
    return;
  }

  const isAvailable = await AppleAuthentication.isAvailableAsync();

  if (!isAvailable) {
    throw new Error('Apple Sign In is not available on this device.');
  }

  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign In did not return an identity token.');
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });

  if (error) {
    throw error;
  }
}
