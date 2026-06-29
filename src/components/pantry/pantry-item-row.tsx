import type { PantryItem } from '@/domain/models';
import { Ionicons } from '@expo/vector-icons';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';

import {
  getPantryFullSwipeDistance,
  PANTRY_SWIPE_OPEN_DISTANCE,
  PantrySwipeAction,
} from '@/components/pantry/pantry-item-row-swipe';
import { triggerMediumImpact, triggerSelectionFeedback } from '@/lib/haptics';
import { formatExpirationLabel } from '@/lib/pantry-insights';
import { appColors } from '@/lib/theme';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const SUCCESS_COLOR = '#34C759';
const DESTRUCTIVE_COLOR = '#FF3B30';
const SWIPE_OPEN_THRESHOLD_RATIO = 0.48;
const SWIPE_VELOCITY_THRESHOLD = 560;
const MAX_SWIPE_ROW_RATIO = 0.92;
const COMMIT_ANIMATION_DURATION = 170;
const SWIPE_SPRING = {
  damping: 22,
  stiffness: 280,
  mass: 0.85,
};

type SwipeSide = 'left' | 'right';

type PantryItemRowProps = {
  item: PantryItem;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  leftActionLabel?: string;
  leftActionIcon?: keyof typeof Ionicons.glyphMap;
  onLeftAction?: () => void;
  onDelete: () => void;
  onWillOpen: (row: SwipeableMethods | null) => void;
};

