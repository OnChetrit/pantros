import { useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { AppScreen, ListRow, SectionCard, appColors } from '@/components/ui/primitives';
import { useWorkspaceState } from '@/state/workspace-state';

export default function ProfileScreen() {
  const router = useRouter();
  const {pantries, profile, selectedPantry} = useWorkspaceState();

  return (
    <ScrollView
      style={{flex: 1, backgroundColor: appColors.background}}
      contentContainerStyle={{paddingBottom: 40}}
      contentInsetAdjustmentBehavior="automatic"
    >
      <AppScreen>
        <SectionCard title="Account" subtitle="Current account details.">
          <View style={{gap: 10}}>
            <ListRow title="Name" subtitle={profile?.fullName ?? 'Pantros User'} />
            <ListRow title="Email" subtitle={profile?.email ?? 'No email available'} />
            <ListRow title="Pantries" subtitle={String(pantries.length)} />
            <ListRow title="Members" subtitle={String(selectedPantry?.members.length ?? 0)} />
          </View>
        </SectionCard>

        <SectionCard title="Privacy and Support" subtitle="Helpful links and account policy details.">
          <View style={{gap: 10}}>
            <ListRow
              title="Privacy Policy"
              subtitle="Data collection and retention."
              onPress={() => router.push('/legal/privacy')}
            />
            <ListRow
              title="Terms of Service"
              subtitle="Shared pantry service terms."
              onPress={() => router.push('/legal/terms')}
            />
            <ListRow
              title="Support"
              subtitle="Contact details for app issues."
              onPress={() => router.push('/legal/support')}
            />
          </View>
        </SectionCard>
      </AppScreen>
    </ScrollView>
  );
}
