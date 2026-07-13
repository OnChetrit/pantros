import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppTextInput } from '@/components/ui/primitives';
import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { ItemFormFieldLabel } from './item-form-field-label';

type ItemBarcodeFieldProps = {
  barcode: string;
  onChangeBarcode: (value: string) => void;
  onOpenScanner: () => void;
};

export function ItemBarcodeField({
  barcode,
  onChangeBarcode,
  onOpenScanner,
}: ItemBarcodeFieldProps) {
  const {colors} = useAppTheme();
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.fieldGroup}>
      <ItemFormFieldLabel>Barcode</ItemFormFieldLabel>
      <AppTextInput
        value={barcode}
        onChangeText={onChangeBarcode}
        placeholder=""
        autoCapitalize="none"
        size="large"
        rightAccessory={(
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Scan barcode"
            accessibilityHint="Open the camera to scan a barcode"
            hitSlop={10}
            onPress={onOpenScanner}
            style={({pressed}) => [styles.scanButton, pressed ? styles.scanButtonPressed : null]}
          >
            <Ionicons name="scan-outline" size={22} color={colors.tint} />
          </Pressable>
        )}
      />
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    fieldGroup: {
      gap: 6,
    },
    scanButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.tintSoft,
    },
    scanButtonPressed: {
      opacity: 0.68,
    },
  });
