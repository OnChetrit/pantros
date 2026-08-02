import { Switch, StyleSheet, View } from 'react-native';

import { NumberWheelInput } from '@/components/ui/primitives/number-wheel-input.android';
import { useThemedStyles } from '@/lib/theme';

import { ItemFormFieldLabel } from '../item-form/item-form-field-label';

type ItemCartSectionProps = {
  isInCart: boolean;
  quantity: number;
  onToggle: (value: boolean) => void;
  onChangeQuantity: (value: number) => void;
};

const quantityOptions = Array.from({length: 50}, (_, index) => index + 1);

export function ItemCartSection({isInCart, quantity, onToggle, onChangeQuantity}: ItemCartSectionProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <>
      <View style={styles.fieldGroup}>
        <View style={styles.fieldHeader}>
          <ItemFormFieldLabel>Add To Cart</ItemFormFieldLabel>
          <Switch value={isInCart} onValueChange={onToggle} />
        </View>
      </View>
      {isInCart ? (
        <View style={[styles.fieldGroup, styles.quantityRow]}>
          <View style={styles.quantitySide}>
            <ItemFormFieldLabel>Quantity</ItemFormFieldLabel>
          </View>
          <View style={styles.quantityCenter}>
            <View style={styles.wheelCard}>
              <NumberWheelInput
                value={Math.max(1, Math.min(quantity, quantityOptions.length))}
                options={quantityOptions}
                onChange={onChangeQuantity}
              />
            </View>
          </View>
        </View>
      ) : null}
    </>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    fieldGroup: {
      marginTop: 8,
      gap: 6,
    },
    fieldHeader: {
      minHeight: 32,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    quantitySide: {
      flex: 1,
    },
    quantityCenter: {
      alignItems: 'flex-end',
    },
    wheelCard: {
      width: 76,
      borderWidth: 1,
      borderRadius: 18,
      paddingHorizontal: 2,
      paddingVertical: 2,
      backgroundColor: colors.input,
      borderColor: colors.border,
    },
  });
