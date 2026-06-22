import { Redirect } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppStackHeader } from '@/components/navigation/app-stack-header';
import {
  AppScreen,
  EmptyNotice,
  ListRow,
  MetricGrid,
  MetricPill,
  SectionCard,
  appColors,
} from '@/components/ui/primitives';
import { countItemsExpiringWithinDays, formatExpirationLabel, getSoonestExpiringItems } from '@/lib/pantry-insights';
import { useAppContext } from '@/state/app-context';

export default function NotificationsScreen() {
  const {
    isAuthenticated,
    notificationPreferences,
    pantryItems,
    selectedPantry,
    status,
  } = useAppContext();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const expiringSoon = getSoonestExpiringItems(pantryItems, 6);
  const expiringToday = countItemsExpiringWithinDays(pantryItems, 0);
  const expiringThisWeek = countItemsExpiringWithinDays(pantryItems, 7);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: appColors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <AppStackHeader title="Notifications" showAccountMenu={false} minimalBackButton />
      <AppScreen>
        <SectionCard
          title="Reminder Center"
          subtitle={`Expiration alerts for ${selectedPantry?.name ?? 'your pantry'}, plus your account-wide cart reminder status.`}
        >
          <MetricGrid>
            <MetricPill value={String(expiringToday)} label="today" tone="warning" />
            <MetricPill value={String(expiringThisWeek)} label="this week" tone="accent" />
            <MetricPill
              value={
                notificationPreferences?.cartRemindersEnabled
                  ? notificationPreferences.cartReminderTime
                  : 'Off'
              }
              label="cart reminder"
            />
          </MetricGrid>
        </SectionCard>

        <SectionCard
          title="Upcoming Alerts"
          subtitle="Expiration entries are derived from current inventory dates. Cart push reminders are managed from Settings."
        >
          {expiringSoon.length === 0 ? (
            <EmptyNotice
              title="No upcoming alerts"
              body="Add items with expiration dates to turn this into a real reminder center."
            />
          ) : (
            <View style={{ gap: 10 }}>
              {expiringSoon.map((item) => (
                <ListRow
                  key={item.id}
                  title={item.name}
                  subtitle={item.isInCart ? 'Already added to cart' : 'Still in pantry'}
                  rightValue={formatExpirationLabel(item.expirationDate)}
                  emphasized={item.isInCart}
                />
              ))}
            </View>
          )}
        </SectionCard>
      </AppScreen>
    </ScrollView>
  );
}
