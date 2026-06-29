import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

import { ItemFormFieldLabel } from './item-form-field-label';

type ItemCartSectionProps = {
  isInCart: boolean;
  quantity: number;
  onToggle: (value: boolean) => void;
  onDecrement: () => void;
  onIncrement: () => void;
};

export function ItemCartSection({
  isInCart,
  quantity,
  onToggle,
  onDecrement,
  onIncrement,
}: ItemCartSectionProps) {
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
        <View style={styles.fieldGroup}>
          <ItemFormFieldLabel>Quantity</ItemFormFieldLabel>
          <View style={styles.stepper}>
            <Pressable
              onPress={onDecrement}
              style={({ pressed }) => [styles.stepperButton, pressed ? styles.stepperButtonPressed : null]}
            >
              <Ionicons name="remove" size={18} color={appColors.text} />
            </Pressable>
            <Text style={styles.stepperValue}>{quantity}</Text>
            <Pressable
              onPress={onIncrement}
              style={({ pressed }) => [styles.stepperButton, pressed ? styles.stepperButtonPressed : null]}
            >
              <Ionicons name="add" size={18} color={appColors.text} />
            </Pressable>
          </View>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    stepper: {
      minHeight: 48,
      borderRadius: 16,
      paddingHorizontal: 8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    stepperButtonPressed: {
      opacity: 0.6,
    },
    stepperValue: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
  });
