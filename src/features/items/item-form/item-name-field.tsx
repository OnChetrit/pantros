import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AppTextInput } from '@/components/ui/primitives';
import type { PantryItem } from '@/domain/models';
import { useThemedStyles } from '@/lib/theme';

import { ItemFormFieldLabel } from './item-form-field-label';

type ItemNameFieldProps = {
  name: string;
  duplicateCandidates: PantryItem[];
  exactDuplicateId?: string;
  onChangeName: (value: string) => void;
  onSelectDuplicate: (itemId: string) => void;
};

export function ItemNameField({
  name,
  duplicateCandidates,
  exactDuplicateId,
  onChangeName,
  onSelectDuplicate,
}: ItemNameFieldProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.fieldGroup}>
      <ItemFormFieldLabel>Name</ItemFormFieldLabel>
      <AppTextInput value={name} onChangeText={onChangeName} placeholder="" size="large" autoFocus />
      {duplicateCandidates.length > 0 ? (
        <View style={styles.suggestionList}>
          {duplicateCandidates.map(candidate => {
            const isExact = candidate.id === exactDuplicateId;
            const rowStyle = [styles.suggestionRow, isExact ? styles.suggestionRowExact : null];

            return (
              <Pressable key={candidate.id} onPress={() => onSelectDuplicate(candidate.id)} style={rowStyle}>
                <View style={styles.suggestionRowContent}>
                  <Text style={styles.suggestionName}>{candidate.name}</Text>
                  <Text style={styles.suggestionAction}>{isExact ? 'Open existing' : 'Use existing'}</Text>
                </View>
              </Pressable>
            );
          })}
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
    suggestionList: {
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.input,
    },
    suggestionRow: {
      minHeight: 40,
      paddingHorizontal: 12,
      justifyContent: 'center',
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    suggestionRowContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    suggestionRowExact: {
      backgroundColor: colors.tintSoft,
    },
    suggestionName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
      flex: 1,
    },
    suggestionAction: {
      color: colors.tint,
      fontSize: 12,
      fontWeight: '800',
    },
  });
