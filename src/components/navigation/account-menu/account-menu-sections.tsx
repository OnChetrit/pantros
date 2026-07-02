import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable, StyleSheet, Switch, Text } from 'react-native';

import type { NotificationPreferences } from '@/domain/models';
import type { ThemePreference } from '@/lib/theme';
import { useThemedStyles } from '@/lib/theme';

import type { AccountMenuDestination } from './account-menu.types';
import { formatReminderTime } from './account-menu.utils';
import { MenuRow } from './menu-row';
import { MenuSection } from './menu-section';
import { ThemePreferenceSelector } from './theme-preference-selector';

export function AccountOverviewSection({
  name,
  email,
  pantryCount,
  memberCount,
}: {
  name: string;
  email?: string | null;
  pantryCount: number;
  memberCount: number;
}) {
  return (
    <MenuSection title="Account">
      <MenuRow icon="person-outline" label="Name" value={name} />
      <MenuRow icon="mail-outline" label="Email" value={email ?? 'No email available'} />
      <MenuRow icon="albums-outline" label="Pantries" value={String(pantryCount)} />
      <MenuRow icon="people-outline" label="Members" value={String(memberCount)} hideDivider />
    </MenuSection>
  );
}

export function AppearanceSection({
  themePreference,
  onChangeThemePreference,
}: {
  themePreference: ThemePreference;
  onChangeThemePreference: (preference: ThemePreference) => void;
}) {
  return (
    <MenuSection title="Appearance">
      <ThemePreferenceSelector value={themePreference} onChange={onChangeThemePreference} />
    </MenuSection>
  );
}

export function RemindersSection({
  notificationPreferences,
  notificationsBusy,
  reminderTime,
  showAndroidTimePicker,
  onOpenAndroidTimePicker,
  onReminderTimeChange,
  onSaveReminderTime,
  onToggleCartReminders,
  notificationError,
}: {
  notificationPreferences: NotificationPreferences | null;
  notificationsBusy: boolean;
  reminderTime: Date;
  showAndroidTimePicker: boolean;
  onOpenAndroidTimePicker: () => void;
  onReminderTimeChange: (value: Date) => void;
  onSaveReminderTime: () => void;
  onToggleCartReminders: (enabled: boolean) => void;
  notificationError: string | null;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <MenuSection title="Reminders">
      <MenuRow
        icon="notifications-outline"
        label="Cart reminders"
        rightSlot={
          <Switch
            value={notificationPreferences?.cartRemindersEnabled ?? false}
            disabled={!notificationPreferences || notificationsBusy}
            onValueChange={onToggleCartReminders}
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
              onPress={onOpenAndroidTimePicker}
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
                  onReminderTimeChange(date);
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
            if (date) {
              onReminderTimeChange(date);
            }
          }}
        />
      ) : null}
      <Pressable
        disabled={!notificationPreferences || notificationsBusy}
        onPress={onSaveReminderTime}
        style={({ pressed }) => [
          styles.inlineActionButton,
          pressed || !notificationPreferences || notificationsBusy ? styles.inlineActionButtonPressed : null,
        ]}
      >
        <Text style={styles.inlineActionButtonText}>
          {notificationsBusy ? 'Saving…' : 'Save reminder time'}
        </Text>
      </Pressable>
      {notificationError ? <Text style={styles.notificationError}>{notificationError}</Text> : null}
    </MenuSection>
  );
}

export function SupportSection({
  onNavigate,
}: {
  onNavigate: (destination: AccountMenuDestination) => void;
}) {
  return (
    <MenuSection title="Support">
      <MenuRow icon="shield-outline" label="Privacy Policy" onPress={() => onNavigate('privacy')} />
      <MenuRow icon="document-text-outline" label="Terms of Service" onPress={() => onNavigate('terms')} />
      <MenuRow icon="help-buoy-outline" label="Contact Support" onPress={() => onNavigate('support')} hideDivider />
    </MenuSection>
  );
}

export function AccountActionsSection({
  onNavigate,
  onSignOut,
}: {
  onNavigate: (destination: AccountMenuDestination) => void;
  onSignOut: () => void;
}) {
  return (
    <MenuSection title="Account Actions">
      <MenuRow icon="trash-outline" label="Delete Account" onPress={() => onNavigate('delete')} danger />
      <MenuRow icon="log-out-outline" label="Sign Out" onPress={onSignOut} danger hideDivider />
    </MenuSection>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    timeButton: {
      minWidth: 84,
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 9,
      alignItems: 'center',
      backgroundColor: colors.input,
    },
    timeButtonPressed: {
      opacity: 0.76,
    },
    timeButtonText: {
      color: colors.tint,
      fontSize: 15,
      fontWeight: '700',
    },
    inlineActionButton: {
      marginTop: 14,
      minHeight: 44,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tintSoft,
    },
    inlineActionButtonPressed: {
      opacity: 0.76,
    },
    inlineActionButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '700',
    },
    notificationError: {
      marginTop: 10,
      color: colors.danger,
      fontSize: 13,
      lineHeight: 18,
    },
  });
