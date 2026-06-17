import { Pressable, StyleSheet, Text, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';

type ExpirationMode = 'manual' | 'relative' | 'scan';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

function ModeChip({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.modeChip, active ? styles.modeChipActive : null]}>
      <Text style={[styles.modeChipText, active ? styles.modeChipTextActive : null]}>{label}</Text>
    </Pressable>
  );
}

export function ItemExpirationModePicker({ mode, onChange }: ItemExpirationModePickerProps) {
  return (
    <View style={styles.modeRow}>
      <ModeChip active={mode === 'manual'} label="Manual" onPress={() => onChange('manual')} />
      <ModeChip active={mode === 'relative'} label="Relative" onPress={() => onChange('relative')} />
      <ModeChip active={mode === 'scan'} label="Scan" onPress={() => onChange('scan')} />
    </View>
  );
}

const styles = StyleSheet.create({
  modeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    flex: 1,
    minHeight: 40,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.listRow,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  modeChipActive: {
    backgroundColor: appColors.tintSoft,
    borderColor: appColors.borderStrong,
  },
  modeChipText: {
    color: appColors.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  modeChipTextActive: {
    color: appColors.text,
  },
});
