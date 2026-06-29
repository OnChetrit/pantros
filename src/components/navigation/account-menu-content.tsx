import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { hasActiveAiConsent } from '@/lib/ai-consent';
import { useAppTheme, useThemedStyles } from '@/lib/theme';
import {
  getDeviceTimeZone,
  registerForPushNotifications,
} from '@/services/supabase/notification-service';
import { useAppContext } from '@/state/app-context';
import { AccountActionsSection, AccountOverviewSection, AiScanningSection, AppearanceSection, RemindersSection, SupportSection } from './account-menu/account-menu-sections';
import { AccountProfileHeader } from './account-menu/account-profile-header';
import type { AccountMenuDestination } from './account-menu/account-menu.types';
import { formatReminderTime, parseReminderTime } from './account-menu/account-menu.utils';

export type { AccountMenuDestination } from './account-menu/account-menu.types';

const destinationHrefMap: Record<AccountMenuDestination, '/account/delete' | '/legal/privacy' | '/legal/support' | '/legal/terms'> = {
  delete: '/account/delete',
  privacy: '/legal/privacy',
  support: '/legal/support',
  terms: '/legal/terms',
};

export function AccountMenuContent({
  onNavigate,
}: {
  onNavigate?: (destination: AccountMenuDestination) => void;
}) {
  const router = useRouter();
  const styles = useThemedStyles(createStyles);
  const { themePreference, setThemePreference } = useAppTheme();
  const {
    notificationBusy,
    notificationPreferences,
    pantries,
    profile,
    saveNotificationPreferences,
    selectedPantry,
    signOut,
    withdrawAiConsent,
  } = useAppContext();
  const [reminderTime, setReminderTime] = useState(() =>
    parseReminderTime(notificationPreferences?.cartReminderTime ?? '18:00')
  );
  const [notificationActionBusy, setNotificationActionBusy] = useState(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);
  const [showAndroidTimePicker, setShowAndroidTimePicker] = useState(false);

  const expanderName = useMemo(
    () => profile?.fullName ?? profile?.email ?? 'Pantros User',
    [profile?.email, profile?.fullName]
  );
  const aiConsentEnabled = hasActiveAiConsent(profile);
  const notificationsBusy = notificationBusy || notificationActionBusy;

  useEffect(() => {
    if (notificationPreferences) {
      setReminderTime(parseReminderTime(notificationPreferences.cartReminderTime));
    }
  }, [notificationPreferences]);

  const handleNavigate = (destination: AccountMenuDestination) => {
    if (onNavigate) {
      onNavigate(destination);
      return;
    }

    router.replace(destinationHrefMap[destination]);
  };

  const handleSignOut = () => {
    void signOut();
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
          throw new Error('Notification permission is required to enable cart reminders.');
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
        error instanceof Error ? error.message : 'Unable to save notification settings.'
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
        error instanceof Error ? error.message : 'Unable to save the reminder time.'
      );
    } finally {
      setNotificationActionBusy(false);
    }
  };

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.scrollContent}
      style={styles.scrollView}
    >
      <AccountProfileHeader name={expanderName} email={profile?.email} imageUrl={profile?.avatarUrl} />
      <AccountOverviewSection
        name={expanderName}
        email={profile?.email}
        pantryCount={pantries.length}
        memberCount={selectedPantry?.members.length ?? 0}
      />
      <AppearanceSection
        themePreference={themePreference}
        onChangeThemePreference={preference => void setThemePreference?.(preference)}
      />
      <RemindersSection
        notificationPreferences={notificationPreferences}
        notificationsBusy={notificationsBusy}
        reminderTime={reminderTime}
        showAndroidTimePicker={showAndroidTimePicker}
        onOpenAndroidTimePicker={() => setShowAndroidTimePicker(true)}
        onReminderTimeChange={date => {
          setShowAndroidTimePicker(false);
          setReminderTime(date);
        }}
        onSaveReminderTime={() => void saveReminderTime()}
        onToggleCartReminders={enabled => {
          void saveCartReminderSettings(enabled);
        }}
        notificationError={notificationError}
      />
      <AiScanningSection
        profile={profile}
        aiConsentEnabled={aiConsentEnabled}
        onWithdrawAiConsent={() => void withdrawAiConsent()}
      />
      <SupportSection onNavigate={handleNavigate} />
      <AccountActionsSection onNavigate={handleNavigate} onSignOut={handleSignOut} />
    </ScrollView>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18,
  },
});
