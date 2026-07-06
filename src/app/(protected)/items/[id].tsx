import { useLocalSearchParams } from 'expo-router';

import { EmptyNotice } from '@/components/ui/primitives';
import { ItemFormScreen } from '@/features/items/item-form-screen/item-form-screen';
import { useWorkspaceState } from '@/state/workspace-state';

export default function EditItemScreen() {
  const {id} = useLocalSearchParams<{id: string}>();
  const {items} = useWorkspaceState();
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
