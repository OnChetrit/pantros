import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTextInput, appColors } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

import { ItemFormFieldLabel } from './item-form-field-label';

type ItemBarcodeFieldProps = {
  barcode: string;
  busy: boolean;
  error: string | null;
  onChangeBarcode: (value: string) => void;
  onScanPress: () => void;
};

export function ItemBarcodeField({
  barcode,
  busy,
  error,
  onChangeBarcode,
  onScanPress,
}: ItemBarcodeFieldProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.fieldGroup}>
      <ItemFormFieldLabel>Barcode</ItemFormFieldLabel>
      <AppTextInput
        value={barcode}
        onChangeText={onChangeBarcode}
        placeholder=""
        autoCapitalize="none"
        rightSlot={
          <Pressable
            onPress={onScanPress}
            accessibilityRole="button"
            accessibilityLabel="Scan barcode"
            style={({ pressed }) => [styles.inputIconButton, pressed ? styles.inputIconButtonPressed : null]}
          >
            <Ionicons name="scan-outline" size={20} color={appColors.tint} />
          </Pressable>
        }
      />
      {busy ? (
        <View style={styles.inlineStatus}>
          <ActivityIndicator color={appColors.tint} size="small" />
          <Text style={styles.inlineStatusText}>Reading barcode from image…</Text>
        </View>
      ) : null}
      {error ? (
        <View style={styles.inlineError}>
          <Text style={styles.inlineErrorText}>{error}</Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    fieldGroup: {
      gap: 6,
    },
    inputIconButton: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
    },
    inputIconButtonPressed: {
      opacity: 0.55,
    },
    inlineStatus: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    inlineStatusText: {
      color: colors.muted,
      fontSize: 13,
    },
    inlineError: {
      borderRadius: 14,
      paddingHorizontal: 12,
      paddingVertical: 10,
      backgroundColor: colors.dangerSoft,
    },
    inlineErrorText: {
      color: colors.text,
      fontSize: 13,
      lineHeight: 18,
    },
  });
