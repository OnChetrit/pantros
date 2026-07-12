import { Stack, useRouter } from 'expo-router';

import {
  COMPACT_SHEET_DETENT,
  REVIEW_SHEET_DETENTS,
  createFormSheetOptions,
} from '@/components/sheets/sheet-presets/sheet-presets';
import { useTopLevelStackOptions } from '@/components/navigation/stack-options';

export default function CartLayout() {
  const router = useRouter();
  const screenOptions = useTopLevelStackOptions({
    title: 'Cart',
    onAccountPress: () => router.push('/account/menu'),
  });

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Cart',
        }}
      />
      <Stack.Screen
        name="sort"
        options={createFormSheetOptions({detents: [COMPACT_SHEET_DETENT], title: 'Sort'})}
      />
      <Stack.Screen
        name="review-expiration"
        options={createFormSheetOptions({detents: REVIEW_SHEET_DETENTS, title: 'Expiration'})}
      />
      <Stack.Screen
        name="quantity"
        options={createFormSheetOptions({detents: [COMPACT_SHEET_DETENT]})}
      />
    </Stack>
  );
}
