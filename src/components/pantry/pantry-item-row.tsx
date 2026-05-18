import { Ionicons } from '@expo/vector-icons';
import type { PantryItem } from '@/domain/models';
import { useRef, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import ReanimatedSwipeable, {
  type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';

import {
  PANTRY_SWIPE_OPEN_DISTANCE,
  PantrySwipeAction,
} from '@/components/pantry/pantry-item-row-swipe';
import { appColors } from '@/lib/theme';
import { formatExpirationLabel } from '@/lib/pantry-insights';
import { triggerMediumImpact } from '@/lib/haptics';

const SUCCESS_COLOR = '#34C759';
const DESTRUCTIVE_COLOR = '#FF3B30';

type PantryItemRowProps = {
  item: PantryItem;
  cartName?: string | null;
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
  cartName,
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
  const [isSwiping, setIsSwiping] = useState(false);
  const quantityLabel = String(item.quantity);
  const meta = item.isInCart ? cartName : null;
  const openDistance = PANTRY_SWIPE_OPEN_DISTANCE;

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

  const closeRow = () => {
    swipeableRef.current?.close();
  };

  const handleDelete = () => {
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
  };

  const handleLeftAction = () => {
    withActionLock(() => {
      void triggerMediumImpact();
      closeRow();
      onLeftAction?.();
    });
  };

  return (
    <ReanimatedSwipeable
      ref={swipeableRef}
      friction={1.05}
      overshootLeft={false}
      overshootRight={false}
      dragOffsetFromLeftEdge={12}
      dragOffsetFromRightEdge={12}
      leftThreshold={openDistance / 2}
      rightThreshold={openDistance / 2}
      onSwipeableWillOpen={() => {
        onWillOpen(swipeableRef.current);
      }}
      onSwipeableClose={() => {
        setIsSwiping(false);
      }}
      renderLeftActions={
        !onLeftAction || !leftActionLabel
          ? undefined
          : (_progress, translation) => (
              <PantrySwipeAction
                accessibilityLabel={leftActionLabel}
                backgroundColor={SUCCESS_COLOR}
                icon={leftActionIcon}
                translation={translation}
                side="left"
                onPress={handleLeftAction}
                onSwipeStateChange={setIsSwiping}
              />
            )
      }
      renderRightActions={(_progress, translation) => (
        <PantrySwipeAction
          accessibilityLabel="Delete"
          backgroundColor={DESTRUCTIVE_COLOR}
          icon="trash-outline"
          translation={translation}
          side="right"
          onPress={handleDelete}
          onSwipeStateChange={setIsSwiping}
        />
      )}
      containerStyle={styles.swipeContainer}
      childrenContainerStyle={styles.childrenContainer}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.row,
          isSwiping ? styles.rowSwiping : null,
          pressed ? styles.rowPressed : null,
        ]}
      >
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
        {!isLast ? <View pointerEvents="none" style={styles.divider} /> : null}
      </Pressable>
    </ReanimatedSwipeable>
  );
}

const styles = StyleSheet.create({
  swipeContainer: {
    backgroundColor: 'transparent',
  },
  childrenContainer: {
    backgroundColor: 'transparent',
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
  rowPressed: {
    backgroundColor: appColors.rowPressed,
  },
  rowSwiping: {
    backgroundColor: appColors.listRowEmphasized,
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
});
