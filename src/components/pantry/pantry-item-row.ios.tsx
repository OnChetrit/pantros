import type { MenuAction } from '@expo/ui/community/menu';
import { MenuView } from '@expo/ui/community/menu';
import { Button as SwiftUIButton, SwipeActions } from '@expo/ui/swift-ui';
import { Alert } from 'react-native';

import { triggerMediumImpact } from '@/lib/haptics';

import {
  getCartActionSystemImage,
  PantryItemRowContent,
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

  const menuTrigger = (
    <>
      <PantryItemRowContent
        item={item}
        displayMode={displayMode}
        isLast={isLast}
        onPress={onPress}
        nativeListItem={nativeListItem}
      />
    </>
  );

  const swipeActions = (
    <SwipeActions>
      <MenuView
        actions={menuActions}
        onPressAction={handleMenuAction}
        shouldOpenOnLongPress
        style={rowStyles.nativeListHost}
      >
        {menuTrigger}
      </MenuView>
      {hasLeftAction ? (
        <SwipeActions.Actions edge="leading" allowsFullSwipe={false}>
          <SwiftUIButton
            label={leftActionLabel}
            systemImage={getCartActionSystemImage(item)}
            onPress={handleLeftAction}
          />
        </SwipeActions.Actions>
      ) : null}
      <SwipeActions.Actions edge="trailing" allowsFullSwipe>
        <SwiftUIButton label="Delete" role="destructive" systemImage="trash" onPress={confirmDelete} />
      </SwipeActions.Actions>
    </SwipeActions>
  );

  if (nativeListItem) {
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
