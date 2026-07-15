import { Stack } from 'expo-router';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';

import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { ItemFormBody, type ItemFormScreenProps, useItemFormController } from './item-form-screen.shared';

export function ItemFormScreen(props: ItemFormScreenProps) {
  const styles = useThemedStyles(createStyles);
  const controller = useItemFormController(props);
  const {colors} = useAppTheme();

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.screen}>
      <Stack.Screen
        options={{
          title: controller.title,
          headerTitleAlign: 'center',
          headerBackVisible: Boolean(controller.item),
          headerBackButtonDisplayMode: controller.item ? 'minimal' : undefined,
        }}
      />
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          icon="xmark"
          onPress={() => controller.router.back()}
          tintColor={colors.tint}
          hidden={Boolean(controller.item)}
        />
      </Stack.Toolbar>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          onPress={controller.selectedPantry ? () => void controller.handleSave() : controller.handleMissingPantry}
          disabled={controller.itemBusy || (Boolean(controller.selectedPantry) && !controller.canSave)}
          tintColor={colors.tint}
          variant="done"
        >
          {controller.item ? 'Save' : 'Add'}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
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
    </KeyboardAvoidingView>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
  });
