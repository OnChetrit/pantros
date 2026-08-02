import { Stack } from 'expo-router';
import { KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

import {
  ItemFormBody,
  type ItemFormScreenProps,
  useItemFormController,
} from './item-form-screen.shared';

export function ItemFormScreen(props: ItemFormScreenProps) {
  const styles = useThemedStyles(createStyles);
  const controller = useItemFormController(props);
  const disabled = controller.itemBusy || (Boolean(controller.selectedPantry) && !controller.canSave);

  return (
    <>
      <Stack.Screen options={{headerShown: false}} />
      <SafeAreaView edges={['top', 'bottom']} style={styles.screen}>
        <KeyboardAvoidingView style={styles.content}>
          <ItemFormBody
            barcode={controller.barcode}
            duplicateCandidates={controller.duplicateCandidates}
            exactDuplicate={controller.exactDuplicate}
            expirationDate={controller.expirationDate}
            formError={controller.formError}
            image={controller.image}
            isInCart={controller.isInCart}
            name={controller.name}
            onChangeBarcode={controller.setBarcode}
            onChangeExpirationDate={controller.setExpirationDate}
            onChangeIsInCart={controller.setIsInCart}
            onChangeName={controller.setName}
            onChangeQuantity={value => controller.setQuantity(String(Math.max(1, value)))}
            onOpenBarcodeScanner={controller.openBarcodeScanner}
            onOpenImageSourcePicker={controller.openImageSourcePicker}
            onSelectDuplicate={candidateId => controller.router.replace(`/items/${candidateId}`)}
            parsedQuantity={controller.parsedQuantity}
            selectedPantry={controller.selectedPantry}
          />
          <View style={styles.footer}>
            <AppButton
              disabled={disabled}
              label={controller.itemBusy ? 'Saving…' : controller.item ? 'Save' : 'Add'}
              onPress={controller.selectedPantry ? () => void controller.handleSave() : controller.handleMissingPantry}
            />
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    content: {
      flex: 1,
    },
    footer: {
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 12,
      backgroundColor: colors.background,
    },
  });
