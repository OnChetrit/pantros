import { Host, RNHostView, Row, Spacer } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Switch, Text, View, Pressable } from 'react-native';

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
        <Host style={styles.fieldHeader}>
          <Row alignment="center" spacing={12}>
            <RNHostView matchContents>
              <ItemFormFieldLabel>Add To Cart</ItemFormFieldLabel>
            </RNHostView>
            <Spacer flexible />
            <RNHostView matchContents>
              <Switch value={isInCart} onValueChange={onToggle} />
            </RNHostView>
          </Row>
        </Host>
      </View>

      {isInCart ? (
        <View style={styles.fieldGroup}>
          <ItemFormFieldLabel>Quantity</ItemFormFieldLabel>
          <Host style={styles.stepper}>
            <Row alignment="center" spacing={12}>
              <RNHostView matchContents>
                <Pressable
                  onPress={onDecrement}
                  style={({ pressed }) => [styles.stepperButton, pressed ? styles.stepperButtonPressed : null]}
                >
                  <Ionicons name="remove" size={18} color={appColors.text} />
                </Pressable>
              </RNHostView>
              <Spacer flexible />
              <RNHostView matchContents>
                <Text style={styles.stepperValue}>{quantity}</Text>
              </RNHostView>
              <Spacer flexible />
              <RNHostView matchContents>
                <Pressable
                  onPress={onIncrement}
                  style={({ pressed }) => [styles.stepperButton, pressed ? styles.stepperButtonPressed : null]}
                >
                  <Ionicons name="add" size={18} color={appColors.text} />
                </Pressable>
              </RNHostView>
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
    stepperButtonPressed: {
      opacity: 0.6,
    },
    stepperValue: {
      color: colors.text,
      fontSize: 17,
      fontWeight: '800',
    },
  });
