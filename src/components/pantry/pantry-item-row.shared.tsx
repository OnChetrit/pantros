import type { GestureResponderEvent } from 'react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PantryItem } from '@/domain/models';
import { formatExpirationLabel } from '@/lib/pantry-insights';
import { appColors } from '@/lib/theme';

export type PantryItemRowProps = {
  item: PantryItem;
  displayMode?: 'pantry' | 'cart';
  isLast: boolean;
  onPress: () => void;
  onEdit: () => void;
  leftActionLabel?: string;
  onLeftAction?: () => void;
  onDelete: () => void;
  isSelectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelection?: () => void;
  onStartSelection?: () => void;
};

type PantryItemRowContentProps = {
  item: PantryItem;
  displayMode: 'pantry' | 'cart';
  isLast: boolean;
  onPress: () => void;
  onLongPress?: (event: GestureResponderEvent) => void;
  nativeListItem?: boolean;
  isSelectionMode?: boolean;
  isSelected?: boolean;
};

export function getCartActionSystemImage(item: PantryItem) {
  return item.isInCart ? 'cart.badge.minus' : 'cart.badge.plus';
}

export function PantryItemRowContent({
  item,
  displayMode,
  isLast,
  onPress,
  onLongPress,
  nativeListItem = false,
  isSelectionMode = false,
  isSelected = false,
}: PantryItemRowContentProps) {
  const showExpiration = displayMode !== 'cart' && Boolean(item.expirationDate);
  const showQuantity = displayMode === 'cart';
  const showSelectionState = displayMode === 'cart' && isSelectionMode;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={280}
      style={[
        styles.row,
        nativeListItem ? styles.rowNativeList : null,
        showSelectionState ? styles.rowSelectionMode : null,
        isSelected ? styles.rowSelected : null,
      ]}
    >
      {showSelectionState ? (
        <View
          style={[
            styles.selectionIndicator,
            styles.selectionIndicatorVisible,
            isSelected ? styles.selectionIndicatorSelected : null,
          ]}
        >
          {isSelected ? <View style={styles.selectionIndicatorInner} /> : null}
        </View>
      ) : null}
      <View style={styles.leadingBadge}>
        <Text style={styles.leadingBadgeText}>{item.name.charAt(0).toUpperCase()}</Text>
      </View>
      <View style={styles.copy}>
        <Text numberOfLines={1} style={styles.title}>
          {item.name}
        </Text>
      </View>
      <View style={styles.trailing}>
        {showExpiration ? <Text style={styles.expiration}>{formatExpirationLabel(item.expirationDate)}</Text> : null}
        {showQuantity ? <Text style={styles.quantity}>{String(item.quantity)}</Text> : null}
      </View>
      {!isLast && !nativeListItem ? <View pointerEvents="none" style={styles.divider} /> : null}
    </Pressable>
  );
}

export const rowStyles = StyleSheet.create({
  contextMenuHost: {
    // width: '100%',
  },
  nativeListHost: {
    // alignSelf: 'stretch',
    // width: '100%',
    // maxWidth: '100%',
  },
});

const styles = StyleSheet.create({
  row: {
    // position: 'relative',
    // minHeight: 64,
    // alignSelf: 'stretch',
    // minWidth: 0,
    paddingHorizontal: 32,
    // paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'transparent',
    minHeight: 60,
  },
  rowNativeList: {
    // minHeight: 60,
    // paddingHorizontal: 0,
    // paddingVertical: 8,
    // alignSelf: 'stretch',
  },
  rowSelectionMode: {
    paddingLeft: 20,
    paddingRight: 24,
  },
  rowSelected: {
    backgroundColor: appColors.tintSoft,
  },
  selectionIndicator: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: appColors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  selectionIndicatorVisible: {
    opacity: 1,
  },
  selectionIndicatorSelected: {
    borderColor: appColors.tint,
    backgroundColor: appColors.tintSoft,
  },
  selectionIndicatorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: appColors.tint,
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
    width: 36,
    height: 36,
    borderRadius: 18,
    // flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.tintSoft,
  },
  leadingBadgeText: {
    color: appColors.tint,
    fontSize: 15,
    fontWeight: '700',
  },
  copy: {
    flex: 1,
    minWidth: 0,
    flexShrink: 1,
  },
  title: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '600',
    color: appColors.text,
  },
  trailing: {
    minWidth: 0,
    flexShrink: 0,
    alignItems: 'flex-end',
    gap: 2,
    maxWidth: 84,
    marginLeft: 8,
  },
  expiration: {
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'right',
    color: appColors.muted,
    flexShrink: 1,
  },
  quantity: {
    minWidth: 28,
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
    color: appColors.accent,
    textAlign: 'right',
  },
});
