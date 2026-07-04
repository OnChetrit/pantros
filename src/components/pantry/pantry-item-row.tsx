import { Alert } from 'react-native';

import { triggerMediumImpact } from '@/lib/haptics';

import { PantryItemRowContent, type PantryItemRowProps } from './pantry-item-row.shared';

export { PantryItemNativeListRow } from './pantry-item-native-list-row';

export function PantryItemRow({
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
}: PantryItemRowProps) {
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

  const showActions = () => {
    void triggerMediumImpact();
    Alert.alert(
      item.name,
      undefined,
      [
        {
          text: 'Edit item',
          onPress: onEdit,
        },
        ...(hasLeftAction
          ? [
              {
                text: leftActionLabel,
                onPress: onLeftAction,
              },
            ]
          : []),
        {
          text: 'Delete item',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
      {cancelable: true}
    );
  };

  return (
    <PantryItemRowContent
      item={item}
      displayMode={displayMode}
      isLast={isLast}
      onPress={isSelectionMode ? (onToggleSelection ?? onPress) : onPress}
      onLongPress={onStartSelection ? () => onStartSelection() : showActions}
      isSelectionMode={isSelectionMode}
      isSelected={isSelected}
    />
  );
}
