import { Redirect, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import {
  AppScreen,
  ListRow,
  SectionCard,
  appColors,
} from '@/components/ui/primitives';
import { useAppContext } from '@/state/app-context';

export default function ProfileScreen() {
  const router = useRouter();
  const { isAuthenticated, pantries, profile, selectedPantry, status } = useAppContext();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: appColors.background }}
      contentContainerStyle={{ paddingBottom: 40 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <AppScreen>
        <SectionCard
          title="Account"
          subtitle="Current account details."
          borderless
        >
          <View style={{ gap: 10 }}>
            <ListRow title="Name" subtitle={profile?.fullName ?? 'Pantros User'} borderless />
            <ListRow title="Email" subtitle={profile?.email ?? 'No email available'} borderless />
            <ListRow title="Pantries" subtitle={String(pantries.length)} borderless />
            <ListRow title="Members" subtitle={String(selectedPantry?.members.length ?? 0)} borderless />
          </View>
        </SectionCard>

        <SectionCard
          title="Privacy and Support"
          subtitle="Helpful links and account policy details."
          borderless
        >
          <View style={{ gap: 10 }}>
            <ListRow
              title="Privacy Policy"
              subtitle="Data collection and retention."
              onPress={() => router.push('/legal/privacy')}
              borderless
            />
            <ListRow
              title="Terms of Service"
              subtitle="Shared pantry service terms."
              onPress={() => router.push('/legal/terms')}
              borderless
            />
            <ListRow
              title="Support"
              subtitle="Contact details for app issues."
              onPress={() => router.push('/legal/support')}
              borderless
            />
          </View>
        </SectionCard>
      </AppScreen>
    </ScrollView>
  );
}
