import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform, Pressable, Switch, Text, View } from 'react-native';

import type { NotificationPreferences } from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';

import { createStyles } from './account-menu-sections.shared';
import { formatReminderTime } from './account-menu.utils';
import { MenuRow } from './menu-row';
import { MenuSection } from './menu-section';

export function RemindersSection({
  notificationPreferences,
  notificationsBusy,
  reminderTime,
  showAndroidTimePicker,
  onOpenAndroidTimePicker,
  onReminderTimeChange,
  onToggleCartReminders,
  notificationError,
}: {
  notificationPreferences: NotificationPreferences | null;
  notificationsBusy: boolean;
  reminderTime: Date;
  showAndroidTimePicker: boolean;
  onOpenAndroidTimePicker: () => void;
  onReminderTimeChange: (value: Date) => void;
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
          <View>
            <Switch
              value={notificationPreferences?.cartRemindersEnabled ?? false}
              disabled={!notificationPreferences || notificationsBusy}
              onValueChange={onToggleCartReminders}
            />
          </View>
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
              style={({pressed}) => [styles.timeButton, pressed ? styles.timeButtonPressed : null]}
            >
              <Text style={styles.timeButtonText}>{formatReminderTime(reminderTime)}</Text>
            </Pressable>
          ) : (
            <DateTimePicker
              value={reminderTime}
              mode="time"
              display="compact"
              disabled={!notificationPreferences || notificationsBusy}
              onValueChange={(_event, date) => {
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
          onValueChange={(_event, date) => {
            if (date) {
              onReminderTimeChange(date);
            }
          }}
        />
      ) : null}
      {notificationError ? <Text style={styles.notificationError}>{notificationError}</Text> : null}
    </MenuSection>
  );
}
