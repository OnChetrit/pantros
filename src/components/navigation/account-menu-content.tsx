import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { AvatarBadge } from '@/components/ui/primitives';
import {
  AI_CONSENT_VERSION,
  formatAiConsentDate,
  hasActiveAiConsent,
} from '@/lib/ai-consent';
import { appColors, useAppTheme } from '@/lib/theme';
import {
  getDeviceTimeZone,
  registerForPushNotifications,
} from '@/services/supabase/notification-service';
import { useAppContext } from '@/state/app-context';

export type AccountMenuDestination =
  | 'delete'
  | 'privacy'
  | 'support'
  | 'terms';

const destinationHrefMap: Record<AccountMenuDestination, '/account/delete' | '/legal/privacy' | '/legal/support' | '/legal/terms'> = {
  delete: '/account/delete',
  privacy: '/legal/privacy',
  support: '/legal/support',
  terms: '/legal/terms',
};

type MenuSectionProps = {
  title: string;
  children: ReactNode;
};

type MenuRowProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightSlot?: ReactNode;
  danger?: boolean;
  hideDivider?: boolean;
};

function parseReminderTime(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  const date = new Date();
  date.setHours(hours || 0, minutes || 0, 0, 0);
  return date;
}

function formatReminderTime(value: Date) {
  return `${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
}

function MenuSection({ title, children }: MenuSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.sectionCard}>{children}</View>
    </View>
  );
}

function MenuRow({
  icon,
  label,
  value,
  onPress,
  rightSlot,
  danger = false,
  hideDivider = false,
}: MenuRowProps) {
  const content = (
    <View style={[styles.menuRow, hideDivider ? null : styles.menuRowDivider]}>
      <View style={styles.menuRowLead}>
        <Ionicons
          name={icon}
          size={20}
          color={danger ? appColors.danger : appColors.text}
          style={styles.menuRowIcon}
        />
        <Text style={[styles.menuRowLabel, danger ? styles.menuRowLabelDanger : null]}>
          {label}
        </Text>
      </View>

      {rightSlot ?? (
        <View style={styles.menuRowTrail}>
          {value ? <Text style={styles.menuRowValue}>{value}</Text> : null}
          {onPress ? <Ionicons name="chevron-forward" size={18} color={appColors.muted} /> : null}
        </View>
      )}
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed ? styles.menuRowPressed : null]}>
        {content}
      </Pressable>
    );
  }

  return content;
}

export function AccountMenuContent({
  onNavigate,
}: {
  onNavigate?: (destination: AccountMenuDestination) => void;
}) {
  const router = useRouter();
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
      <View style={styles.profileHeader}>
        <AvatarBadge
          name={expanderName}
          imageUrl={profile?.avatarUrl}
          size={92}
          style={styles.profileAvatar}
        />
        <Text style={styles.profileName}>{expanderName}</Text>
        {profile?.email ? <Text style={styles.profileEmail}>{profile.email}</Text> : null}
      </View>

      <MenuSection title="Account">
        <MenuRow icon="person-outline" label="Name" value={expanderName} />
        <MenuRow icon="mail-outline" label="Email" value={profile?.email ?? 'No email available'} />
        <MenuRow icon="albums-outline" label="Pantries" value={String(pantries.length)} />
        <MenuRow
          icon="people-outline"
          label="Members"
          value={String(selectedPantry?.members.length ?? 0)}
          hideDivider
        />
      </MenuSection>

      <MenuSection title="Appearance">
        <View style={styles.themeSwitch}>
          <Pressable
            onPress={() => void setThemePreference?.('device')}
            style={({ pressed }) => [
              styles.themeChip,
              themePreference === 'device' ? styles.themeChipActive : null,
              pressed ? styles.themeChipPressed : null,
            ]}
          >
            <Text
              style={[
                styles.themeChipText,
                themePreference === 'device' ? styles.themeChipTextActive : null,
              ]}
            >
              Device
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void setThemePreference?.('light')}
            style={({ pressed }) => [
              styles.themeChip,
              themePreference === 'light' ? styles.themeChipActive : null,
              pressed ? styles.themeChipPressed : null,
            ]}
          >
            <Text
              style={[
                styles.themeChipText,
                themePreference === 'light' ? styles.themeChipTextActive : null,
              ]}
            >
              Light
            </Text>
          </Pressable>
          <Pressable
            onPress={() => void setThemePreference?.('dark')}
            style={({ pressed }) => [
              styles.themeChip,
              themePreference === 'dark' ? styles.themeChipActive : null,
              pressed ? styles.themeChipPressed : null,
            ]}
          >
            <Text
              style={[
                styles.themeChipText,
                themePreference === 'dark' ? styles.themeChipTextActive : null,
              ]}
            >
              Dark
            </Text>
          </Pressable>
        </View>
      </MenuSection>

      <MenuSection title="Reminders">
        <MenuRow
          icon="notifications-outline"
          label="Cart reminders"
          rightSlot={
            <Switch
              value={notificationPreferences?.cartRemindersEnabled ?? false}
              disabled={!notificationPreferences || notificationsBusy}
              onValueChange={(enabled) => {
                void saveCartReminderSettings(enabled);
              }}
            />
          }
        />
        <MenuRow
          icon="time-outline"
          label="Reminder time"
          rightSlot={
            Platform.OS === 'android' ? (
              <Pressable
                disabled={!notificationPreferences || notificationsBusy}
                onPress={() => setShowAndroidTimePicker(true)}
                style={({ pressed }) => [styles.timeButton, pressed ? styles.timeButtonPressed : null]}
              >
                <Text style={styles.timeButtonText}>{formatReminderTime(reminderTime)}</Text>
              </Pressable>
            ) : (
              <DateTimePicker
                value={reminderTime}
                mode="time"
                display="compact"
                disabled={!notificationPreferences || notificationsBusy}
                onChange={(_event, date) => {
                  if (date) {
                    setReminderTime(date);
                  }
                }}
              />
            )
          }
          hideDivider
        />
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
        <Pressable
          disabled={!notificationPreferences || notificationsBusy}
          onPress={() => void saveReminderTime()}
          style={({ pressed }) => [
            styles.inlineActionButton,
            pressed || !notificationPreferences || notificationsBusy
              ? styles.inlineActionButtonPressed
              : null,
          ]}
        >
          <Text style={styles.inlineActionButtonText}>
            {notificationsBusy ? 'Saving…' : 'Save reminder time'}
          </Text>
        </Pressable>
        {notificationError ? <Text style={styles.notificationError}>{notificationError}</Text> : null}
      </MenuSection>

      <MenuSection title="AI Scanning">
        <MenuRow
          icon="sparkles-outline"
          label="Consent"
          value={
            aiConsentEnabled
              ? `Accepted ${formatAiConsentDate(profile?.aiConsentGrantedAt ?? null)}`
              : 'Not enabled'
          }
        />
        <MenuRow
          icon="keypad-outline"
          label="Version"
          value={profile?.aiConsentVersion ?? AI_CONSENT_VERSION}
          hideDivider
        />
        {aiConsentEnabled ? (
          <Pressable
            onPress={() => void withdrawAiConsent()}
            style={({ pressed }) => [
              styles.inlineActionButton,
              styles.inlineDangerButton,
              pressed ? styles.inlineActionButtonPressed : null,
            ]}
          >
            <Text style={[styles.inlineActionButtonText, styles.inlineDangerButtonText]}>
              Withdraw AI Consent
            </Text>
          </Pressable>
        ) : null}
      </MenuSection>

      <MenuSection title="Support">
        <MenuRow icon="shield-outline" label="Privacy Policy" onPress={() => handleNavigate('privacy')} />
        <MenuRow
          icon="document-text-outline"
          label="Terms of Service"
          onPress={() => handleNavigate('terms')}
        />
        <MenuRow
          icon="help-buoy-outline"
          label="Contact Support"
          onPress={() => handleNavigate('support')}
          hideDivider
        />
      </MenuSection>

      <MenuSection title="Account Actions">
        <MenuRow
          icon="trash-outline"
          label="Delete Account"
          onPress={() => handleNavigate('delete')}
          danger
        />
        <MenuRow icon="log-out-outline" label="Sign Out" onPress={handleSignOut} danger hideDivider />
      </MenuSection>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
    gap: 18,
  },
  profileHeader: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 6,
    paddingBottom: 10,
  },
  profileAvatar: {
    shadowColor: appColors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  profileName: {
    color: appColors.text,
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
  },
  profileEmail: {
    color: appColors.muted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    color: appColors.muted,
    fontSize: 13,
    fontWeight: '700',
    paddingHorizontal: 4,
  },
  sectionCard: {
    borderRadius: 26,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
    paddingHorizontal: 18,
    paddingVertical: 2,
  },
  menuRow: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
  },
  menuRowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appColors.borderStrong,
  },
  menuRowPressed: {
    opacity: 0.76,
  },
  menuRowLead: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  menuRowIcon: {
    width: 22,
    textAlign: 'center',
  },
  menuRowLabel: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '600',
  },
  menuRowLabelDanger: {
    color: appColors.danger,
  },
  menuRowTrail: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    flexShrink: 1,
  },
  menuRowValue: {
    color: appColors.muted,
    fontSize: 15,
    textAlign: 'right',
    flexShrink: 1,
  },
  themeSwitch: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  themeChip: {
    flex: 1,
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.input,
  },
  themeChipActive: {
    backgroundColor: appColors.tint,
  },
  themeChipPressed: {
    opacity: 0.8,
  },
  themeChipText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  themeChipTextActive: {
    color: appColors.textInverse,
  },
  timeButton: {
    minWidth: 84,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: appColors.input,
  },
  timeButtonPressed: {
    opacity: 0.76,
  },
  timeButtonText: {
    color: appColors.tint,
    fontSize: 15,
    fontWeight: '700',
  },
  inlineActionButton: {
    marginTop: 14,
    minHeight: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.tintSoft,
  },
  inlineDangerButton: {
    backgroundColor: appColors.dangerSoft,
  },
  inlineActionButtonPressed: {
    opacity: 0.76,
  },
  inlineActionButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  inlineDangerButtonText: {
    color: appColors.danger,
  },
  notificationError: {
    marginTop: 10,
    color: appColors.danger,
    fontSize: 13,
    lineHeight: 18,
  },
});
