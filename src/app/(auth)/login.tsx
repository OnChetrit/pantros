import { Redirect } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton, AppScreen, EmptyNotice, SectionCard, appColors } from '@/components/ui/primitives';
import { useAppContext } from '@/state/app-context';

export default function LoginScreen() {
  const {
    authBusy,
    errorMessage,
    isAuthenticated,
    isEnvReady,
    refreshAppState,
    signIn,
    signInWithApple,
    signInWithGoogle,
    signUp,
  } = useAppContext();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const fullNameRef = useRef<TextInput | null>(null);
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const confirmPasswordRef = useRef<TextInput | null>(null);
  const title = mode === 'signin' ? 'Sign In' : 'Create Account';

  useEffect(() => {
    if (!isAuthenticated) {
      setMode('signin');
      setPassword('');
      setConfirmPassword('');
      setFullName('');
      setFormError(null);
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return <Redirect href="/(tabs)/pantry" />;
  }

  const handleEmailAuth = async () => {
    if (!email.trim() || !password.trim()) {
      setFormError(
        mode === 'signin'
          ? 'Enter your email and password to sign in.'
          : 'Enter your email and password to create an account.'
      );
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setFormError('Use the same password in both fields before creating the account.');
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
              <Text style={styles.kicker}>the</Text>
              <Text style={styles.logo}>PANTRY</Text>
              <Text style={styles.subtitle}>Track fresh food, share pantry state, and keep shopping flows clean.</Text>
            </View>

            <SectionCard
              title={title}
              subtitle={
                isEnvReady
                  ? 'Use email today. Google and Apple are also wired into the auth layer.'
                  : 'Supabase environment is missing, so sign-in actions are disabled until it is configured.'
              }
            >
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
                  editable={!authBusy && isEnvReady}
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
                editable={!authBusy && isEnvReady}
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
                editable={!authBusy && isEnvReady}
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
                  editable={!authBusy && isEnvReady}
                  autoCorrect={false}
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="go"
                  keyboardAppearance="light"
                  onSubmitEditing={() => void handleEmailAuth()}
                />
              ) : null}
              {mode === 'signup' && password && confirmPassword && password !== confirmPassword ? (
                <EmptyNotice
                  title="Passwords do not match"
                  body="Use the same password in both fields before creating the account."
                />
              ) : null}
              {formError ? <EmptyNotice title="Check the form" body={formError} /> : null}
              {errorMessage ? <EmptyNotice title="Auth error" body={errorMessage} /> : null}
              {!isEnvReady ? (
                <EmptyNotice
                  title="Missing environment"
                  body="Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in your local env file."
                />
              ) : null}

              <AppButton
                label={authBusy ? 'Working...' : title}
                onPress={() => void handleEmailAuth()}
                disabled={authBusy || !isEnvReady}
              />
              <AppButton
                label="Continue with Google"
                onPress={() => void signInWithGoogle()}
                variant="secondary"
                disabled={authBusy || !isEnvReady}
              />
              {Platform.OS === 'ios' ? (
                <AppButton
                  label="Continue with Apple"
                  onPress={() => void signInWithApple()}
                  variant="secondary"
                  disabled={authBusy || !isEnvReady}
                />
              ) : null}
              <Pressable
                onPress={() => {
                  setMode(current => (current === 'signin' ? 'signup' : 'signin'));
                  setPassword('');
                  setConfirmPassword('');
                  setFormError(null);
                }}
              >
                <Text style={styles.switchText}>
                  {mode === 'signin' ? 'Need an account? Create one.' : 'Already have an account? Sign in.'}
                </Text>
              </Pressable>
            </SectionCard>

            {!isEnvReady ? (
              <SectionCard title="Bootstrap" subtitle="The runtime env is still checked in the main app context.">
                <AppButton label="Retry Bootstrap" onPress={() => void refreshAppState()} variant="secondary" />
              </SectionCard>
            ) : null}
          </AppScreen>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scrollView: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  content: {
    paddingBottom: 24,
  },
  hero: {
    gap: 8,
    paddingTop: 8,
  },
  kicker: {
    fontSize: 22,
    color: appColors.tint,
  },
  logo: {
    fontSize: 52,
    fontWeight: '800',
    color: appColors.text,
    letterSpacing: 1.5,
  },
  subtitle: {
    color: appColors.muted,
    fontSize: 16,
    lineHeight: 24,
  },
  input: {
    minHeight: 48,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.input,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: appColors.text,
    fontSize: 16,
  },
  switchText: {
    textAlign: 'center',
    color: appColors.muted,
    fontSize: 14,
    marginTop: 2,
  },
});
