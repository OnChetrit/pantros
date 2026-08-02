import { Redirect } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppScreen, EmptyNotice, appColors } from '@/components/ui/primitives';
import { AuthModePicker } from '@/features/auth/auth-mode-picker/auth-mode-picker';
import type { AuthMode } from '@/features/auth/auth-mode-picker/auth-mode-picker';
import { AuthProviderButton } from '@/features/auth/auth-provider-button/auth-provider-button';
import { useThemedStyles } from '@/lib/theme';
import { useAuthState } from '@/state/auth-state';
import { useWorkspaceState } from '@/state/workspace-state';

export default function LoginScreen() {
  const styles = useThemedStyles(createStyles);
  const {
    authBusy,
    errorMessage,
    isAuthenticated,
    isEnvReady,
    signIn,
    signInWithApple,
    signInWithGoogle,
    signUp,
  } = useAuthState();
  const {refreshWorkspace} = useWorkspaceState();
  const [mode, setMode] = useState<AuthMode>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const fullNameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);

  if (isAuthenticated) {
    return <Redirect href="/pantry" />;
  }

  const disabled = authBusy || !isEnvReady;
  const emailButtonLabel = authBusy ? 'Working...' : mode === 'signin' ? 'Sign in with email' : 'Create with email';

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setPassword('');
    setConfirmPassword('');
    setFormError(null);
  };

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setFormError(mode === 'signin' ? 'Add email and password.' : 'Add email and choose a password.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setFormError('Passwords must match.');
      return;
    }

    setFormError(null);

    if (mode === 'signin') {
      await signIn(email.trim(), password);
      return;
    }

    await signUp(email.trim(), password, fullName.trim() || undefined);
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        >
          <AppScreen>
            <View style={styles.hero}>
              <Text style={styles.brand}>Pantros</Text>
            </View>

            <View style={styles.authCardWrap}>
              <View style={styles.authCard}>
                <AuthModePicker mode={mode} disabled={authBusy} onChange={switchMode} />

                <View style={styles.providers}>
                  <Text style={styles.providersLabel}>Continue with</Text>
                  <View style={styles.providersActions}>
                    <AuthProviderButton
                      icon="logo-google"
                      label="Continue with Google"
                      onPress={() => void signInWithGoogle()}
                      disabled={disabled}
                    />
                    {process.env.EXPO_OS === 'ios' ? (
                      <AuthProviderButton
                        icon="logo-apple"
                        label="Continue with Apple"
                        onPress={() => void signInWithApple()}
                        disabled={disabled}
                      />
                    ) : null}
                  </View>
                </View>

                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or use email</Text>
                  <View style={styles.dividerLine} />
                </View>

                {mode === 'signup' ? (
                  <TextInput
                    ref={fullNameRef}
                    value={fullName}
                    onChangeText={value => {
                      setFullName(value);
                      setFormError(null);
                    }}
                    placeholder="Full name"
                    placeholderTextColor={appColors.muted}
                    style={styles.input}
                    editable={!disabled}
                    autoCorrect={false}
                    textContentType="name"
                    autoComplete="name"
                    returnKeyType="next"
                    blurOnSubmit={false}
                    keyboardAppearance="light"
                    onSubmitEditing={() => emailRef.current?.focus()}
                  />
                ) : null}
                <TextInput
                  ref={emailRef}
                  value={email}
                  onChangeText={value => {
                    setEmail(value);
                    setFormError(null);
                  }}
                  placeholder="Email"
                  placeholderTextColor={appColors.muted}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  style={styles.input}
                  editable={!disabled}
                  autoCorrect={false}
                  textContentType="username"
                  autoComplete="email"
                  returnKeyType="next"
                  blurOnSubmit={false}
                  keyboardAppearance="light"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                />
                <TextInput
                  ref={passwordRef}
                  value={password}
                  onChangeText={value => {
                    setPassword(value);
                    setFormError(null);
                  }}
                  placeholder="Password"
                  placeholderTextColor={appColors.muted}
                  secureTextEntry
                  style={styles.input}
                  editable={!disabled}
                  autoCorrect={false}
                  textContentType={mode === 'signin' ? 'password' : 'newPassword'}
                  autoComplete={mode === 'signin' ? 'password' : 'new-password'}
                  returnKeyType={mode === 'signup' ? 'next' : 'go'}
                  blurOnSubmit={mode !== 'signup'}
                  keyboardAppearance="light"
                  onSubmitEditing={() => {
                    if (mode === 'signup') {
                      confirmPasswordRef.current?.focus();
                      return;
                    }

                    void handleEmailAuth();
                  }}
                />
                {mode === 'signup' ? (
                  <TextInput
                    ref={confirmPasswordRef}
                    value={confirmPassword}
                    onChangeText={value => {
                      setConfirmPassword(value);
                      setFormError(null);
                    }}
                    placeholder="Confirm password"
                    placeholderTextColor={appColors.muted}
                    secureTextEntry
                    style={styles.input}
                    editable={!disabled}
                    autoCorrect={false}
                    textContentType="newPassword"
                    autoComplete="new-password"
                    returnKeyType="go"
                    keyboardAppearance="light"
                    onSubmitEditing={() => void handleEmailAuth()}
                  />
                ) : null}

                {mode === 'signup' && password && confirmPassword && password !== confirmPassword ? (
                  <EmptyNotice title="Mismatch" body="Passwords must match." />
                ) : null}
                {formError ? <EmptyNotice title="Check input" body={formError} /> : null}
                {errorMessage ? <EmptyNotice title="Auth error" body={errorMessage} /> : null}
                {!isEnvReady ? (
                  <EmptyNotice
                    title="Missing environment"
                    body="Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY."
                  />
                ) : null}

                <AppButton label={emailButtonLabel} onPress={() => void handleEmailAuth()} disabled={disabled} />
              </View>
            </View>

            {!isEnvReady ? (
              <View style={styles.bootstrapCard}>
                <Text style={styles.bootstrapTitle}>Bootstrap</Text>
                <Text style={styles.bootstrapSubtitle}>Retry runtime config check.</Text>
                <AppButton label="Retry Bootstrap" onPress={() => void refreshWorkspace()} variant="secondary" />
              </View>
            ) : null}
          </AppScreen>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 24,
    flexGrow: 1,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 28,
    paddingBottom: 18,
  },
  brand: {
    color: colors.tint,
    fontSize: 42,
    lineHeight: 48,
    fontWeight: '800',
    letterSpacing: 0.8,
    textAlign: 'center',
  },
  authCardWrap: {
    alignItems: 'center',
  },
  authCard: {
    width: '100%',
    maxWidth: 460,
    borderRadius: 28,
    padding: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  providers: {
    alignItems: 'center',
    gap: 10,
  },
  providersLabel: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  providersActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  input: {
    minHeight: 50,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.text,
    fontSize: 16,
  },
  bootstrapCard: {
    borderRadius: 24,
    padding: 18,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  bootstrapTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '700',
  },
  bootstrapSubtitle: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
  },
});
