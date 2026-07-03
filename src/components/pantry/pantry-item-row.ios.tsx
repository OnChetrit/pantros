import { ListItem } from '@expo/ui';
import type { MenuAction } from '@expo/ui/community/menu';
import { MenuView } from '@expo/ui/community/menu';
import { Button as SwiftUIButton, Text, SwipeActions, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, frame, shapes } from '@expo/ui/swift-ui/modifiers';
import { Alert } from 'react-native';

import { triggerMediumImpact } from '@/lib/haptics';
import { formatExpirationLabel } from '@/lib/pantry-insights';

import {
  getCartActionSystemImage,
  rowStyles,
  type PantryItemRowProps,
} from './pantry-item-row.shared';

export function PantryItemRow({...props}: PantryItemRowProps) {
  return <PantryItemSwipeRow {...props} />;
}

export function PantryItemNativeListRow({...props}: PantryItemRowProps) {
  return <PantryItemSwipeRow {...props} nativeListItem />;
}

type PantryItemSwipeRowProps = PantryItemRowProps & {
  nativeListItem?: boolean;
};

function PantryItemSwipeRow({
  item,
  displayMode = 'pantry',
  isLast,
  onPress,
  onEdit,
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

  const menuActions: MenuAction[] = [
    {id: 'edit', title: 'Edit item', image: 'pencil' as const},
    ...(hasLeftAction
      ? [{id: 'left-action', title: leftActionLabel!, image: getCartActionSystemImage(item) as MenuAction['image']}]
      : []),
    {
      id: 'delete',
      title: 'Delete item',
      image: 'trash' as const,
      attributes: {destructive: true},
    },
  ];

  const handleMenuAction = ({nativeEvent: {event}}: {nativeEvent: {event: string}}) => {
    if (event === 'edit') {
      handleEditAction();
      return;
    }

    if (event === 'left-action') {
      handleLeftAction();
      return;
    }

    if (event === 'delete') {
      confirmDelete();
    }
  };

  const selectionStatus =
    displayMode === 'cart' && isSelectionMode ? (isSelected ? 'Selected' : 'Tap to select') : undefined;

  const menuTrigger = (
    <ListItem
      onPress={isSelectionMode ? (onToggleSelection ?? onPress) : onPress}
      leading={
        <Text
          modifiers={[
            font({weight: 'bold', size: 15}),
            foregroundStyle('#0A84FF'),
            frame({width: 36, height: 36}),
            background('#EAF2FF', shapes.circle()),
          ]}
        >
          {item.name.charAt(0).toUpperCase()}
        </Text>
      }
      trailing={
        displayMode === 'cart' ? (
          <VStack alignment="trailing" spacing={2}>
            <Text modifiers={[font({weight: 'bold', size: 15}), foregroundStyle('#34C759')]}>
              {String(item.quantity)}
            </Text>
            {isSelectionMode ? (
              <Text modifiers={[font({size: 12}), foregroundStyle(isSelected ? '#0A84FF' : 'secondaryLabel')]}>
                {isSelected ? 'Selected' : ''}
              </Text>
            ) : null}
          </VStack>
        ) : item.expirationDate ? (
          <Text modifiers={[foregroundStyle('secondaryLabel'), font({size: 13})]}>
            {formatExpirationLabel(item.expirationDate)}
          </Text>
        ) : undefined
      }
      supportingText={selectionStatus}
    >
      <Text modifiers={[font({weight: 'semibold', size: 17})]}>{item.name}</Text>
    </ListItem>
  );

  if (nativeListItem && onStartSelection && isSelectionMode) {
    return <SwipeActions>{menuTrigger}</SwipeActions>;
  }

  if (onStartSelection && isSelectionMode) {
    return menuTrigger;
  }

  const swipeActions = (
    <SwipeActions>
      {onStartSelection ? (
        menuTrigger
      ) : (
        <MenuView
          actions={menuActions}
          onPressAction={handleMenuAction}
          shouldOpenOnLongPress
          style={rowStyles.nativeListHost}
        >
          {menuTrigger}
        </MenuView>
      )}
      {hasLeftAction ? (
        <SwipeActions.Actions edge="leading" allowsFullSwipe>
          <SwiftUIButton label="" systemImage={getCartActionSystemImage(item)} onPress={handleLeftAction} />
        </SwipeActions.Actions>
      ) : null}
      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <SwiftUIButton label="" role="destructive" systemImage="trash" onPress={confirmDelete} />
        <SwiftUIButton label="" role="destructive" systemImage="clock" onPress={confirmDelete} />
      </SwipeActions.Actions>
    </SwipeActions>
  );

  if (nativeListItem) {
    return swipeActions;
  }

  if (onStartSelection) {
    return swipeActions;
  }

  return (
    <MenuView
      actions={menuActions}
      onPressAction={handleMenuAction}
      shouldOpenOnLongPress
      style={rowStyles.contextMenuHost}
    >
      {menuTrigger}
    </MenuView>
  );
}
