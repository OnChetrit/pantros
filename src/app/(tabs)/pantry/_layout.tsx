import { Stack, useRouter } from 'expo-router';

import { useTopLevelStackOptions } from '@/components/navigation/stack-options';
import { useWorkspaceState } from '@/state/workspace-state';

export default function PantryLayout() {
  const {selectedPantry} = useWorkspaceState();
  const router = useRouter();
  const screenOptions = useTopLevelStackOptions({
    title: selectedPantry?.name ?? 'Pantry',
    onAccountPress: () => router.push('/account/menu'),
  });

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: selectedPantry?.name ?? 'Pantry',
        }}
      />
    </Stack>
  );
}
