import { Stack, useRouter } from 'expo-router';

import { COMPACT_SHEET_DETENT, REVIEW_SHEET_DETENTS, createFormSheetOptions } from '@/components/sheets/sheet-presets/sheet-presets';
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
      <Stack.Screen
        name="sort"
        options={createFormSheetOptions({detents: [COMPACT_SHEET_DETENT], title: 'Sort'})}
      />
      <Stack.Screen
        name="quantity"
        options={createFormSheetOptions({detents: [COMPACT_SHEET_DETENT]})}
      />
      <Stack.Screen
        name="review-expiration"
        options={createFormSheetOptions({detents: REVIEW_SHEET_DETENTS})}
      />
    </Stack>
  );
}
