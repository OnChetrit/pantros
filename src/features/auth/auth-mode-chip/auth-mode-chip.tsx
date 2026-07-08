import { Button, Host, Text } from '@expo/ui';
import { StyleSheet } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

export function AuthModeChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const styles = useThemedStyles(createStyles);
  const buttonStyle = active ? styles.modeChipActive : styles.modeChip;
  const textStyle = [styles.modeChipText, active ? styles.modeChipTextActive : null] as const;

  return (
    <Host>
      <Button onPress={onPress} variant="text" style={buttonStyle as never}>
        <Text textStyle={textStyle as never}>{label}</Text>
      </Button>
    </Host>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    modeChip: {
      position: 'relative',
      flex: 1,
      minHeight: 46,
      borderRadius: 16,
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 14,
    },
    modeChipActive: {
      borderColor: 'transparent',
    },
    modeChipText: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '700',
    },
    modeChipTextActive: {
      color: colors.textInverse,
    },
  });
