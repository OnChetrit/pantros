import { Button, ContextMenu, Divider, HStack, Spacer, SwipeActions, Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, frame, onTapGesture, shapes, tag, tint } from '@expo/ui/swift-ui/modifiers';
import { Alert } from 'react-native';

import { triggerMediumImpact } from '@/lib/haptics';
import { formatExpirationLabel } from '@/lib/pantry-insights';

import { useAppTheme } from '@/lib/theme';
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
  const isCart = displayMode === 'cart';
  const {colors} = useAppTheme();

  const handleWithHaptics = (callback?: () => void) => {
    void triggerMediumImpact();
    callback?.();
  };

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

  const contextMenuItemModifiers = [foregroundStyle(colors.text)];

  const rowContent = (
    <HStack
      alignment="center"
      spacing={12}
      modifiers={
        isSelectionMode && nativeListItem && !onToggleSelection
          ? undefined
          : [onTapGesture(isSelectionMode ? (onToggleSelection ?? onPress) : onPress)]
      }
    >
      <Text
        modifiers={[
          font({weight: 'bold', size: 15}),
          frame({width: 48, height: 48}),
          background(colors.tintSoft, shapes.roundedRectangle({cornerRadius: 8})),
        ]}
      >
        {item.name.charAt(0).toUpperCase()}
      </Text>

      <VStack alignment="leading" spacing={2}>
        <Text
          modifiers={[
            font({weight: 'semibold', size: 17}),
            foregroundStyle(isSelected && isSelectionMode ? 'secondaryLabel' : 'label'),
          ]}
        >
          {item.name}
        </Text>
      </VStack>

      <Spacer />

      {isCart ? (
        <Text modifiers={[font({weight: 'bold', size: 15}), frame({minWidth: 28, alignment: 'trailing'})]}>
          {String(item.quantity)}
        </Text>
      ) : item.expirationDate ? (
        <VStack alignment="trailing" spacing={2} modifiers={[frame({minWidth: 72, alignment: 'trailing'})]}>
          <Text modifiers={[foregroundStyle('secondaryLabel'), font({size: 13})]}>
            {formatExpirationLabel(item.expirationDate)}
          </Text>
        </VStack>
      ) : null}
    </HStack>
  );

  const contextMenu = (
    <ContextMenu>
      <ContextMenu.Trigger>{rowContent}</ContextMenu.Trigger>

      <ContextMenu.Items>
        <Button
          label="Edit item"
          systemImage="pencil"
          onPress={() => handleWithHaptics(onEdit)}
          modifiers={contextMenuItemModifiers}
        />

        {!isSelectionMode && onStartSelection ? (
          <Button
            label="Select"
            systemImage="checkmark.circle"
            onPress={() => handleWithHaptics(onStartSelection)}
            modifiers={contextMenuItemModifiers}
          />
        ) : null}

        <Button
          label={isCart ? 'Update quantity' : 'Review expiration'}
          systemImage={isCart ? 'number.circle' : 'clock'}
          onPress={() => handleWithHaptics(isCart ? onReviewQuantity : onReviewExpiration)}
          modifiers={contextMenuItemModifiers}
        />

        {hasLeftAction ? (
          <Button
            label={leftActionLabel}
            systemImage={getCartActionSystemImage(item)}
            onPress={() => handleWithHaptics(onLeftAction)}
            modifiers={contextMenuItemModifiers}
          />
        ) : null}
        <Divider />
        <Button
          label="Delete item"
          role="destructive"
          systemImage="trash"
          onPress={confirmDelete}
          modifiers={contextMenuItemModifiers}
        />
      </ContextMenu.Items>
    </ContextMenu>
  );

  return (
    <SwipeActions modifiers={nativeListItem && !isCart ? [tag(item.id)] : undefined}>
      {contextMenu}

      {hasLeftAction ? (
        <SwipeActions.Actions edge="leading" allowsFullSwipe>
          <Button
            label=""
            systemImage={getCartActionSystemImage(item)}
            onPress={() => handleWithHaptics(onLeftAction)}
            modifiers={[tint(colors.warning)]}
          />

          <Button
            label=""
            role="cancel"
            modifiers={[tint(colors.tint)]}
            systemImage={isCart ? 'number.circle' : 'clock'}
            onPress={() => handleWithHaptics(isCart ? onReviewQuantity : onReviewExpiration)}
          />
        </SwipeActions.Actions>
      ) : null}

      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <Button modifiers={[tint(colors.danger)]} label="" systemImage="trash" onPress={confirmDelete} />
      </SwipeActions.Actions>
    </SwipeActions>
  );
}
