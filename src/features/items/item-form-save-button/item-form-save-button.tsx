import { Ionicons } from '@expo/vector-icons';
import { Pressable } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import { useThemedStyles } from '@/lib/theme';

import { createStyles } from '../item-form-screen/item-form-screen.styles';

export function ItemFormSaveButton({
  canSave,
  itemBusy,
  onPress,
  label,
}: {
  canSave: boolean;
  itemBusy: boolean;
  onPress: () => void;
  label: string;
}) {
  const styles = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      disabled={itemBusy || !canSave}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({pressed}) => [
        styles.headerActionButton,
        pressed || itemBusy || !canSave ? styles.headerActionButtonPressed : null,
      ]}
    >
      <Ionicons name="checkmark" size={24} color={itemBusy || !canSave ? appColors.muted : appColors.tint} />
    </Pressable>
  );
}
