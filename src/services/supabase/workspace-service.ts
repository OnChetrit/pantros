import type { User } from '@supabase/supabase-js';
import type { Cart, Pantry, PantryMember, ReminderSettings, WorkspaceBundle } from '@/domain/models';

import { ensureUserProfile } from './auth-service';
import { supabase } from './client';
import { mapItem } from './item-service';

function createDefaultSettings(): ReminderSettings {
  return {
    expirationRemindersEnabled: true,
    reminderTime: '09:00',
    reminderDaysBefore: 3,
    lowStockAlertsEnabled: false,
    lowStockThreshold: 2,
    defaultExpirationDays: null,
  };
}

function mapCart(row: Record<string, any>): Cart {
  return {
    id: row.id,
    pantryId: row.pantry_id,
    name: row.name,
    isPrimary: row.is_primary,
    createdAt: row.created_at,
  };
}

export async function fetchWorkspaceBundle(user: User): Promise<WorkspaceBundle> {
  const profile = await ensureUserProfile(user);
  const userId = user.id;

  const { data: membershipRows, error: membershipError } = await supabase
    .from('pantry_members')
    .select('pantry_id')
    .eq('user_id', userId);

  if (membershipError) {
    throw membershipError;
  }

  const pantryIds = membershipRows?.map((row) => row.pantry_id) ?? [];

  if (pantryIds.length === 0) {
    return {
      profile,
      pantries: [],
      items: [],
      carts: [],
    };
  }

  const { data: pantryRows, error: pantryError } = await supabase
    .from('pantries')
    .select(`
      id,
      name,
      owner_id,
      share_code,
      created_at,
      pantry_settings (
        expiration_reminders_enabled,
        reminder_time,
        reminder_days_before,
        low_stock_alerts_enabled,
        low_stock_threshold,
        default_expiration_days
      ),
      pantry_members (
        user_id,
        role,
        joined_at
      )
    `)
    .in('id', pantryIds)
    .order('created_at', { ascending: true });

  if (pantryError) {
    throw pantryError;
  }

  const memberIds = new Set<string>();

  (pantryRows ?? []).forEach((pantry) => {
    (pantry.pantry_members ?? []).forEach((member: Record<string, any>) => {
      memberIds.add(member.user_id);
    });
  });

  const { data: profileRows, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name')
    .in('id', [...memberIds]);

  if (profileError) {
    throw profileError;
  }

  const profileMap = new Map<string, { email: string; fullName: string | null }>();

  (profileRows ?? []).forEach((row) => {
    profileMap.set(row.id, {
      email: row.email,
      fullName: row.full_name,
    });
  });

  const pantries: Pantry[] = (pantryRows ?? []).map((row) => {
    const members: PantryMember[] = (row.pantry_members ?? []).map((member: Record<string, any>) => {
      const mappedProfile = profileMap.get(member.user_id);

      return {
        userId: member.user_id,
        name: mappedProfile?.fullName ?? 'Unknown',
        email: mappedProfile?.email ?? '',
        role: member.role,
        joinedAt: member.joined_at,
      };
    });

    const settingsRow = row.pantry_settings?.[0];

    return {
      id: row.id,
      name: row.name,
      ownerId: row.owner_id,
      shareCode: row.share_code,
      createdAt: row.created_at,
      members,
      settings: settingsRow
        ? {
            expirationRemindersEnabled: settingsRow.expiration_reminders_enabled,
            reminderTime: settingsRow.reminder_time,
            reminderDaysBefore: settingsRow.reminder_days_before,
            lowStockAlertsEnabled: settingsRow.low_stock_alerts_enabled,
            lowStockThreshold: settingsRow.low_stock_threshold,
            defaultExpirationDays: settingsRow.default_expiration_days,
          }
        : createDefaultSettings(),
    };
  });

  const [{ data: itemRows, error: itemError }, { data: cartRows, error: cartError }] = await Promise.all([
    supabase.from('items').select('*').in('pantry_id', pantryIds).order('created_at', { ascending: false }),
    supabase.from('carts').select('*').in('pantry_id', pantryIds).order('created_at', { ascending: true }),
  ]);

  if (itemError) {
    throw itemError;
  }

  if (cartError) {
    throw cartError;
  }

  return {
    profile,
    pantries,
    items: (itemRows ?? []).map((row) => mapItem(row)),
    carts: (cartRows ?? []).map((row) => mapCart(row)),
  };
}
