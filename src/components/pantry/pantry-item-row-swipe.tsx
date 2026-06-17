import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type ColorValue } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  withSpring,
  type SharedValue,
} from 'react-native-reanimated';

import { appColors } from '@/lib/theme';

const ACTION_CIRCLE_SIZE = 56;
const ACTION_GAP = 10;
const ACTION_OPEN_DISTANCE = ACTION_CIRCLE_SIZE + ACTION_GAP;
const FULL_SWIPE_MIN_DISTANCE = ACTION_OPEN_DISTANCE * 2.35;
const FULL_SWIPE_ROW_RATIO = 0.62;
const ACTION_MIN_VISIBLE_WIDTH = 8;
const ACTION_SCALE_DISTANCE = 60;

type PantrySwipeActionProps = {
  accessibilityLabel: string;
  armed: SharedValue<boolean>;
  backgroundColor: ColorValue;
  fullSwipeDistance: number;
  icon: keyof typeof Ionicons.glyphMap;
  translation: SharedValue<number>;
  side: 'left' | 'right';
  onArmedChange: (isArmed: boolean) => void;
  onPress: () => void;
};

export function PantrySwipeAction({
  accessibilityLabel,
  armed,
  backgroundColor,
  fullSwipeDistance,
  icon,
  translation,
  side,
  onArmedChange,
  onPress,
}: PantrySwipeActionProps) {
  const isArmed = useDerivedValue(() =>
    side === 'left'
      ? translation.value >= fullSwipeDistance
      : translation.value <= -fullSwipeDistance
  );

  const armedProgress = useDerivedValue(() =>
    withSpring(isArmed.value ? 1 : 0, {
      damping: 18,
      stiffness: 280,
      mass: 0.65,
      overshootClamping: true,
    })
  );

  useAnimatedReaction(
    () => isArmed.value,
    (isArmed, wasArmed) => {
      armed.value = isArmed;

      if (isArmed !== wasArmed) {
        runOnJS(onArmedChange)(isArmed);
      }
    },
    [armed, isArmed, onArmedChange]
  );

  const slotStyle = useAnimatedStyle(() => {
    const directionalValue =
      side === 'left' ? Math.max(translation.value, 0) : Math.max(-translation.value, 0);

    return {
      opacity: interpolate(
        directionalValue,
        [0, 18, ACTION_SCALE_DISTANCE],
        [0, 0.6, 1],
        Extrapolation.CLAMP
      ),
    };
  });

  const surfaceStyle = useAnimatedStyle(() => {
    const directionalValue =
      side === 'left' ? Math.max(translation.value, 0) : Math.max(-translation.value, 0);
    const width = Math.max(
      ACTION_MIN_VISIBLE_WIDTH,
      directionalValue > ACTION_OPEN_DISTANCE ? directionalValue - ACTION_GAP : ACTION_CIRCLE_SIZE
    );

    return {
      width,
      borderRadius: interpolate(
        width,
        [ACTION_CIRCLE_SIZE, fullSwipeDistance],
        [ACTION_CIRCLE_SIZE / 2, 18],
        Extrapolation.CLAMP
      ),
      transform: [
        {
          scale: interpolate(
            directionalValue,
            [0, 18, ACTION_SCALE_DISTANCE],
            [0, 0.72, 1],
            Extrapolation.CLAMP
          ),
        },
      ],
    };
  });

  const iconScaleStyle = useAnimatedStyle(() => {
    const direction = side === 'left' ? 1 : -1;
    const directionalValue =
      side === 'left' ? Math.max(translation.value, 0) : Math.max(-translation.value, 0);
    const stretchedWidth =
      directionalValue > ACTION_OPEN_DISTANCE ? directionalValue - ACTION_GAP : ACTION_CIRCLE_SIZE;
    const endOffset = (stretchedWidth - ACTION_CIRCLE_SIZE) / 2;

    return {
      transform: [
        {
          translateX: direction * endOffset * armedProgress.value,
        },
        {
          scale: 1 + 0.14 * armedProgress.value,
        },
      ],
    };
  });

  return (
    <Animated.View style={[styles.slot, side === 'left' ? styles.slotLeft : styles.slotRight, slotStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={styles.pressable}
      >
        <Animated.View
          style={[
            styles.surface,
            side === 'left' ? styles.surfaceLeft : styles.surfaceRight,
            { backgroundColor },
            surfaceStyle,
          ]}
        >
          <Animated.View style={[styles.iconWrap, iconScaleStyle]}>
            <Animated.View style={styles.iconLayer}>
              <Ionicons name={icon} size={24} color={appColors.textInverse} />
            </Animated.View>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

export { ACTION_OPEN_DISTANCE as PANTRY_SWIPE_OPEN_DISTANCE };
export function getPantryFullSwipeDistance(rowWidth: number) {
  return Math.max(FULL_SWIPE_MIN_DISTANCE, rowWidth * FULL_SWIPE_ROW_RATIO);
}

const styles = StyleSheet.create({
  slot: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    overflow: 'visible',
  },
  slotLeft: {
    paddingRight: ACTION_GAP,
  },
  slotRight: {
    paddingLeft: ACTION_GAP,
  },
  pressable: {
    flex: 1,
    justifyContent: 'center',
  },
  surface: {
    width: ACTION_CIRCLE_SIZE,
    height: ACTION_CIRCLE_SIZE,
    borderRadius: ACTION_CIRCLE_SIZE / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  surfaceLeft: {
    alignSelf: 'flex-start',
  },
  surfaceRight: {
    alignSelf: 'flex-end',
  },
  iconWrap: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconLayer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
