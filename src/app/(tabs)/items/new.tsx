import {useLocalSearchParams} from 'expo-router';

import {ItemFormScreen} from '@/features/items/item-form-screen/item-form-screen';

export default function NewItemModal() {
  const {barcode, name} = useLocalSearchParams<{barcode?: string | string[]; name?: string | string[]}>();
  const initialBarcode = Array.isArray(barcode) ? barcode[0] : barcode;
  const initialName = Array.isArray(name) ? name[0] : name;

  return <ItemFormScreen initialBarcode={initialBarcode} initialName={initialName} />;
}
