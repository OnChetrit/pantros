import { useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Animated, StyleSheet, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { triggerMediumImpact } from '@/lib/haptics';
import { useAppTheme } from '@/lib/theme';
import { AddItemActionMenu } from './add-item/add-item-action-menu';
import {
  MENU_MAX_WIDTH,
  MENU_PILL_HEIGHT,
  MENU_ROW_GAP,
  MENU_ROW_HEIGHT,
  MENU_VERTICAL_PADDING,
  PRIMARY_ADD_ITEM_ACTION,
  SECONDARY_ADD_ITEM_ACTIONS,
  type AddItemAction,
} from './add-item/add-item-menu.constants';
import { FloatingAddItemButton } from './add-item/floating-add-item-button';

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
      <View pointerEvents="box-none" style={styles.fabContainer}>
        <AddItemActionMenu
          isDark={isDark}
          isMenuMounted={isMenuMounted}
          isMenuOpen={isMenuOpen}
          menuRef={menuRef}
          menuWidth={menuWidth}
          colors={colors}
          highlightedAction={highlightedAction}
          menuOpacity={menuOpacity}
          menuTranslateX={menuTranslateX}
          menuTranslateY={menuTranslateY}
          menuScale={menuScale}
          menuItemTranslateY={menuItemTranslateY}
          primaryActionScale={primaryActionScale}
          backdropOpacity={backdropOpacity}
          onLayout={handleMenuLayout}
          onClose={closeMenu}
          onNavigate={navigateToAction}
        />

        <GestureDetector gesture={addItemGesture}>
          <FloatingAddItemButton
            isDark={isDark}
            isMenuOpen={isMenuOpen}
            colors={colors}
            fabScale={fabScale}
            fabPressOverlay={fabPressOverlay}
            plusRotation={plusRotation}
            onAccessibilityTap={toggleMenu}
          />
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
  fabContainer: {
    width: 60,
    height: 60,
    marginRight: 22,
    marginBottom: 54,
  },
});
