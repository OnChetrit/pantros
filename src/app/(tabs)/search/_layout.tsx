import { Stack } from 'expo-router';

import { useTabStackScreenOptions } from '@/components/navigation/tab-stack-layout';

export default function SearchLayout() {
  const screenOptions = useTabStackScreenOptions({
    title: 'Search + Add',
  });

  return <Stack screenOptions={screenOptions} />;
}
