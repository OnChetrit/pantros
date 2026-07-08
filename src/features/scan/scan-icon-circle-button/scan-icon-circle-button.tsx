import { Button, Host, RNHostView } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { appColors } from '@/components/ui/primitives';

export function ScanIconCircleButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Host>
      <Button disabled={disabled} onPress={onPress} variant="outlined" style={styles.iconCircleButton as never}>
        <RNHostView matchContents>
          <Ionicons name={icon} size={22} color={disabled ? appColors.muted : appColors.tint} />
        </RNHostView>
      </Button>
    </Host>
  );
}

const styles = StyleSheet.create({
  iconCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
});
