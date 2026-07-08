import { Button, Row, Spacer, Text } from '@expo/ui';
import { StyleSheet, View } from 'react-native';

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
            const rowStyle = StyleSheet.compose(styles.suggestionRow, isExact ? styles.suggestionRowExact : null);

            return (
              <Button
                key={candidate.id}
                onPress={() => onSelectDuplicate(candidate.id)}
                variant="text"
                style={rowStyle as never}
              >
                <Row alignment="center" spacing={12}>
                  <Text textStyle={styles.suggestionName}>{candidate.name}</Text>
                  <Spacer flexible />
                  <Text textStyle={styles.suggestionAction}>{isExact ? 'Open existing' : 'Use existing'}</Text>
                </Row>
              </Button>
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
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    suggestionRowExact: {
      backgroundColor: colors.tintSoft,
    },
    suggestionName: {
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
