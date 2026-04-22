import { Redirect } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { AppStackHeader } from '@/components/navigation/app-stack-header';
import {
  AppScreen,
  ListRow,
  MetricGrid,
  MetricPill,
  SectionCard,
  appColors,
} from '@/components/ui/primitives';
import { useAppContext } from '@/state/app-context';

export default function ProfileScreen() {
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
      <AppStackHeader title="Profile" showAccountMenu={false} minimalBackButton />
      <AppScreen>
        <SectionCard
          title="Account"
          subtitle="Profile data is still bootstrapped from Supabase and surfaced through the main app context."
        >
          <View style={{ gap: 4 }}>
            <Text style={{ fontSize: 24, fontWeight: '800', color: appColors.text }}>
              {profile?.fullName ?? 'Pantry User'}
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 21, color: appColors.muted }}>
              {profile?.email ?? 'No email available'}
            </Text>
          </View>

          <MetricGrid>
            <MetricPill value={String(pantries.length)} label="pantries" />
            <MetricPill value={String(selectedPantry?.members.length ?? 0)} label="team members" tone="accent" />
          </MetricGrid>
        </SectionCard>

        <SectionCard
          title="Workspace Snapshot"
          subtitle="These values come directly from the current authenticated scope."
        >
          <View style={{ gap: 10 }}>
            <ListRow title="Selected pantry" subtitle={selectedPantry?.name ?? 'None selected'} />
            <ListRow title="Account created" subtitle={profile?.createdAt ?? 'Unknown'} />
            <ListRow title="Profile image" subtitle={profile?.avatarUrl ?? 'No uploaded avatar'} />
          </View>
        </SectionCard>
      </AppScreen>
    </ScrollView>
  );
}
