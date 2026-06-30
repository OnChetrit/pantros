import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import type { RefObject } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Animated, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { appColors } from '@/components/ui/primitives';
import type { AppThemeColors } from '@/lib/theme';

import {
    MENU_MAX_WIDTH,
    MENU_MIN_HEIGHT,
    MENU_PILL_HEIGHT,
    MENU_ROW_GAP,
    MENU_ROW_HEIGHT,
    MENU_VERTICAL_PADDING,
    PRIMARY_ADD_ITEM_ACTION,
    SECONDARY_ADD_ITEM_ACTIONS,
    type AddItemAction,
} from './add-item-menu.constants';

type AddItemActionMenuProps = {
  isDark: boolean;
  isMenuMounted: boolean;
  isMenuOpen: boolean;
  menuRef: RefObject<View | null>;
  menuWidth: number;
  colors: AppThemeColors;
  highlightedAction: AddItemAction | null;
  menuOpacity: Animated.AnimatedInterpolation<number>;
  menuTranslateX: Animated.AnimatedInterpolation<number>;
  menuTranslateY: Animated.AnimatedInterpolation<number>;
  menuScale: Animated.AnimatedInterpolation<number>;
  menuItemTranslateY: Animated.AnimatedInterpolation<number>;
  primaryActionScale: Animated.AnimatedInterpolation<number>;
  backdropOpacity: Animated.AnimatedInterpolation<number>;
  onLayout: (event: LayoutChangeEvent) => void;
  onClose: () => void;
  onNavigate: (action: AddItemAction) => void;
};

export function AddItemActionMenu({
  isDark,
  isMenuMounted,
  isMenuOpen,
  menuRef,
  menuWidth,
  colors,
  highlightedAction,
  menuOpacity,
  menuTranslateX,
  menuTranslateY,
  menuScale,
  menuItemTranslateY,
  primaryActionScale,
  backdropOpacity,
  onLayout,
  onClose,
  onNavigate,
}: AddItemActionMenuProps) {
  if (!isMenuMounted) {
    return null;
  }

  return (
    <>
      <Animated.View
        pointerEvents={isMenuOpen ? 'auto' : 'none'}
        style={[styles.menuBackdrop, {opacity: backdropOpacity}]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close add item menu"
          onPress={onClose}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      <View
        ref={menuRef}
        accessibilityViewIsModal
        onLayout={onLayout}
        pointerEvents={isMenuOpen ? 'auto' : 'none'}
        style={[styles.actionMenuAnchor, {width: menuWidth}]}
      >
        <Animated.View
          style={[
            styles.actionMenu,
            {
              backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.card,
              borderColor: colors.border,
              opacity: menuOpacity,
              transform: [{translateX: menuTranslateX}, {translateY: menuTranslateY}, {scale: menuScale}],
            },
          ]}
        >
          {Platform.OS === 'ios' ? (
            <GlassView
              pointerEvents="none"
              style={styles.menuGlass}
              glassEffectStyle="regular"
              tintColor={colors.card}
              colorScheme={isDark ? 'dark' : 'light'}
              isInteractive
            />
          ) : null}
          <Animated.View style={[styles.menuContent, {transform: [{translateY: menuItemTranslateY}]}]}>
            {SECONDARY_ADD_ITEM_ACTIONS.map(action => {
              const isHighlighted = highlightedAction === action.id;

              return (
                <Pressable
                  key={action.id}
                  accessibilityRole="button"
                  accessibilityLabel={action.label}
                  accessibilityHint={action.description}
                  onPress={() => onNavigate(action.id)}
                  style={[styles.actionRow, isHighlighted ? {backgroundColor: colors.tintSoft} : null]}
                >
                  <View
                    style={[
                      styles.actionIcon,
                      {
                        backgroundColor: isHighlighted ? colors.tint : colors.tintSoft,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons name={action.icon} size={21} color={isHighlighted ? colors.textInverse : colors.tint} />
                  </View>
                  <View style={styles.actionCopy}>
                    <Text style={[styles.actionLabel, {color: colors.text}]}>{action.label}</Text>
                    <Text style={[styles.actionDescription, {color: colors.muted}]}>{action.description}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.muted} />
                </Pressable>
              );
            })}
            <Animated.View style={{transform: [{scale: primaryActionScale}]}}>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={PRIMARY_ADD_ITEM_ACTION.label}
                accessibilityHint={PRIMARY_ADD_ITEM_ACTION.description}
                onPress={() => onNavigate(PRIMARY_ADD_ITEM_ACTION.id)}
                style={[
                  styles.primaryAction,
                  {backgroundColor: colors.tint},
                  highlightedAction === PRIMARY_ADD_ITEM_ACTION.id ? styles.primaryActionHighlighted : null,
                ]}
              >
                <Ionicons name={PRIMARY_ADD_ITEM_ACTION.icon} size={24} color={colors.textInverse} />
                <Text style={[styles.primaryActionLabel, {color: colors.textInverse}]}>
                  {PRIMARY_ADD_ITEM_ACTION.label}
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  menuBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
  },
  actionMenuAnchor: {
    position: 'absolute',
    right: 0,
    bottom: 72,
    maxWidth: MENU_MAX_WIDTH,
    minHeight: MENU_MIN_HEIGHT,
  },
  actionMenu: {
    width: '100%',
    minHeight: MENU_MIN_HEIGHT,
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: appColors.shadow,
    shadowOpacity: 0.26,
    shadowRadius: 28,
    shadowOffset: {width: 0, height: 14},
    elevation: 16,
  },
  menuGlass: {
    ...StyleSheet.absoluteFill,
    borderRadius: 30,
    overflow: 'hidden',
  },
  menuContent: {
    padding: MENU_VERTICAL_PADDING,
    gap: MENU_ROW_GAP,
  },
  actionRow: {
    height: MENU_ROW_HEIGHT,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 11,
    borderRadius: 20,
  },
  actionIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  actionDescription: {
    fontSize: 12,
    fontWeight: '600',
  },
  primaryAction: {
    height: MENU_PILL_HEIGHT,
    borderRadius: MENU_PILL_HEIGHT / 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    shadowColor: appColors.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 12,
    shadowOffset: {width: 0, height: 6},
  },
  primaryActionHighlighted: {
    transform: [{scale: 0.98}],
  },
  primaryActionLabel: {
    fontSize: 18,
    fontWeight: '800',
  },
});
