import { Button, Host, RNHostView } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';

import { appColors } from '@/components/ui/primitives';

export function AuthProviderButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Host>
      <Button disabled={disabled} onPress={onPress} variant="outlined" style={styles.providerIconButton as never}>
        <RNHostView matchContents>
          <Ionicons name={icon} size={18} color={appColors.text} />
        </RNHostView>
      </Button>
    </Host>
  );
}

const styles = StyleSheet.create({
  providerIconButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.background,
    borderWidth: 1,
    borderColor: appColors.border,
  },
});
