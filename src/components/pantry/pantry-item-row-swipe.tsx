import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, type ColorValue } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  runOnJS,
  useAnimatedReaction,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { appColors } from '@/lib/theme';

const ACTION_CIRCLE_SIZE = 56;
const ACTION_GAP = 10;
const ACTION_OPEN_DISTANCE = ACTION_CIRCLE_SIZE + ACTION_GAP;

type PantrySwipeActionProps = {
  accessibilityLabel: string;
  backgroundColor: ColorValue;
  icon: keyof typeof Ionicons.glyphMap;
  translation: SharedValue<number>;
  side: 'left' | 'right';
  onPress: () => void;
  onSwipeStateChange: (value: boolean) => void;
};

export function PantrySwipeAction({
  accessibilityLabel,
  backgroundColor,
  icon,
  translation,
  side,
  onPress,
  onSwipeStateChange,
}: PantrySwipeActionProps) {
  useAnimatedReaction(
    () => translation.value,
    (value, previousValue) => {
      const absValue = Math.abs(value);
      const absPreviousValue = Math.abs(previousValue ?? 0);

      const wasSwiping = absPreviousValue > 0;
      const isSwiping = absValue > 0;
      if (wasSwiping !== isSwiping) {
        runOnJS(onSwipeStateChange)(isSwiping);
      }
    },
    [onSwipeStateChange]
  );

  const slotStyle = useAnimatedStyle(() => {
    const absValue = Math.abs(translation.value);

    return {
      opacity: interpolate(absValue, [0, 16, ACTION_OPEN_DISTANCE], [0, 0.85, 1], Extrapolation.CLAMP),
    };
  });

  const surfaceStyle = useAnimatedStyle(() => {
    const absValue = Math.abs(translation.value);

    return {
      transform: [
        {
          scale: interpolate(absValue, [0, 16, ACTION_OPEN_DISTANCE], [0.88, 0.95, 1], Extrapolation.CLAMP),
        },
      ],
    };
  });

  const iconScaleStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: interpolate(
          Math.abs(translation.value),
          [0, 16, ACTION_OPEN_DISTANCE],
          [0.8, 0.9, 1],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.slot, side === 'left' ? styles.slotLeft : styles.slotRight, slotStyle]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel}
        onPress={onPress}
        style={styles.pressable}
      >
        <Animated.View style={[styles.surface, {backgroundColor}, surfaceStyle]}>
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

const styles = StyleSheet.create({
  slot: {
    width: ACTION_OPEN_DISTANCE,
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
