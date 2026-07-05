import { ListItem } from '@expo/ui';
import { ContextMenu, Button as SwiftUIButton, SwipeActions, Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, frame, shapes } from '@expo/ui/swift-ui/modifiers';
import { Alert } from 'react-native';

import { triggerMediumImpact } from '@/lib/haptics';
import { formatExpirationLabel } from '@/lib/pantry-insights';

import { getCartActionSystemImage, type PantryItemRowProps } from '../pantry-item-row/pantry-item-row.shared';

type PantryItemSwipeRowProps = PantryItemRowProps & {
  nativeListItem?: boolean;
};

export function PantryItemSwipeRow({
  item,
  displayMode = 'pantry',
  onPress,
  onEdit,
  onReviewExpiration,
  onReviewQuantity,
  leftActionLabel,
  onLeftAction,
  onDelete,
  isSelectionMode = false,
  isSelected = false,
  onToggleSelection,
  onStartSelection,
  nativeListItem = false,
}: PantryItemSwipeRowProps) {
  const hasLeftAction = Boolean(onLeftAction && leftActionLabel);

  const confirmDelete = () => {
    void triggerMediumImpact();
    Alert.alert('Delete Item', `Delete "${item.name}"?`, [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: onDelete,
      },
    ]);
  };

  const handleEditAction = () => {
    void triggerMediumImpact();
    onEdit();
  };

  const handleLeftAction = () => {
    void triggerMediumImpact();
    onLeftAction?.();
  };

  const handleReviewExpiration = () => {
    void triggerMediumImpact();
    onReviewExpiration?.();
  };

  const handleReviewQuantity = () => {
    void triggerMediumImpact();
    onReviewQuantity?.();
  };

  const menuTrigger = (
    <ListItem
      onPress={isSelectionMode ? (onToggleSelection ?? onPress) : onPress}
      leading={
        <Text
          modifiers={[
            font({weight: 'bold', size: 15}),
            foregroundStyle(isSelected && isSelectionMode ? 'secondaryLabel' : '#0A84FF'),
            frame({width: 36, height: 36}),
            background(isSelected && isSelectionMode ? '#F1F2F4' : '#EAF2FF', shapes.circle()),
          ]}
        >
          {item.name.charAt(0).toUpperCase()}
        </Text>
      }
      trailing={
        displayMode === 'cart' ? (
          <VStack alignment="trailing" spacing={2}>
            <Text
              modifiers={[
                font({weight: 'bold', size: 15}),
                foregroundStyle(isSelected && isSelectionMode ? 'secondaryLabel' : '#34C759'),
              ]}
            >
              {String(item.quantity)}
            </Text>
          </VStack>
        ) : item.expirationDate ? (
          <VStack alignment="trailing" spacing={2}>
            <Text modifiers={[foregroundStyle('secondaryLabel'), font({size: 13})]}>
              {formatExpirationLabel(item.expirationDate)}
            </Text>
          </VStack>
        ) : undefined
      }
    >
      <Text
        modifiers={[
          font({weight: 'semibold', size: 17}),
          foregroundStyle(isSelected && isSelectionMode ? 'secondaryLabel' : 'label'),
        ]}
      >
        {item.name}
      </Text>
    </ListItem>
  );

  const contextMenu = (
    <ContextMenu>
      <ContextMenu.Trigger>{menuTrigger}</ContextMenu.Trigger>
      <ContextMenu.Items>
        <SwiftUIButton label="Edit item" systemImage="pencil" onPress={handleEditAction} />
        {displayMode === 'cart' ? (
          <SwiftUIButton label="Update quantity" systemImage="number.circle" onPress={handleReviewQuantity} />
        ) : (
          <SwiftUIButton label="Review expiration" systemImage="clock" onPress={handleReviewExpiration} />
        )}
        {hasLeftAction ? (
          <SwiftUIButton
            label={leftActionLabel}
            systemImage={getCartActionSystemImage(item)}
            onPress={handleLeftAction}
          />
        ) : null}
        <SwiftUIButton label="Delete item" role="destructive" systemImage="trash" onPress={confirmDelete} />
      </ContextMenu.Items>
    </ContextMenu>
  );

  if (nativeListItem && onStartSelection && isSelectionMode) {
    return <SwipeActions>{menuTrigger}</SwipeActions>;
  }

  if (onStartSelection && isSelectionMode) {
    return menuTrigger;
  }

  const swipeActions = (
    <SwipeActions>
      {onStartSelection ? menuTrigger : contextMenu}
      {hasLeftAction ? (
        <SwipeActions.Actions edge="leading" allowsFullSwipe>
          <SwiftUIButton label="" systemImage={getCartActionSystemImage(item)} onPress={handleLeftAction} />
          {displayMode === 'cart' ? (
            <SwiftUIButton label="" role="cancel" systemImage="number.circle" onPress={handleReviewQuantity} />
          ) : (
            <SwiftUIButton label="" role="cancel" systemImage="clock" onPress={handleReviewExpiration} />
          )}
        </SwipeActions.Actions>
      ) : null}
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <SwiftUIButton label="" role="destructive" systemImage="trash" onPress={confirmDelete} />
      </SwipeActions.Actions>
    </SwipeActions>
  );

  if (nativeListItem || onStartSelection) {
    return swipeActions;
  }

  return contextMenu;
}
