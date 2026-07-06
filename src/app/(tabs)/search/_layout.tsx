import { Stack, useRouter } from 'expo-router';

import { useTopLevelStackOptions } from '@/app/stack-options';

export default function SearchLayout() {
  const router = useRouter();
  const screenOptions = useTopLevelStackOptions({
    title: 'Search + Add',
    onAccountPress: () => router.push('/account/menu'),
  });

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Search + Add',
        }}
      />
    </Stack>
  );
}
