import { Picker } from '@react-native-picker/picker';
import { Redirect } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { AppStackHeader } from '@/components/navigation/app-stack-header';
import {
  AppButton,
  AppScreen,
  ListRow,
  SectionCard,
  appColors,
} from '@/components/ui/primitives';
import { useAppContext } from '@/state/app-context';

export default function SettingsScreen() {
  const {
    errorMessage,
    isAuthenticated,
    pantries,
    profile,
    refreshAppState,
    selectedPantry,
    selectedPantryId,
    selectPantry,
    signOut,
    status,
  } = useAppContext();

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
      <AppStackHeader title="Settings" showAccountMenu={false} minimalBackButton />
      <AppScreen>
        <SectionCard
          title="Workspace Scope"
          subtitle="Pantry selection belongs to the shared app state, so switching workspaces here updates every feature surface."
        >
          <View style={styles.pickerField}>
            <Picker
              selectedValue={selectedPantryId}
              onValueChange={(value) => {
                if (typeof value === 'string' && value) {
                  selectPantry(value);
                }
              }}
              enabled={pantries.length > 0}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              dropdownIconColor={String(appColors.tint)}
            >
              {pantries.length === 0 ? <Picker.Item label="No pantry loaded" value="" /> : null}
              {pantries.map((pantry) => (
                <Picker.Item key={pantry.id} label={pantry.name} value={pantry.id} />
              ))}
            </Picker>
          </View>

          <View style={{ gap: 10 }}>
            <ListRow title="Selected pantry" subtitle={selectedPantry?.name ?? 'None selected'} />
            <ListRow title="Reminder time" subtitle={selectedPantry?.settings.reminderTime ?? 'Not configured'} />
            <ListRow title="Share code" subtitle={selectedPantry?.shareCode ?? 'Not generated'} />
          </View>
        </SectionCard>

        <SectionCard
          title="Application State"
          subtitle="Manual controls for the current bootstrap and session lifecycle while the feature set is still expanding."
        >
          <View style={{ gap: 10 }}>
            <ListRow title="Profile" subtitle={profile?.email ?? 'Not authenticated'} />
            <ListRow title="Last app message" subtitle={errorMessage ?? 'No errors'} />
          </View>

          <AppButton label="Refresh App State" onPress={() => void refreshAppState()} variant="secondary" />
          <AppButton label="Sign Out" onPress={() => void signOut()} />
        </SectionCard>
      </AppScreen>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  pickerField: {
    minHeight: 52,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
    justifyContent: 'center',
  },
  picker: {
    color: appColors.text,
    backgroundColor: 'transparent',
  },
  pickerItem: {
    color: appColors.text,
    fontSize: 16,
  },
});
