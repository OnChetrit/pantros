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
      <AppTextInput value={name} onChangeText={onChangeName} placeholder="" />
      {duplicateCandidates.length > 0 ? (
        <View style={styles.suggestionList}>
          {duplicateCandidates.map(candidate => {
            const isExact = candidate.id === exactDuplicateId;

            return (
              <Pressable
                key={candidate.id}
                onPress={() => onSelectDuplicate(candidate.id)}
                style={({ pressed }) => [
                  styles.suggestionRow,
                  isExact ? styles.suggestionRowExact : null,
                  pressed ? styles.suggestionRowPressed : null,
                ]}
              >
                <Text style={styles.suggestionName}>{candidate.name}</Text>
                <Text style={styles.suggestionAction}>{isExact ? 'Open existing' : 'Use existing'}</Text>
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    suggestionRowExact: {
      backgroundColor: colors.tintSoft,
    },
    suggestionRowPressed: {
      opacity: 0.7,
    },
    suggestionName: {
      flex: 1,
      color: colors.text,
      fontSize: 14,
      fontWeight: '700',
    },
    suggestionAction: {
      color: colors.tint,
      fontSize: 12,
      fontWeight: '800',
    },
  });
