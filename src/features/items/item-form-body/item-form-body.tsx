import { ScrollView, View } from 'react-native';

import { EmptyNotice } from '@/components/ui/primitives';
import type { PantryItem } from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';

import { ItemExpirationField } from '../item-expiration-field/item-expiration-field';
import { createStyles } from '../item-form-screen/item-form-screen.styles';
import { ItemBarcodeField } from '../item-form/item-barcode-field';
import { ItemCartSection } from '../item-cart-section/item-cart-section';
import { ItemImagePicker } from '../item-form/item-image-picker';
import { ItemNameField } from '../item-form/item-name-field';

export function ItemFormBody({
  barcode,
  duplicateCandidates,
  exactDuplicate,
  expirationDate,
  formError,
  image,
  isInCart,
  name,
  onChangeBarcode,
  onChangeExpirationDate,
  onChangeIsInCart,
  onChangeName,
  onChangeQuantity,
  onOpenBarcodeScanner,
  onOpenImageSourcePicker,
  onSelectDuplicate,
  parsedQuantity,
  selectedPantry,
}: {
  barcode: string;
  duplicateCandidates: PantryItem[];
  exactDuplicate: PantryItem | null;
  expirationDate: string;
  formError: string | null;
  image: string;
  isInCart: boolean;
  name: string;
  onChangeBarcode: (value: string) => void;
  onChangeExpirationDate: (value: string) => void;
  onChangeIsInCart: (value: boolean) => void;
  onChangeName: (value: string) => void;
  onChangeQuantity: (value: number) => void;
  onOpenBarcodeScanner: () => void;
  onOpenImageSourcePicker: () => void;
  onSelectDuplicate: (candidateId: string) => void;
  parsedQuantity: number | null;
  selectedPantry: unknown;
}) {
  const styles = useThemedStyles(createStyles);
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
      contentInsetAdjustmentBehavior="automatic"
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.heroRow}>
        <ItemImagePicker image={image} onPress={onOpenImageSourcePicker} />
      </View>

      {!selectedPantry ? (
        <EmptyNotice
          title="No pantry selected"
          body="Items belong to a pantry workspace. Select or create a pantry before adding inventory."
        />
      ) : null}

      <View style={styles.card}>
        <ItemNameField
          name={name}
          duplicateCandidates={duplicateCandidates}
          exactDuplicateId={exactDuplicate?.id}
          onChangeName={onChangeName}
          onSelectDuplicate={onSelectDuplicate}
        />
        <ItemBarcodeField barcode={barcode} onChangeBarcode={onChangeBarcode} onOpenScanner={onOpenBarcodeScanner} />
        <ItemCartSection
          isInCart={isInCart}
          quantity={parsedQuantity ?? 1}
          onToggle={onChangeIsInCart}
          onChangeQuantity={onChangeQuantity}
        />
      </View>

      <ItemExpirationField value={expirationDate} onChange={onChangeExpirationDate} />

      {formError ? <EmptyNotice title="Could not save item" body={formError} /> : null}
    </ScrollView>
  );
}
