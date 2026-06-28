import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { Redirect, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { AppStackHeader } from '@/components/navigation/app-stack-header';
import {
  AppButton,
  AppScreen,
  ListRow,
  SectionCard,
  appColors,
} from '@/components/ui/primitives';
import { AI_CONSENT_VERSION, formatAiConsentDate, hasActiveAiConsent } from '@/lib/ai-consent';
import {
  getDeviceTimeZone,
  registerForPushNotifications,
} from '@/services/supabase/notification-service';
import { useAppContext } from '@/state/app-context';

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
  const {
    errorMessage,
    isAuthenticated,
    notificationBusy,
    notificationPreferences,
    pantries,
    profile,
    refreshAppState,
    saveNotificationPreferences,
    selectedPantry,
    selectedPantryId,
    selectPantry,
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
  const aiConsentEnabled = hasActiveAiConsent(profile);

  useEffect(() => {
    if (notificationPreferences) {
      setReminderTime(parseReminderTime(notificationPreferences.cartReminderTime));
    }
  }, [notificationPreferences]);

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const notificationsBusy = notificationBusy || notificationActionBusy;

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
      <AppStackHeader title="Settings" showAccountMenu={false} minimalBackButton />
      <AppScreen>
        <SectionCard
          title="Cart Reminders"
          subtitle="Receive one reminder each day when any pantry you belong to has items waiting in a cart."
        >
          <View style={styles.notificationToggleRow}>
            <View style={styles.notificationToggleCopy}>
              <Text style={styles.notificationToggleTitle}>Push notifications</Text>
              <Text style={styles.notificationToggleSubtitle}>
                {notificationPreferences?.cartRemindersEnabled
                  ? `Enabled for ${notificationPreferences.timeZone}`
                  : 'Disabled'}
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
              <Text style={styles.notificationToggleSubtitle}>
                Uses the current device time zone.
              </Text>
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
            label={notificationsBusy ? 'Saving…' : 'Save Reminder Time'}
            onPress={() => void saveReminderTime()}
            variant="secondary"
            disabled={!notificationPreferences || notificationsBusy}
          />
        </SectionCard>

        <SectionCard
          title="Workspace Scope"
          subtitle="Pantry selection belongs to the shared app state, so switching workspaces here updates every feature surface."
        >
          <View style={styles.pickerField}>
            <Picker
              selectedValue={selectedPantryId}
              onValueChange={(value) => {
                if (typeof value === 'string' && value) {
                  selectPantry(value);
                }
              }}
              enabled={pantries.length > 0}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor={String(appColors.tint)}
            >
              {pantries.length === 0 ? (
                <Picker.Item label="No pantry loaded" value="" />
              ) : null}
              {pantries.map((pantry) => (
                <Picker.Item key={pantry.id} label={pantry.name} value={pantry.id} />
              ))}
            </Picker>
          </View>

          <View style={{ gap: 10 }}>
            <ListRow
              title="Selected pantry"
              subtitle={selectedPantry?.name ?? 'None selected'}
            />
            <ListRow
              title="Expiration reminder time"
              subtitle={selectedPantry?.settings.reminderTime ?? 'Not configured'}
            />
            <ListRow
              title="Share code"
              subtitle={selectedPantry?.shareCode ?? 'Not generated'}
            />
          </View>
        </SectionCard>

        <SectionCard
          title="AI Scanning"
          subtitle="Barcode and expiration image scans are optional and require consent before Pantros sends a selected image to OpenAI."
        >
          <View style={{ gap: 10 }}>
            <ListRow
              title="Consent status"
              subtitle={
                aiConsentEnabled
                  ? `Accepted on ${formatAiConsentDate(profile?.aiConsentGrantedAt ?? null)}`
                  : 'Not accepted or withdrawn'
              }
              rightValue={profile?.aiConsentVersion ?? AI_CONSENT_VERSION}
            />
            <ListRow
              title="Processor"
              subtitle="OpenAI receives the selected scan image only to extract barcode digits or expiration dates."
            />
            <ListRow
              title="Withdrawal"
              subtitle="Turning this off blocks future AI uploads. Manual barcode and date entry still work."
            />
          </View>

          <AppButton
            label={aiConsentEnabled ? 'Withdraw AI Consent' : 'AI Consent Not Accepted'}
            onPress={() => void withdrawAiConsent()}
            variant="secondary"
            disabled={!aiConsentEnabled}
          />
        </SectionCard>

        <SectionCard
          title="Application State"
          subtitle="Manual controls for the current bootstrap and session lifecycle while the feature set is still expanding."
        >
          <View style={{ gap: 10 }}>
            <ListRow title="Profile" subtitle={profile?.email ?? 'Not authenticated'} />
            <ListRow
              title="Last app message"
              subtitle={errorMessage ?? 'No errors'}
            />
          </View>

          <AppButton
            label="Refresh App State"
            onPress={() => void refreshAppState()}
            variant="secondary"
          />
          <AppButton label="Sign Out" onPress={() => void signOut()} />
        </SectionCard>

        <SectionCard
          title="Delete Account"
          subtitle="Permanently delete your account, leave shared pantries, and choose what happens to pantries you own."
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
        >
          <View style={{ gap: 10 }}>
            <ListRow
              title="Privacy Policy"
              subtitle="How Pantros collects, uses, shares, and deletes data."
              onPress={() => router.push('/legal/privacy')}
            />
            <ListRow
              title="Terms of Service"
              subtitle="Basic service terms for shared pantry use."
              onPress={() => router.push('/legal/terms')}
            />
            <ListRow
              title="Contact Support"
              subtitle="Get help with account, reminder, or deletion issues."
              onPress={() => router.push('/legal/support')}
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
    borderWidth: 1,
    borderColor: appColors.border,
  },
  timeButtonPressed: {
    opacity: 0.72,
  },
  timeButtonText: {
    color: appColors.tint,
    fontSize: 15,
    fontWeight: '700',
  },
  pickerField: {
    minHeight: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
    justifyContent: 'center',
  },
  picker: {
    color: appColors.text,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: appColors.text,
    fontSize: 16,
  },
});
