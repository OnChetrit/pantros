import { StyleSheet, View } from 'react-native';

import { AppTextInput } from '@/components/ui/primitives';

import { ItemFormFieldLabel } from './item-form-field-label';

type ItemBarcodeFieldProps = {
  barcode: string;
  onChangeBarcode: (value: string) => void;
};

export function ItemBarcodeField({
  barcode,
  onChangeBarcode,
}: ItemBarcodeFieldProps) {
  return (
    <View style={styles.fieldGroup}>
      <ItemFormFieldLabel>Barcode</ItemFormFieldLabel>
      <AppTextInput
        value={barcode}
        onChangeText={onChangeBarcode}
        placeholder=""
        autoCapitalize="none"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldGroup: {
    gap: 6,
  },
});
