import DateTimePicker from '@react-native-community/datetimepicker';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  LayoutChangeEvent,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import {
  AppButton,
  AppScreen,
  ListRow,
  SectionCard,
  appColors,
} from '@/components/ui/primitives';
import { AI_CONSENT_VERSION, formatAiConsentDate, hasActiveAiConsent } from '@/lib/ai-consent';
import { useAppTheme } from '@/lib/theme';
import {
  getDeviceTimeZone,
  registerForPushNotifications,
} from '@/services/supabase/notification-service';
import { useAppContext } from '@/state/app-context';

type ThemeChipProps = {
  label: string;
  active: boolean;
  onPress: () => void;
};

function ThemeChip({label, active, onPress}: ThemeChipProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({pressed}) => [
        styles.themeChip,
        active ? styles.themeChipActive : null,
        pressed ? styles.themeChipPressed : null,
      ]}
    >
      <Text style={[styles.themeChipText, active ? styles.themeChipTextActive : null]}>
        {label}
      </Text>
    </Pressable>
  );
}

function parseReminderTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

function formatReminderTime(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(
    value.getMinutes()
  ).padStart(2, '0')}`;
}

export default function SettingsScreen() {
  const router = useRouter();
  const { themePreference, setThemePreference } = useAppTheme();
  const {
    errorMessage,
    isAuthenticated,
    notificationBusy,
    notificationPreferences,
    profile,
    refreshAppState,
    saveNotificationPreferences,
    signOut,
    status,
    withdrawAiConsent,
  } = useAppContext();
  const [reminderTime, setReminderTime] = useState(() =>
    parseReminderTime(notificationPreferences?.cartReminderTime ?? '18:00')
  );
  const [notificationActionBusy, setNotificationActionBusy] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [showAndroidTimePicker, setShowAndroidTimePicker] = useState(false);
  const [themeSwitchWidth, setThemeSwitchWidth] = useState(0);
  const aiConsentEnabled = hasActiveAiConsent(profile);
  const themeAnimation = useRef(
    new Animated.Value(themePreference === 'device' ? 0 : themePreference === 'light' ? 1 : 2)
  ).current;

  useEffect(() => {
    if (notificationPreferences) {
      setReminderTime(parseReminderTime(notificationPreferences.cartReminderTime));
    }
  }, [notificationPreferences]);

  useEffect(() => {
    Animated.timing(themeAnimation, {
      toValue: themePreference === 'device' ? 0 : themePreference === 'light' ? 1 : 2,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [themeAnimation, themePreference]);

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const notificationsBusy = notificationBusy || notificationActionBusy;
  const themeIndicatorWidth = themeSwitchWidth > 0 ? (themeSwitchWidth - 12 - 16) / 3 : 0;
  const themeIndicatorTranslateX = themeAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [0, themeIndicatorWidth + 8, themeIndicatorWidth * 2 + 16],
  });

  const handleThemeSwitchLayout = (event: LayoutChangeEvent) => {
    setThemeSwitchWidth(event.nativeEvent.layout.width);
  };

  const saveCartReminderSettings = async (enabled: boolean) => {
    if (!notificationPreferences) {
      return;
    }

    setNotificationActionBusy(true);
    setNotificationError(null);

    try {
      if (enabled) {
        const token = await registerForPushNotifications(true);

        if (!token) {
          throw new Error(
            'Notification permission is required to enable cart reminders.'
          );
        }
      }

      await saveNotificationPreferences({
        ...notificationPreferences,
        cartRemindersEnabled: enabled,
        cartReminderTime: formatReminderTime(reminderTime),
        timeZone: getDeviceTimeZone(),
      });
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Unable to save notification settings.'
      );
    } finally {
      setNotificationActionBusy(false);
    }
  };

  const saveReminderTime = async () => {
    if (!notificationPreferences) {
      return;
    }

    setNotificationActionBusy(true);
    setNotificationError(null);

    try {
      await saveNotificationPreferences({
        ...notificationPreferences,
        cartReminderTime: formatReminderTime(reminderTime),
        timeZone: getDeviceTimeZone(),
      });
    } catch (error) {
      setNotificationError(
        error instanceof Error
          ? error.message
          : 'Unable to save the reminder time.'
      );
    } finally {
      setNotificationActionBusy(false);
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: appColors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <AppScreen>
        <SectionCard
          title="Appearance"
          subtitle="Choose how Pantros follows light and dark mode."
          borderless
        >
          <View style={styles.themeSwitch} onLayout={handleThemeSwitchLayout}>
            {themeIndicatorWidth > 0 ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.themeIndicator,
                  {
                    width: themeIndicatorWidth,
                    transform: [{translateX: themeIndicatorTranslateX}],
                  },
                ]}
              />
            ) : null}
            <ThemeChip
              label="Device"
              active={themePreference === 'device'}
              onPress={() => void setThemePreference?.('device')}
            />
            <ThemeChip
              label="Light"
              active={themePreference === 'light'}
              onPress={() => void setThemePreference?.('light')}
            />
            <ThemeChip
              label="Dark"
              active={themePreference === 'dark'}
              onPress={() => void setThemePreference?.('dark')}
            />
          </View>
        </SectionCard>

        <SectionCard
          title="Reminders"
          subtitle="Daily cart reminders use your device time zone."
          borderless
        >
          <View style={styles.notificationToggleRow}>
            <View style={styles.notificationToggleCopy}>
              <Text style={styles.notificationToggleTitle}>Cart reminders</Text>
              <Text style={styles.notificationToggleSubtitle}>
                {notificationPreferences?.cartRemindersEnabled ? 'On' : 'Off'}
              </Text>
            </View>
            <Switch
              value={notificationPreferences?.cartRemindersEnabled ?? false}
              disabled={!notificationPreferences || notificationsBusy}
              onValueChange={(enabled) => {
                void saveCartReminderSettings(enabled);
              }}
            />
          </View>

          <View style={styles.timeRow}>
            <View style={styles.notificationToggleCopy}>
              <Text style={styles.notificationToggleTitle}>Reminder time</Text>
              <Text style={styles.notificationToggleSubtitle}>Uses the current device time zone.</Text>
            </View>
            {Platform.OS === 'android' ? (
              <Pressable
                disabled={!notificationPreferences || notificationsBusy}
                onPress={() => setShowAndroidTimePicker(true)}
                style={({ pressed }) => [
                  styles.timeButton,
                  pressed ? styles.timeButtonPressed : null,
                ]}
              >
                <Text style={styles.timeButtonText}>
                  {formatReminderTime(reminderTime)}
                </Text>
              </Pressable>
            ) : (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="default"
                disabled={!notificationPreferences || notificationsBusy}
                onChange={(_event, date) => {
                  if (date) {
                    setReminderTime(date);
                  }
                }}
              />
            )}
          </View>

          {Platform.OS === 'android' && showAndroidTimePicker ? (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display="default"
              onChange={(_event, date) => {
                setShowAndroidTimePicker(false);
                if (date) {
                  setReminderTime(date);
                }
              }}
            />
          ) : null}

          {notificationError ? (
            <Text style={styles.notificationError}>{notificationError}</Text>
          ) : null}

          <AppButton
            label={notificationsBusy ? 'Saving…' : 'Save time'}
            onPress={() => void saveReminderTime()}
            variant="secondary"
            disabled={!notificationPreferences || notificationsBusy}
          />
        </SectionCard>

        <SectionCard
          title="AI Scanning"
          subtitle="Optional barcode and expiration scans require consent."
          borderless
        >
          <ListRow
            title="Consent"
            subtitle={
              aiConsentEnabled
                ? `Accepted on ${formatAiConsentDate(profile?.aiConsentGrantedAt ?? null)}`
                : 'Not enabled'
            }
            rightValue={profile?.aiConsentVersion ?? AI_CONSENT_VERSION}
            borderless
          />

          <AppButton
            label={aiConsentEnabled ? 'Withdraw AI Consent' : 'AI Consent Not Accepted'}
            onPress={() => void withdrawAiConsent()}
            variant="secondary"
            disabled={!aiConsentEnabled}
          />
        </SectionCard>

        <SectionCard
          title="Session"
          subtitle="Current account and app state."
          borderless
        >
          <View style={{ gap: 10 }}>
            <ListRow title="Profile" subtitle={profile?.email ?? 'Not authenticated'} borderless />
            <ListRow title="Status" subtitle={errorMessage ?? 'No errors'} borderless />
          </View>

          <AppButton label="Refresh" onPress={() => void refreshAppState()} variant="secondary" />
          <AppButton label="Sign Out" onPress={() => void signOut()} />
        </SectionCard>

        <SectionCard
          title="Delete Account"
          subtitle="Permanently delete your account, leave shared pantries, and choose what happens to pantries you own."
          borderless
        >
          <AppButton
            label="Review Account Deletion"
            onPress={() => router.push('/account/delete')}
            variant="secondary"
          />
        </SectionCard>

        <SectionCard
          title="Legal"
          subtitle="Review the current privacy policy, terms, and support contact details."
          borderless
        >
          <View style={{ gap: 10 }}>
            <ListRow
              title="Privacy Policy"
              subtitle="How Pantros collects, uses, shares, and deletes data."
              onPress={() => router.push('/legal/privacy')}
              borderless
            />
            <ListRow
              title="Terms of Service"
              subtitle="Basic service terms for shared pantry use."
              onPress={() => router.push('/legal/terms')}
              borderless
            />
            <ListRow
              title="Contact Support"
              subtitle="Get help with account, reminder, or deletion issues."
              onPress={() => router.push('/legal/support')}
              borderless
            />
          </View>
        </SectionCard>
      </AppScreen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  notificationToggleRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  notificationToggleCopy: {
    flex: 1,
    gap: 3,
  },
  notificationToggleTitle: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  notificationToggleSubtitle: {
    color: appColors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  timeRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  notificationError: {
    color: appColors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
  timeButton: {
    minWidth: 76,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: appColors.input,
  },
  timeButtonPressed: {
    opacity: 0.72,
  },
  timeButtonText: {
    color: appColors.tint,
    fontSize: 15,
    fontWeight: '700',
  },
  themeSwitch: {
    position: 'relative',
    flexDirection: 'row',
    gap: 8,
    padding: 6,
    borderRadius: 22,
    backgroundColor: appColors.background,
  },
  themeIndicator: {
    position: 'absolute',
    top: 6,
    left: 6,
    bottom: 6,
    borderRadius: 16,
    backgroundColor: appColors.tint,
  },
  themeChip: {
    position: 'relative',
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  themeChipActive: {
    borderColor: 'transparent',
  },
  themeChipPressed: {
    opacity: 0.78,
  },
  themeChipText: {
    color: appColors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  themeChipTextActive: {
    color: appColors.textInverse,
  },
});
