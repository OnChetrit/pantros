import { Ionicons } from '@expo/vector-icons';
import { GlassView } from 'expo-glass-effect';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Animated, Platform, Pressable, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appColors } from '@/components/ui/primitives';
import { triggerMediumImpact } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';

const MENU_MAX_WIDTH = 340;
const MENU_ROW_HEIGHT = 64;
const MENU_PILL_HEIGHT = 66;
const MENU_ROW_GAP = 8;
const MENU_VERTICAL_PADDING = 14;

const ADD_ITEM_ACTIONS = [
  {
    id: 'scan',
    label: 'Scan barcode',
    description: 'Use the camera',
    icon: 'barcode-outline',
  },
  {
    id: 'manual',
    label: 'Add manually',
    description: 'Search first, then create',
    icon: 'create-outline',
  },
] as const;

type AddItemAction = (typeof ADD_ITEM_ACTIONS)[number]['id'];

const SECONDARY_ADD_ITEM_ACTIONS = ADD_ITEM_ACTIONS.slice(0, -1);
const PRIMARY_ADD_ITEM_ACTION = ADD_ITEM_ACTIONS[ADD_ITEM_ACTIONS.length - 1];
const MENU_MIN_HEIGHT =
  SECONDARY_ADD_ITEM_ACTIONS.length * MENU_ROW_HEIGHT +
  MENU_ROW_GAP +
  MENU_PILL_HEIGHT +
  MENU_VERTICAL_PADDING * 2;

