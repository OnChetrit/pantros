import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import { useAppContext } from '@/state/app-context';

export default function EntryScreen() {
  const { status, isAuthenticated } = useAppContext();

  if (status === 'idle' || status === 'loading') {
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

  return <Redirect href={isAuthenticated ? '/pantry' : '/login'} />;
}
