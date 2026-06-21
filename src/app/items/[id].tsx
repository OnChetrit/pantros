import { Redirect, useLocalSearchParams } from 'expo-router';

import { EmptyNotice } from '@/components/ui/primitives';
import { ItemFormScreen } from '@/features/items/item-form-screen';
import { useAppContext } from '@/state/app-context';

export default function EditItemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { isAuthenticated, items, status } = useAppContext();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  const item = items.find((entry) => entry.id === id);

  if (!item) {
    return (
      <EmptyNotice
        title="Item not found"
        body="The item is not present in the loaded workspace state. Refresh the app and try again."
      />
    );
  }

  return <ItemFormScreen item={item} />;
}
