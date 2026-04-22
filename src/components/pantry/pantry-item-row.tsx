import { Ionicons } from '@expo/vector-icons';
import type { PantryItem } from '@/domain/models';
import { useRef } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ColorValue } from 'react-native';
import ReanimatedSwipeable, {
  SwipeDirection,
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { appColors } from '@/lib/theme';
import { formatExpirationLabel } from '@/lib/pantry-insights';

const IOS_ACTION_WIDTH = 80;
const IOS_ACTION_EXPANDED_WIDTH = 168;
const ACTION_OPEN_THRESHOLD = 40;
const ACTION_TRIGGER_THRESHOLD = 132;
const ACTION_EXPANDED_VISUAL_DISTANCE = 156;
const ACTION_EXPANDED_GROWTH_MULTIPLIER = 2.4;
const IOS_SUCCESS_COLOR = '#34C759';
const IOS_SUCCESS_ARMED_COLOR = '#30B357';
const IOS_DESTRUCTIVE_COLOR = '#FF3B30';
const IOS_DESTRUCTIVE_ARMED_COLOR = '#E02F26';

type PantryItemRowProps = {
  item: PantryItem;
  cartName?: string | null;
  isFirst: boolean;
  isLast: boolean;
  onPress: () => void;
  leftActionLabel?: string;
  leftActionIcon?: keyof typeof Ionicons.glyphMap;
  leftActionIconArmed?: keyof typeof Ionicons.glyphMap;
  onLeftAction?: () => void;
  onDelete: () => void;
  onWillOpen: (row: SwipeableMethods | null) => void;
};

type SwipeActionVisualProps = {
  backgroundColor: ColorValue;
  armedBackgroundColor: ColorValue;
  icon: keyof typeof Ionicons.glyphMap;
  armedIcon: keyof typeof Ionicons.glyphMap;
  translation: SharedValue<number>;
  side: 'left' | 'right';
  onTranslationChange: (value: number) => void;
};

function SwipeActionVisual({
  backgroundColor,
  armedBackgroundColor,
  icon,
  armedIcon,
  translation,
  side,
  onTranslationChange,
}: SwipeActionVisualProps) {
  const getExpandedDistance = (swipeDistance: number) => {
    'worklet';

    if (swipeDistance <= ACTION_TRIGGER_THRESHOLD) {
      return swipeDistance;
    }

    return ACTION_TRIGGER_THRESHOLD + (swipeDistance - ACTION_TRIGGER_THRESHOLD) * ACTION_EXPANDED_GROWTH_MULTIPLIER;
  };

  const getVisualWidth = (swipeDistance: number) => {
    'worklet';

    return interpolate(
      getExpandedDistance(swipeDistance),
      [0, IOS_ACTION_WIDTH, ACTION_TRIGGER_THRESHOLD, ACTION_EXPANDED_VISUAL_DISTANCE],
      [0, IOS_ACTION_WIDTH, IOS_ACTION_WIDTH, IOS_ACTION_EXPANDED_WIDTH],
      Extrapolation.CLAMP,
    );
  };

  useAnimatedReaction(
    () => translation.value,
    (value, previousValue) => {
      if (value !== previousValue) {
        runOnJS(onTranslationChange)(value);
      }
    },
    [onTranslationChange],
  );

  const actionSurfaceStyle = useAnimatedStyle(() => {
    const swipeDistance = Math.abs(translation.value);
    const visualWidth = getVisualWidth(swipeDistance);
    const baseWidth = Math.min(visualWidth, IOS_ACTION_WIDTH);
    const extensionScale = visualWidth > IOS_ACTION_WIDTH ? visualWidth / IOS_ACTION_WIDTH : 1;
    const extraWidth = Math.max(visualWidth - IOS_ACTION_WIDTH, 0);
    const anchoredTranslateX = visualWidth > IOS_ACTION_WIDTH ? (side === 'left' ? extraWidth / 2 : -extraWidth / 2) : 0;

    return {
      width: baseWidth,
      opacity: swipeDistance > 0 ? 1 : 0,
      transform: [{ translateX: anchoredTranslateX }, { scaleX: extensionScale }],
    };
  });

  const baseFillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      getExpandedDistance(Math.abs(translation.value)),
      [0, IOS_ACTION_WIDTH, ACTION_TRIGGER_THRESHOLD, ACTION_EXPANDED_VISUAL_DISTANCE],
      [1, 1, 1, 0],
      Extrapolation.CLAMP,
    ),
  }));
  const armedFillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      getExpandedDistance(Math.abs(translation.value)),
      [0, IOS_ACTION_WIDTH, ACTION_TRIGGER_THRESHOLD, ACTION_EXPANDED_VISUAL_DISTANCE],
      [0, 0, 0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const outlineIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      getExpandedDistance(Math.abs(translation.value)),
      [0, 16, IOS_ACTION_WIDTH],
      [0, 0.78, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const filledIconStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      getExpandedDistance(Math.abs(translation.value)),
      [0, ACTION_TRIGGER_THRESHOLD, ACTION_EXPANDED_VISUAL_DISTANCE],
      [0, 0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const iconWrapStyle = useAnimatedStyle(() => ({
    transform: (() => {
      const swipeDistance = Math.abs(translation.value);
      const visualWidth = getVisualWidth(swipeDistance);
      const extraWidth = Math.max(visualWidth - IOS_ACTION_WIDTH, 0);
      const anchoredTranslateX = visualWidth > IOS_ACTION_WIDTH ? (side === 'left' ? extraWidth / 2 : -extraWidth / 2) : 0;

      return [
        { translateX: anchoredTranslateX },
        {
          scale: interpolate(
            getExpandedDistance(swipeDistance),
            [0, 16, IOS_ACTION_WIDTH, ACTION_EXPANDED_VISUAL_DISTANCE],
            [0.72, 0.86, 1, 1.05],
            Extrapolation.CLAMP,
          ),
        },
      ];
    })(),
  }));

  return (
    <Animated.View
      style={[
        styles.actionSurface,
        side === 'left' ? styles.actionSurfaceLeft : styles.actionSurfaceRight,
        actionSurfaceStyle,
      ]}
    >
      <Animated.View style={[styles.actionFill, { backgroundColor }, baseFillStyle]} />
      <Animated.View style={[styles.actionFill, { backgroundColor: armedBackgroundColor }, armedFillStyle]} />
      <Animated.View
        style={[
          styles.actionIconWrap,
          iconWrapStyle,
        ]}
      >
        <Animated.View style={[styles.actionIconLayer, outlineIconStyle]}>
          <Ionicons name={icon} size={24} color={appColors.textInverse} />
        </Animated.View>
        <Animated.View style={[styles.actionIconLayer, filledIconStyle]}>
          <Ionicons name={armedIcon} size={24} color={appColors.textInverse} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

export function PantryItemRow({
  item,
  cartName,
  isFirst,
  isLast,
  onPress,
  leftActionLabel,
  leftActionIcon = 'cart-outline',
  leftActionIconArmed = 'cart',
  onLeftAction,
  onDelete,
  onWillOpen,
}: PantryItemRowProps) {
  const swipeableRef = useRef<SwipeableMethods | null>(null);
  const actionLockRef = useRef(false);
  const lastTranslationRef = useRef(0);
  const quantityLabel = String(item.quantity);
  const meta = item.isInCart ? cartName : null;

  const withActionLock = (action: () => void) => {
    if (actionLockRef.current) {
      return;
    }

    actionLockRef.current = true;
    action();

    setTimeout(() => {
      actionLockRef.current = false;
    }, 350);
  };

  const handleDelete = () => {
    withActionLock(() => {
      Alert.alert('Delete Item', `Delete "${item.name}"?`, [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            swipeableRef.current?.close();
          },
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            swipeableRef.current?.close();
            onDelete();
          },
        },
      ]);
    });
  };

  const handleLeftAction = () => {
    withActionLock(() => {
      swipeableRef.current?.close();
      onLeftAction?.();
    });
  };

  const handleActionRelease = (direction: SwipeDirection) => {
    const releaseTranslation = lastTranslationRef.current;

    if (direction === SwipeDirection.RIGHT && onLeftAction && releaseTranslation >= ACTION_TRIGGER_THRESHOLD) {
      handleLeftAction();
    }

    if (direction === SwipeDirection.LEFT && releaseTranslation <= -ACTION_TRIGGER_THRESHOLD) {
      handleDelete();
    }
  };

  const renderSwipeAction = ({
    accessibilityLabel,
    backgroundColor,
    armedBackgroundColor,
    icon,
    armedIcon,
    translation,
    side,
    onPress,
  }: {
    accessibilityLabel: string;
    backgroundColor: ColorValue;
    armedBackgroundColor: ColorValue;
    icon: keyof typeof Ionicons.glyphMap;
    armedIcon: keyof typeof Ionicons.glyphMap;
    translation: SharedValue<number>;
    side: 'left' | 'right';
    onPress: () => void;
  }) => {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={styles.action}
      >
        <SwipeActionVisual
          backgroundColor={backgroundColor}
          armedBackgroundColor={armedBackgroundColor}
          icon={icon}
          armedIcon={armedIcon}
          translation={translation}
          side={side}
          onTranslationChange={(value) => {
            lastTranslationRef.current = value;
          }}
        />
      </Pressable>
    );
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={1}
      overshootLeft={Boolean(onLeftAction)}
      overshootRight
      overshootFriction={10}
      dragOffsetFromLeftEdge={12}
      dragOffsetFromRightEdge={12}
      leftThreshold={ACTION_OPEN_THRESHOLD}
      rightThreshold={ACTION_OPEN_THRESHOLD}
      onSwipeableWillOpen={(direction) => {
        onWillOpen(swipeableRef.current);
        handleActionRelease(direction);
      }}
      onSwipeableClose={() => {
        lastTranslationRef.current = 0;
      }}
      renderLeftActions={
        !onLeftAction || !leftActionLabel
          ? undefined
          : (_progress, translation) =>
              renderSwipeAction({
                accessibilityLabel: leftActionLabel,
                backgroundColor: IOS_SUCCESS_COLOR,
                armedBackgroundColor: IOS_SUCCESS_ARMED_COLOR,
                icon: leftActionIcon,
                armedIcon: leftActionIconArmed,
                translation,
                side: 'left',
                onPress: handleLeftAction,
              })
      }
      renderRightActions={(_progress, translation) =>
        renderSwipeAction({
          accessibilityLabel: 'Delete',
          backgroundColor: IOS_DESTRUCTIVE_COLOR,
          armedBackgroundColor: IOS_DESTRUCTIVE_ARMED_COLOR,
          icon: 'trash-outline',
          armedIcon: 'trash',
          translation,
          side: 'right',
          onPress: handleDelete,
        })
      }
      containerStyle={[
        styles.swipeContainer,
        isFirst ? styles.firstRow : null,
        isLast ? styles.lastRow : styles.middleRow,
      ]}
      childrenContainerStyle={styles.childrenContainer}
    >
      <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed ? styles.rowPressed : null]}>
        <View style={styles.leadingBadge}>
          <Text style={styles.leadingBadgeText}>{item.name.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>{item.name}</Text>
          {meta ? <Text style={styles.subtitle}>{meta}</Text> : null}
        </View>
        <View style={styles.trailing}>
          {item.expirationDate ? <Text style={styles.expiration}>{formatExpirationLabel(item.expirationDate)}</Text> : null}
          {item.isInCart ? <Text style={styles.cartBadge}>{quantityLabel}</Text> : null}
        </View>
      </Pressable>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    backgroundColor: appColors.card,
    marginHorizontal: 16,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderLeftColor: appColors.border,
    borderRightColor: appColors.border,
  },
  firstRow: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderTopColor: appColors.border,
  },
  childrenContainer: {
    backgroundColor: appColors.card,
  },
  middleRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appColors.border,
  },
  lastRow: {
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    borderBottomWidth: 1,
    borderBottomColor: appColors.border,
  },
  row: {
    minHeight: 72,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: appColors.card,
  },
  rowPressed: {
    backgroundColor: appColors.rowPressed,
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
  subtitle: {
    fontSize: 13,
    lineHeight: 18,
    color: appColors.muted,
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
  cartBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: appColors.accent,
    backgroundColor: appColors.accentSoft,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  action: {
    width: IOS_ACTION_WIDTH,
    height: '100%',
    overflow: 'visible',
    justifyContent: 'center',
    position: 'relative',
  },
  actionSurface: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: IOS_ACTION_WIDTH,
    overflow: 'hidden',
    justifyContent: 'center',
  },
  actionSurfaceLeft: {
    left: 0,
  },
  actionSurfaceRight: {
    right: 0,
  },
  actionFill: {
    ...StyleSheet.absoluteFillObject,
  },
  actionIconWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIconLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
