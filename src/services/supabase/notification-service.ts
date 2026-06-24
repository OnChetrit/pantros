import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { NotificationPreferences } from '@/domain/models';

import { supabase } from './client';

const STORED_EXPO_PUSH_TOKEN_KEY = 'pantry.expoPushToken';
const DEFAULT_REMINDER_TIME = '18:00';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

function mapPreferences(row: Record<string, any>): NotificationPreferences {
  return {
    userId: row.user_id,
    cartRemindersEnabled: row.cart_reminders_enabled,
    cartReminderTime: String(row.cart_reminder_time).slice(0, 5),
    timeZone: row.time_zone,
  };
}

export function getDeviceTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

export async function fetchNotificationPreferences(userId: string) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .select('user_id, cart_reminders_enabled, cart_reminder_time, time_zone')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return mapPreferences(data);
  }

  const { data: created, error: createError } = await supabase
    .from('notification_preferences')
    .insert({
      user_id: userId,
      cart_reminders_enabled: false,
      cart_reminder_time: DEFAULT_REMINDER_TIME,
      time_zone: getDeviceTimeZone(),
    })
    .select('user_id, cart_reminders_enabled, cart_reminder_time, time_zone')
    .single();

  if (createError) {
    if (createError.code === '23505') {
      const { data: existing, error: refetchError } = await supabase
        .from('notification_preferences')
        .select('user_id, cart_reminders_enabled, cart_reminder_time, time_zone')
        .eq('user_id', userId)
        .single();

      if (refetchError) {
        throw refetchError;
      }

      return mapPreferences(existing);
    }

    throw createError;
  }

  return mapPreferences(created);
}

export async function updateNotificationPreferences(
  preferences: NotificationPreferences
) {
  const { data, error } = await supabase
    .from('notification_preferences')
    .update({
      cart_reminders_enabled: preferences.cartRemindersEnabled,
      cart_reminder_time: preferences.cartReminderTime,
      time_zone: preferences.timeZone,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', preferences.userId)
    .select('user_id, cart_reminders_enabled, cart_reminder_time, time_zone')
    .single();

  if (error) {
    throw error;
  }

  return mapPreferences(data);
}

function getExpoProjectId() {
  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId;

  if (!projectId) {
    throw new Error('The EAS project ID is missing from the Expo configuration.');
  }

  return String(projectId);
}

async function createAndroidNotificationChannel() {
  if (Platform.OS !== 'android') {
    return;
  }

  await Notifications.setNotificationChannelAsync('cart-reminders', {
    name: 'Cart reminders',
    description: 'Reminders about items waiting in your pantry carts.',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
    vibrationPattern: [0, 250, 250, 250],
  });
}

export async function registerForPushNotifications(requestPermission: boolean) {
  if (Platform.OS === 'web') {
    throw new Error('Push notifications are only available in the iOS and Android apps.');
  }

  if (!Device.isDevice) {
    throw new Error('Push notifications require a physical device.');
  }

  await createAndroidNotificationChannel();

  const existingPermission = await Notifications.getPermissionsAsync();
  let finalStatus = existingPermission.status;

  if (finalStatus !== 'granted' && requestPermission) {
    const requestedPermission = await Notifications.requestPermissionsAsync();
    finalStatus = requestedPermission.status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  const expoPushToken = (
    await Notifications.getExpoPushTokenAsync({
      projectId: getExpoProjectId(),
    })
  ).data;

  const { error } = await supabase.rpc('register_push_token', {
    p_expo_push_token: expoPushToken,
    p_platform: Platform.OS,
  });

  if (error) {
    throw error;
  }

  await AsyncStorage.setItem(STORED_EXPO_PUSH_TOKEN_KEY, expoPushToken);
  return expoPushToken;
}

export async function syncPushTokenIfPermitted() {
  try {
    return await registerForPushNotifications(false);
  } catch (error) {
    console.warn('Unable to refresh the push token.', error);
    return null;
  }
}

export async function unregisterCurrentPushToken() {
  const expoPushToken = await AsyncStorage.getItem(STORED_EXPO_PUSH_TOKEN_KEY);

  if (!expoPushToken) {
    return;
  }

  const { error } = await supabase.rpc('unregister_push_token', {
    p_expo_push_token: expoPushToken,
  });

  if (error) {
    throw error;
  }

  await AsyncStorage.removeItem(STORED_EXPO_PUSH_TOKEN_KEY);
}

export async function clearStoredPushToken() {
  await AsyncStorage.removeItem(STORED_EXPO_PUSH_TOKEN_KEY);
}
