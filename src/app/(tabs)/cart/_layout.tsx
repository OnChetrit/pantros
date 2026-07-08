import { Stack, useRouter } from 'expo-router';

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
    </Stack>
  );
}
