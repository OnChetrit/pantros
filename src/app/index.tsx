import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import { useAuthState } from '@/state/auth-state';
import { useWorkspaceState } from '@/state/workspace-state';

export default function EntryScreen() {
  const auth = useAuthState();
  const workspace = useWorkspaceState();

  if (auth.status === 'loading' || workspace.status === 'loading') {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: appColors.background,
        }}
      >
        <ActivityIndicator size="large" color={appColors.tint} />
      </View>
    );
  }

  return <Redirect href={auth.isAuthenticated ? '/pantry' : '/login'} />;
}
