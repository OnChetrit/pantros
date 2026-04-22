import { Redirect } from 'expo-router';

import { ItemFormScreen } from '@/features/items/item-form-screen';
import { useAppContext } from '@/state/app-context';

export default function NewItemModal() {
  const { isAuthenticated, status } = useAppContext();

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <ItemFormScreen />;
}
