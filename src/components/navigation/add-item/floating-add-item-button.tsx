import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { Animated, Platform, StyleSheet, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import type { AppThemeColors } from '@/lib/theme';

type FloatingAddItemButtonProps = {
  isDark: boolean;
  isMenuOpen: boolean;
  colors: AppThemeColors;
  fabScale: Animated.Value;
  fabPressOverlay: Animated.Value;
  plusRotation: Animated.AnimatedInterpolation<string | number>;
  onAccessibilityTap: () => void;
};

export function FloatingAddItemButton({
  isDark,
  isMenuOpen,
  colors,
  fabScale,
  fabPressOverlay,
  plusRotation,
  onAccessibilityTap,
}: FloatingAddItemButtonProps) {
  return (
    <Animated.View
      accessible
      accessibilityRole="button"
      accessibilityLabel="Add Item"
      accessibilityHint="Opens barcode scanning and manual entry options"
      accessibilityState={{ expanded: isMenuOpen }}
      onAccessibilityTap={onAccessibilityTap}
      style={[styles.fabShell, { transform: [{ scale: fabScale }] }]}
    >
      <View style={[styles.fabButton, Platform.OS !== 'ios' ? { backgroundColor: colors.tint } : null]}>
        {Platform.OS === 'ios' ? (
          <>
            <GlassView
              pointerEvents="none"
              style={styles.fabGlass}
              glassEffectStyle="regular"
              tintColor={colors.tint}
              colorScheme={isDark ? 'dark' : 'light'}
              isInteractive
            />
            <Animated.View pointerEvents="none" style={[styles.fabPressOverlay, { opacity: fabPressOverlay }]} />
          </>
        ) : null}
        <Animated.View style={{ transform: [{ rotate: plusRotation }] }}>
          <Ionicons name="add" size={24} color={colors.textInverse} />
        </Animated.View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fabShell: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: appColors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  fabButton: {
    flex: 1,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  fabGlass: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    overflow: 'hidden',
  },
  fabPressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
});
