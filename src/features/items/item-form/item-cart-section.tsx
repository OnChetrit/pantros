import { Host, Row, Spacer, Switch } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { NumberWheelInput } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

import { ItemFormFieldLabel } from './item-form-field-label';

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
        <Host style={styles.fieldHeader}>
          <Row alignment="center" spacing={12}>
            <ItemFormFieldLabel>Add To Cart</ItemFormFieldLabel>
            <Spacer flexible />
            <Switch value={isInCart} onValueChange={onToggle} />
          </Row>
        </Host>
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
          {/* <View style={styles.quantitySide} /> */}
        </View>
      ) : null}
    </>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => {
  return StyleSheet.create({
    fieldGroup: {
      gap: 6,
    },
    fieldHeader: {
      flex: 1,
    },
    quantityRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    quantitySide: {
      flex: 1,
      // alignItems: 'flex-start',
      // justifyContent: 'center',
    },
    quantityCenter: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
};
