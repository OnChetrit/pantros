import { Button, Host, Row, Spacer, Switch, Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

import { ItemFormFieldLabel } from './item-form-field-label';

type ItemCartSectionProps = {
  isInCart: boolean;
  quantity: number;
  onToggle: (value: boolean) => void;
  onDecrement: () => void;
  onIncrement: () => void;
};

export function ItemCartSection({isInCart, quantity, onToggle, onDecrement, onIncrement}: ItemCartSectionProps) {
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
        <View style={styles.fieldGroup}>
          <ItemFormFieldLabel>Quantity</ItemFormFieldLabel>
          <Host style={styles.stepper}>
            <Row alignment="center" spacing={12}>
              <Button onPress={onDecrement} label="−" variant="outlined" style={styles.stepperButton} />
              <Spacer flexible />
              <Text textStyle={styles.stepperValue}>{String(quantity)}</Text>
              <Spacer flexible />
              <Button onPress={onIncrement} label="+" variant="outlined" style={styles.stepperButton} />
            </Row>
          </Host>
        </View>
      ) : null}
    </>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    fieldGroup: {
      gap: 6,
    },
    fieldHeader: {
      flex: 1,
    },
    stepper: {
      minHeight: 48,
      borderRadius: 16,
      paddingHorizontal: 8,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepperButton: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    stepperValue: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
  });
