import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useThemedStyles } from '@/lib/theme';

type ExpirationMode = 'manual' | 'relative';

type ItemExpirationModePickerProps = {
  mode: ExpirationMode;
  onChange: (mode: ExpirationMode) => void;
};

export function ItemExpirationModePicker({mode, onChange}: ItemExpirationModePickerProps) {
  const styles = useThemedStyles(createStyles);

  return (
    <View style={styles.segmentedControl} accessibilityRole="tablist">
      {(['manual', 'relative'] as const).map(option => {
        const active = mode === option;
        const label = option === 'manual' ? 'Manual' : 'Relative';

        return (
          <Pressable
            key={option}
            accessibilityRole="tab"
            accessibilityState={{selected: active}}
            onPress={() => onChange(option)}
            style={[styles.segment, active ? styles.activeSegment : null]}
          >
            <Text style={[styles.segmentText, active ? styles.activeSegmentText : null]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    segmentedControl: {
      width: '100%',
      flexDirection: 'row',
      gap: 6,
      padding: 4,
      borderRadius: 14,
      backgroundColor: colors.input,
      borderWidth: 1,
      borderColor: colors.border,
    },
    segment: {
      flex: 1,
      minHeight: 38,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    activeSegment: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    segmentText: {
      color: colors.muted,
      fontSize: 14,
      fontWeight: '700',
    },
    activeSegmentText: {
      color: colors.text,
    },
  });
