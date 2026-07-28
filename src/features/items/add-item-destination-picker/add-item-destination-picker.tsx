import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { AddItemDestination } from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';

import type { AddItemDestinationPickerProps } from './add-item-destination-picker.types';

export function AddItemDestinationPicker({value, disabled = false, onChange}: AddItemDestinationPickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.container}>
      {(['pantry', 'cart'] as AddItemDestination[]).map(destination => (
        <Pressable
          key={destination}
          accessibilityRole="radio"
          accessibilityState={{checked: value === destination, disabled}}
          disabled={disabled}
          onPress={() => onChange(destination)}
          style={({pressed}) => [
            styles.option,
            value === destination ? styles.selectedOption : null,
            pressed ? styles.pressedOption : null,
          ]}
        >
          <Text style={[styles.optionText, value === destination ? styles.selectedOptionText : null]}>
            {destination === 'pantry' ? 'Pantry' : 'Cart'}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    container: {
      width: 168,
      minHeight: 36,
      padding: 3,
      flexDirection: 'row',
      gap: 3,
      borderRadius: 10,
      backgroundColor: colors.input,
    },
    option: {
      flex: 1,
      minHeight: 30,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
    },
    selectedOption: {
      backgroundColor: colors.tint,
    },
    pressedOption: {
      opacity: 0.72,
    },
    optionText: {
      color: colors.muted,
      fontSize: 13,
      fontWeight: '700',
    },
    selectedOptionText: {
      color: colors.textInverse,
    },
  });
