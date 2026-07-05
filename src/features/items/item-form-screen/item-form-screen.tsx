import { Stack } from 'expo-router';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { ItemFormBody, ItemFormSaveButton, type ItemFormScreenProps, useItemFormController } from './item-form-screen.shared';

export function ItemFormScreen(props: ItemFormScreenProps) {
  const styles = useThemedStyles(createStyles);
  const controller = useItemFormController(props);

  return (
    <KeyboardAvoidingView style={styles.screen}>
      <Stack.Screen
        options={{
          title: controller.title,
          headerTitleAlign: 'center',
          headerBackVisible: true,
          headerRight: () => (
            <ItemFormSaveButton
              canSave={controller.canSave}
              itemBusy={controller.itemBusy}
              label={controller.item ? 'Save item' : 'Add item'}
              onPress={controller.selectedPantry ? () => void controller.handleSave() : controller.handleMissingPantry}
            />
          ),
        }}
      />
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
        onDecrementQuantity={() => {
          const nextValue = Math.max(1, controller.parsedQuantity ?? 1) - 1;
          controller.setQuantity(String(Math.max(1, nextValue)));
        }}
        onIncrementQuantity={() => {
          controller.setQuantity(String((controller.parsedQuantity ?? 1) + 1));
        }}
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
