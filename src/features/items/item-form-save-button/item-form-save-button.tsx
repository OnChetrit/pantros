import { Button, Host, RNHostView } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';

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
    <Host>
      <Button onPress={onPress} disabled={itemBusy || !canSave} variant="text" style={styles.headerActionButton as never}>
        <RNHostView matchContents>
          <Ionicons name="checkmark" size={24} color={itemBusy || !canSave ? appColors.muted : appColors.tint} />
        </RNHostView>
      </Button>
    </Host>
  );
}
