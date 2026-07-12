import { ContextMenu, HStack, Spacer, Button as SwiftUIButton, SwipeActions, Text, VStack } from '@expo/ui/swift-ui';
import { background, font, foregroundStyle, frame, onTapGesture, shapes } from '@expo/ui/swift-ui/modifiers';
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
}: PantryItemSwipeRowProps) {
  const hasLeftAction = Boolean(onLeftAction && leftActionLabel);
  const isCart = displayMode === 'cart';

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

  const rowContent = (
    <HStack
      alignment="center"
      spacing={12}
      modifiers={[
        onTapGesture(isSelectionMode ? (onToggleSelection ?? onPress) : onPress),
        // padding({horizontal: 16, vertical: 12}),
        // frame({minHeight: 60}),
        // ...(isSelected && isSelectionMode ? [background('#F1F2F4', shapes.roundedRectangle({cornerRadius: 12}))] : []),
      ]}
    >
      <Text
        modifiers={[
          font({weight: 'bold', size: 15}),
          frame({width: 36, height: 36}),
          background(isSelected && isSelectionMode ? '#D9DCE1' : '#EAF2FF', shapes.circle()),
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
        <SwiftUIButton label="Edit item" systemImage="pencil" onPress={() => handleWithHaptics(onEdit)} />

        {!isSelectionMode && onStartSelection ? (
          <SwiftUIButton
            label="Select"
            systemImage="checkmark.circle"
            onPress={() => handleWithHaptics(onStartSelection)}
          />
        ) : null}

        <SwiftUIButton
          label={isCart ? 'Update quantity' : 'Review expiration'}
          systemImage={isCart ? 'number.circle' : 'clock'}
          onPress={() => handleWithHaptics(isCart ? onReviewQuantity : onReviewExpiration)}
        />

        {hasLeftAction ? (
          <SwiftUIButton
            label={leftActionLabel}
            systemImage={getCartActionSystemImage(item)}
            onPress={() => handleWithHaptics(onLeftAction)}
          />
        ) : null}

        <SwiftUIButton label="Delete item" role="destructive" systemImage="trash" onPress={confirmDelete} />
      </ContextMenu.Items>
    </ContextMenu>
  );

  return (
    <SwipeActions>
      {contextMenu}

      {hasLeftAction ? (
        <SwipeActions.Actions edge="leading" allowsFullSwipe>
          <SwiftUIButton
            label=""
            systemImage={getCartActionSystemImage(item)}
            onPress={() => handleWithHaptics(onLeftAction)}
          />

          <SwiftUIButton
            label=""
            role="cancel"
            systemImage={isCart ? 'number.circle' : 'clock'}
            onPress={() => handleWithHaptics(isCart ? onReviewQuantity : onReviewExpiration)}
          />
        </SwipeActions.Actions>
      ) : null}

      <SwipeActions.Actions edge="trailing" allowsFullSwipe={false}>
        <SwiftUIButton label="" role="destructive" systemImage="trash" onPress={confirmDelete} />
      </SwipeActions.Actions>
    </SwipeActions>
  );
}