export function AddItemMenu() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {width: windowWidth} = useWindowDimensions();
  const {colors, isDark} = useAppTheme();
  const menuRef = useRef<View>(null);
  const fabScale = useRef(new Animated.Value(1)).current;
  const fabPressOverlay = useRef(new Animated.Value(0)).current;
  const menuProgress = useRef(new Animated.Value(0)).current;
  const menuOpenRef = useRef(false);
  const highlightedActionRef = useRef<AddItemAction | null>(null);
  const menuBoundsRef = useRef<{y: number} | null>(null);
  const lastPointerYRef = useRef<number | null>(null);
  const [isMenuMounted, setIsMenuMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [highlightedAction, setHighlightedAction] = useState<AddItemAction | null>(null);
  const menuWidth = Math.min(MENU_MAX_WIDTH, windowWidth - 44);

  const animateFabPress = useCallback((isPressed: boolean) => {
    Animated.parallel([
      Animated.spring(fabScale, {
        toValue: isPressed ? 0.92 : 1,
        damping: 18,
        stiffness: 360,
        mass: 0.7,
        useNativeDriver: true,
      }),
      Animated.timing(fabPressOverlay, {
        toValue: isPressed ? 1 : 0,
        duration: isPressed ? 90 : 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fabPressOverlay, fabScale]);

  useEffect(() => {
    if (!isMenuMounted) {
      return;
    }

    menuProgress.stopAnimation();

    if (isMenuOpen) {
      Animated.spring(menuProgress, {
        toValue: 1,
        damping: 22,
        stiffness: 310,
        mass: 0.78,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(menuProgress, {
      toValue: 0,
      duration: 150,
      useNativeDriver: true,
    }).start(({finished}) => {
      if (finished && !menuOpenRef.current) {
        setIsMenuMounted(false);
        menuBoundsRef.current = null;
      }
    });
  }, [isMenuMounted, isMenuOpen, menuProgress]);

  const setActiveAction = useCallback((action: AddItemAction | null) => {
    if (highlightedActionRef.current === action) {
      return;
    }

    highlightedActionRef.current = action;
    setHighlightedAction(action);
  }, []);

  const openMenu = useCallback(() => {
    menuOpenRef.current = true;
    setIsMenuMounted(true);
    setIsMenuOpen(true);
    setActiveAction(null);
  }, [setActiveAction]);

  const closeMenu = useCallback(() => {
    menuOpenRef.current = false;
    setIsMenuOpen(false);
    setActiveAction(null);
    lastPointerYRef.current = null;
  }, [setActiveAction]);

  const toggleMenu = useCallback(() => {
    if (menuOpenRef.current) {
      closeMenu();
      return;
    }

    openMenu();
  }, [closeMenu, openMenu]);

  const resolveActionAtY = useCallback((pageY: number): AddItemAction | null => {
    const bounds = menuBoundsRef.current;

    if (!bounds) {
      return null;
    }

    const menuOffset = pageY - bounds.y - MENU_VERTICAL_PADDING;
    const rowAreaHeight = SECONDARY_ADD_ITEM_ACTIONS.length * MENU_ROW_HEIGHT;

    if (menuOffset >= 0 && menuOffset < rowAreaHeight) {
      const rowIndex = Math.floor(menuOffset / MENU_ROW_HEIGHT);

      return SECONDARY_ADD_ITEM_ACTIONS[rowIndex]?.id ?? null;
    }

    const primaryActionTop = rowAreaHeight + MENU_ROW_GAP;
    if (menuOffset >= primaryActionTop && menuOffset <= primaryActionTop + MENU_PILL_HEIGHT) {
      return PRIMARY_ADD_ITEM_ACTION.id;
    }

    return null;
  }, []);

  const updateDragSelection = useCallback((pageY: number) => {
    lastPointerYRef.current = pageY;
    setActiveAction(resolveActionAtY(pageY));
  }, [resolveActionAtY, setActiveAction]);

  const measureMenu = useCallback(() => {
    menuRef.current?.measureInWindow((_x, y) => {
      menuBoundsRef.current = {y};

      if (lastPointerYRef.current !== null) {
        updateDragSelection(lastPointerYRef.current);
      }
    });
  }, [updateDragSelection]);

  const handleMenuLayout = useCallback((_event: LayoutChangeEvent) => {
    requestAnimationFrame(measureMenu);
  }, [measureMenu]);

  const navigateToAction = useCallback((action: AddItemAction) => {
    closeMenu();

    if (action === 'scan') {
      router.push('/items/scan');
      return;
    }

    router.navigate(`/search?entry=manual&nonce=${Date.now()}`);
  }, [closeMenu, router]);

  const addItemGesture = useMemo(() => {
    const holdAndDrag = Gesture.Pan()
      .activateAfterLongPress(320)
      .minDistance(0)
      .shouldCancelWhenOutside(false)
      .runOnJS(true)
      .onStart((event) => {
        openMenu();
        animateFabPress(true);
        updateDragSelection(event.absoluteY);
        void triggerMediumImpact();
      })
      .onUpdate((event) => {
        updateDragSelection(event.absoluteY);
      })
      .onEnd((event) => {
        const action = resolveActionAtY(event.absoluteY);

        if (action) {
          navigateToAction(action);
        } else {
          setActiveAction(null);
        }
      })
      .onFinalize(() => {
        animateFabPress(false);
        lastPointerYRef.current = null;
      });

    const tap = Gesture.Tap()
      .maxDuration(300)
      .maxDistance(12)
      .runOnJS(true)
      .onBegin(() => {
        animateFabPress(true);
      })
      .onEnd((_event, success) => {
        if (success) {
          toggleMenu();
        }
      })
      .onFinalize(() => {
        animateFabPress(false);
      });

    return Gesture.Exclusive(holdAndDrag, tap);
  }, [
    animateFabPress,
    navigateToAction,
    openMenu,
    resolveActionAtY,
    setActiveAction,
    toggleMenu,
    updateDragSelection,
  ]);

  const menuOpacity = menuProgress.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.82, 1],
    extrapolate: 'clamp',
  });
  const menuTranslateX = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [36, 0],
    extrapolate: 'clamp',
  });
  const menuTranslateY = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [48, 0],
    extrapolate: 'clamp',
  });
  const menuScale = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0.64, 1],
    extrapolate: 'clamp',
  });
  const menuItemTranslateY = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
    extrapolate: 'clamp',
  });
  const primaryActionScale = menuProgress.interpolate({
    inputRange: [0, 0.45, 1],
    outputRange: [0.86, 0.94, 1],
    extrapolate: 'clamp',
  });
  const plusRotation = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg'],
    extrapolate: 'clamp',
  });
  const backdropOpacity = menuProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.14],
    extrapolate: 'clamp',
  });

  return (
    <View pointerEvents="box-none" style={[styles.fabLayer, {paddingBottom: insets.bottom}]}>
      {isMenuMounted ? (
        <Animated.View
          pointerEvents={isMenuOpen ? 'auto' : 'none'}
          style={[styles.menuBackdrop, {opacity: backdropOpacity}]}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close add item menu"
            onPress={closeMenu}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      ) : null}

      <View pointerEvents="box-none" style={styles.fabContainer}>
        {isMenuMounted ? (
          <View
            ref={menuRef}
            accessibilityViewIsModal
            onLayout={handleMenuLayout}
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
                  transform: [
                    {translateX: menuTranslateX},
                    {translateY: menuTranslateY},
                    {scale: menuScale},
                  ],
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
              <Animated.View
                style={[
                  styles.menuContent,
                  {
                    transform: [{translateY: menuItemTranslateY}],
                  },
                ]}
              >
                {SECONDARY_ADD_ITEM_ACTIONS.map((action) => {
                  const isHighlighted = highlightedAction === action.id;

                  return (
                    <Pressable
                      key={action.id}
                      accessibilityRole="button"
                      accessibilityLabel={action.label}
                      accessibilityHint={action.description}
                      onPress={() => navigateToAction(action.id)}
                      style={[
                        styles.actionRow,
                        isHighlighted ? {backgroundColor: colors.tintSoft} : null,
                      ]}
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
                        <Ionicons
                          name={action.icon}
                          size={21}
                          color={isHighlighted ? colors.textInverse : colors.tint}
                        />
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
                    onPress={() => navigateToAction(PRIMARY_ADD_ITEM_ACTION.id)}
                    style={[
                      styles.primaryAction,
                      {
                        backgroundColor: colors.tint,
                      },
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
        ) : null}

        <GestureDetector gesture={addItemGesture}>
          <Animated.View
            accessible
            accessibilityRole="button"
            accessibilityLabel="Add Item"
            accessibilityHint="Opens barcode scanning and manual entry options"
            accessibilityState={{expanded: isMenuOpen}}
            onAccessibilityTap={toggleMenu}
            style={[styles.fabShell, {transform: [{scale: fabScale}]}]}
          >
            <View style={[styles.fabButton, Platform.OS !== 'ios' ? {backgroundColor: colors.tint} : null]}>
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
                  <Animated.View pointerEvents="none" style={[styles.fabPressOverlay, {opacity: fabPressOverlay}]} />
                </>
              ) : null}
              <Animated.View style={{transform: [{rotate: plusRotation}]}}>
                <Ionicons name="add" size={24} color={colors.textInverse} />
              </Animated.View>
            </View>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fabLayer: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    zIndex: 20,
  },
  menuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
  },
  fabContainer: {
    width: 60,
    height: 60,
    marginRight: 22,
    marginBottom: 54,
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
  fabShell: {
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: appColors.shadow,
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: {width: 0, height: 8},
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
