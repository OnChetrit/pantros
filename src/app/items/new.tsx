import { Redirect, useLocalSearchParams } from 'expo-router';

import { ItemFormScreen } from '@/features/items/item-form-screen';
import { useAppContext } from '@/state/app-context';

export default function NewItemModal() {
  const { barcode, name } = useLocalSearchParams<{ barcode?: string | string[]; name?: string | string[] }>();
  const { isAuthenticated, status } = useAppContext();
  const initialBarcode = Array.isArray(barcode) ? barcode[0] : barcode;
  const initialName = Array.isArray(name) ? name[0] : name;

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return <ItemFormScreen initialBarcode={initialBarcode} initialName={initialName} />;
}