export function PantryItemRow({
  item,
  isLast,
  onPress,
  leftActionLabel,
  leftActionIcon = 'cart-outline',
  onLeftAction,
  onDelete,
  onWillOpen,
}: PantryItemRowProps) {
  const swipeableRef = useRef<SwipeableMethods | null>(null);
  const actionLockRef = useRef(false);
  const openSideRef = useRef<SwipeSide | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [rowWidth, setRowWidth] = useState(0);
  const translateX = useSharedValue(0);
  const swipeHighlightActive = useSharedValue(0);
  const dragStartX = useSharedValue(0);
  const leftFullSwipeArmed = useSharedValue(false);
  const rightFullSwipeArmed = useSharedValue(false);
  const quantityLabel = String(item.quantity);
  const hasLeftAction = Boolean(onLeftAction && leftActionLabel);
  const openDistance = PANTRY_SWIPE_OPEN_DISTANCE;
  const fullSwipeDistance = getPantryFullSwipeDistance(rowWidth);
  const commitDistance = Math.max(rowWidth, fullSwipeDistance + openDistance);
  const maxSwipeDistance = Math.max(commitDistance, rowWidth * MAX_SWIPE_ROW_RATIO);

  const withActionLock = useCallback((action: () => void) => {
    if (actionLockRef.current) {
      return;
    }

    actionLockRef.current = true;
    action();

    setTimeout(() => {
      actionLockRef.current = false;
    }, 350);
  }, []);

  const closeRow = useCallback(() => {
    openSideRef.current = null;
    leftFullSwipeArmed.set(false);
    rightFullSwipeArmed.set(false);
    swipeHighlightActive.value = 0;
    translateX.value = withSpring(0, SWIPE_SPRING);
    setIsSwiping(false);
  }, [leftFullSwipeArmed, rightFullSwipeArmed, swipeHighlightActive, translateX]);

  const resetRow = useCallback(() => {
    openSideRef.current = null;
    leftFullSwipeArmed.set(false);
    rightFullSwipeArmed.set(false);
    swipeHighlightActive.value = 0;
    translateX.value = 0;
    setIsSwiping(false);
  }, [leftFullSwipeArmed, rightFullSwipeArmed, swipeHighlightActive, translateX]);

  const markRowOpen = useCallback(
    (side: SwipeSide) => {
      if (side === 'left' && !hasLeftAction) {
        closeRow();
        return;
      }

      onWillOpen(swipeableRef.current);
      openSideRef.current = side;
      leftFullSwipeArmed.set(false);
      rightFullSwipeArmed.set(false);
      swipeHighlightActive.value = 1;
      setIsSwiping(true);
    },
    [closeRow, hasLeftAction, leftFullSwipeArmed, onWillOpen, rightFullSwipeArmed, swipeHighlightActive]
  );

  const openRow = useCallback(
    (side: SwipeSide) => {
      if (side === 'left' && !hasLeftAction) {
        closeRow();
        return;
      }

      markRowOpen(side);
      translateX.value = withSpring(side === 'left' ? openDistance : -openDistance, SWIPE_SPRING);
    },
    [closeRow, hasLeftAction, markRowOpen, openDistance, translateX]
  );

  const swipeableMethods = useMemo<SwipeableMethods>(
    () => ({
      close: closeRow,
      openLeft: () => {
        openRow('left');
      },
      openRight: () => {
        openRow('right');
      },
      reset: resetRow,
    }),
    [closeRow, openRow, resetRow]
  );

  swipeableRef.current = swipeableMethods;

  const confirmDelete = useCallback(() => {
    withActionLock(() => {
      void triggerMediumImpact();
      Alert.alert('Delete Item', `Delete "${item.name}"?`, [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: closeRow,
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            closeRow();
            onDelete();
          },
        },
      ]);
    });
  }, [closeRow, item.name, onDelete, withActionLock]);

  const handleDelete = useCallback(() => {
    confirmDelete();
  }, [confirmDelete]);

  const handleLeftAction = useCallback(() => {
    withActionLock(() => {
      void triggerMediumImpact();
      closeRow();
      onLeftAction?.();
    });
  }, [closeRow, onLeftAction, withActionLock]);

  const handleFullSwipeDelete = useCallback(() => {
    closeRow();
    confirmDelete();
  }, [closeRow, confirmDelete]);

  const handleLeftArmedChange = useCallback((isArmed: boolean) => {
    if (isArmed) {
      void triggerSelectionFeedback();
    }
  }, []);

  const handleRightArmedChange = useCallback((isArmed: boolean) => {
    if (isArmed) {
      void triggerSelectionFeedback();
    }
  }, []);

  const handleSwipeStart = useCallback(() => {
    onWillOpen(swipeableRef.current);
    leftFullSwipeArmed.set(false);
    rightFullSwipeArmed.set(false);
    swipeHighlightActive.value = 1;
    setIsSwiping(true);
  }, [leftFullSwipeArmed, onWillOpen, rightFullSwipeArmed, swipeHighlightActive]);

  const handleSwipeClose = useCallback(() => {
    openSideRef.current = null;
    leftFullSwipeArmed.set(false);
    rightFullSwipeArmed.set(false);
    swipeHighlightActive.value = 0;
    setIsSwiping(false);
  }, [leftFullSwipeArmed, rightFullSwipeArmed, swipeHighlightActive]);

  const handleCommitStart = useCallback(() => {
    onWillOpen(swipeableRef.current);
    openSideRef.current = null;
    swipeHighlightActive.value = 1;
    setIsSwiping(true);
  }, [onWillOpen, swipeHighlightActive]);

  const rowAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{translateX: translateX.value}],
  }));

  const rowActiveBackgroundStyle = useAnimatedStyle(() => ({
    opacity: Math.max(
      swipeHighlightActive.value,
      interpolate(Math.abs(translateX.value), [0, 18, openDistance], [0, 0.74, 1], Extrapolation.CLAMP)
    ),
  }));

  const dividerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(Math.abs(translateX.value), [0, 12], [1, 0], Extrapolation.CLAMP),
  }));

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .activeOffsetX([-12, 12])
        .onTouchesDown(() => {
          swipeHighlightActive.value = 1;
        })
        .onTouchesUp(() => {
          if (translateX.value === 0) {
            swipeHighlightActive.value = 0;
          }
        })
        .onTouchesCancelled(() => {
          if (translateX.value === 0) {
            swipeHighlightActive.value = 0;
          }
        })
        .onStart(() => {
          dragStartX.value = translateX.value;
          runOnJS(handleSwipeStart)();
        })
        .onUpdate(event => {
          const rawValue = dragStartX.value + event.translationX;
          const minValue = -maxSwipeDistance;
          const maxValue = hasLeftAction ? maxSwipeDistance : 0;

          translateX.value = Math.min(Math.max(rawValue, minValue), maxValue);
        })
        .onEnd(event => {
          const value = translateX.value;
          const velocityX = event.velocityX;
          const shouldCommitLeft = hasLeftAction && value >= fullSwipeDistance;
          const shouldCommitRight = value <= -fullSwipeDistance;

          if (shouldCommitLeft) {
            runOnJS(handleCommitStart)();
            translateX.value = withTiming(commitDistance, {duration: COMMIT_ANIMATION_DURATION}, finished => {
              if (finished) {
                runOnJS(handleLeftAction)();
              }
            });
            return;
          }

          if (shouldCommitRight) {
            runOnJS(handleCommitStart)();
            translateX.value = withTiming(-commitDistance, {duration: COMMIT_ANIMATION_DURATION}, finished => {
              if (finished) {
                runOnJS(handleFullSwipeDelete)();
              }
            });
            return;
          }

          const shouldOpenLeft =
            hasLeftAction &&
            (value > openDistance * SWIPE_OPEN_THRESHOLD_RATIO || velocityX > SWIPE_VELOCITY_THRESHOLD);
          const shouldOpenRight =
            value < -openDistance * SWIPE_OPEN_THRESHOLD_RATIO || velocityX < -SWIPE_VELOCITY_THRESHOLD;

          if (shouldOpenLeft) {
            translateX.value = withSpring(openDistance, SWIPE_SPRING);
            runOnJS(markRowOpen)('left');
            return;
          }

          if (shouldOpenRight) {
            translateX.value = withSpring(-openDistance, SWIPE_SPRING);
            runOnJS(markRowOpen)('right');
            return;
          }

          translateX.value = withSpring(0, SWIPE_SPRING);
          runOnJS(handleSwipeClose)();
        }),
    [
      commitDistance,
      dragStartX,
      fullSwipeDistance,
      handleCommitStart,
      handleFullSwipeDelete,
      handleLeftAction,
      handleSwipeClose,
      handleSwipeStart,
      hasLeftAction,
      maxSwipeDistance,
      markRowOpen,
      openDistance,
      swipeHighlightActive,
      translateX,
    ]
  );

  const handleRowPress = () => {
    if (openSideRef.current) {
      closeRow();
      return;
    }

    onPress();
  };

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.swipeContainer}>
        {hasLeftAction && leftActionLabel ? (
          <View pointerEvents={isSwiping ? 'box-none' : 'none'} style={[styles.actionRail, styles.actionRailLeft]}>
            <PantrySwipeAction
              accessibilityLabel={leftActionLabel}
              armed={leftFullSwipeArmed}
              backgroundColor={SUCCESS_COLOR}
              fullSwipeDistance={fullSwipeDistance}
              icon={leftActionIcon}
              translation={translateX}
              side="left"
              onArmedChange={handleLeftArmedChange}
              onPress={handleLeftAction}
            />
          </View>
        ) : null}
        <View pointerEvents={isSwiping ? 'box-none' : 'none'} style={[styles.actionRail, styles.actionRailRight]}>
          <PantrySwipeAction
            accessibilityLabel="Delete"
            armed={rightFullSwipeArmed}
            backgroundColor={DESTRUCTIVE_COLOR}
            fullSwipeDistance={fullSwipeDistance}
            icon="trash-outline"
            translation={translateX}
            side="right"
            onArmedChange={handleRightArmedChange}
            onPress={handleDelete}
          />
        </View>
        <Animated.View style={[styles.childrenContainer, rowAnimatedStyle]}>
          <Pressable
            onPress={handleRowPress}
            onLayout={({nativeEvent}) => {
              setRowWidth(nativeEvent.layout.width);
            }}
            style={({pressed}) => [styles.row, pressed ? styles.rowPressed : null]}
          >
            <Animated.View pointerEvents="none" style={[styles.rowActiveBackground, rowActiveBackgroundStyle]} />
            <View style={styles.leadingBadge}>
              <Text style={styles.leadingBadgeText}>{item.name.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.copy}>
              <Text style={styles.title}>{item.name}</Text>
            </View>
            <View style={styles.trailing}>
              {item.expirationDate ? (
                <Text style={styles.expiration}>{formatExpirationLabel(item.expirationDate)}</Text>
              ) : null}
              {item.isInCart ? <Text style={styles.quantity}>{quantityLabel}</Text> : null}
            </View>
            {!isLast ? <Animated.View pointerEvents="none" style={[styles.divider, dividerAnimatedStyle]} /> : null}
          </Pressable>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    backgroundColor: 'transparent',
    overflow: 'hidden',
    position: 'relative',
  },
  childrenContainer: {
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  actionRail: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    zIndex: 0,
  },
  actionRailLeft: {
    alignItems: 'flex-start',
  },
  actionRailRight: {
    alignItems: 'flex-end',
  },
  row: {
    position: 'relative',
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
    borderRadius: 18,
    overflow: 'hidden',
  },
  rowActiveBackground: {
    ...StyleSheet.absoluteFill,
    backgroundColor: appColors.listRowEmphasized,
  },
  rowPressed: {
    backgroundColor: appColors.rowPressed,
  },
  divider: {
    position: 'absolute',
    left: 70,
    right: 0,
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: appColors.border,
  },
  leadingBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.tintSoft,
  },
  leadingBadgeText: {
    color: appColors.tint,
    fontSize: 17,
    fontWeight: '800',
  },
  copy: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: appColors.text,
  },
  trailing: {
    alignItems: 'flex-end',
    gap: 6,
    maxWidth: 108,
  },
  expiration: {
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
    color: appColors.muted,
  },
  quantity: {
    fontSize: 16,
    lineHeight: 19,
    fontWeight: '800',
    color: appColors.accent,
  },
});
