import { Stack, useRouter } from 'expo-router';

import { useTopLevelStackOptions } from '@/components/navigation/stack-options';

export default function SearchLayout() {
  const router = useRouter();
  const screenOptions = useTopLevelStackOptions({
          title: 'Explore',
    onAccountPress: () => router.push('/account/menu'),
  });

  return (
    <Stack screenOptions={screenOptions}>
      <Stack.Screen
        name="index"
        options={{
          title: 'Explore',
          headerSearchBarOptions: {
            placeholder: 'Search by name or barcode',
            autoCapitalize: 'none',
            hideWhenScrolling: false,
            placement: 'automatic',
            autoFocus: true,
            onChangeText: event => {
              const text = event.nativeEvent.text;
              router.setParams({
                q: text.length > 0 ? text : undefined,
                entry: undefined,
                nonce: undefined,
              });
            },
            onCancelButtonPress: () => {
              router.setParams({
                q: undefined,
                entry: undefined,
                nonce: undefined,
              });
            },
          },
        }}
      />
    </Stack>
  );
}
