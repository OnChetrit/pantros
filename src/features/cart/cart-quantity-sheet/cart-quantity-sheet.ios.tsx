import {
  BottomSheet,
  Button as SwiftUIButton,
  Group,
  HStack,
  Host,
  ProgressView,
  RNHostView,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  frame,
  foregroundStyle,
  interactiveDismissDisabled,
  lineLimit,
  multilineTextAlignment,
  padding,
  presentationDetents,
  progressViewStyle,
} from '@expo/ui/swift-ui/modifiers';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert } from 'react-native';

import { NumberWheelInput } from '@/components/ui/primitives';
import type { PantryItem } from '@/domain/models';
import { useAppTheme } from '@/lib/theme';

type CartQuantitySheetProps = {
  visible: boolean;
  item: PantryItem | null;
  processing: boolean;
  errorMessage: string | null;
  onSave: (quantity: number) => void;
  onCancel: () => void;
};

export function CartQuantitySheet({visible, item, processing, errorMessage, onSave, onCancel}: CartQuantitySheetProps) {
  if (!item) {
    return null;
  }

  return (
    <CartQuantitySheetContent
      key={item.id}
      visible={visible}
      item={item}
      processing={processing}
      errorMessage={errorMessage}
      onSave={onSave}
      onCancel={onCancel}
    />
  );
}

function CartQuantitySheetContent({
  visible,
  item,
  processing,
  errorMessage,
  onSave,
  onCancel,
}: CartQuantitySheetProps & {item: PantryItem}) {
  const {colors} = useAppTheme();
  const [presented, setPresented] = useState(visible);
  const allowDismissRef = useRef(false);
  const [quantity, setQuantity] = useState(item.quantity);
  const quantityOptions = useMemo(() => Array.from({length: 50}, (_, index) => index + 1), []);
  const hasChanges = quantity !== item.quantity;
  const confirmDisabled = processing || quantity < 1 || !hasChanges;

  const requestDismiss = useCallback(() => {
    if (processing) {
      return;
    }

    if (!hasChanges) {
      allowDismissRef.current = true;
      setPresented(false);
      return;
    }

    Alert.alert('Discard changes?', 'Your quantity change will be lost.', [
      {
        text: 'Keep Editing',
        style: 'cancel',
      },
      {
        text: 'Discard Changes',
        style: 'destructive',
        onPress: () => {
          allowDismissRef.current = true;
          setPresented(false);
        },
      },
    ]);
  }, [hasChanges, processing]);

  const handlePresentedChange = useCallback(
    (nextPresented: boolean) => {
      if (!nextPresented) {
        if (allowDismissRef.current) {
          allowDismissRef.current = false;
          setPresented(false);
          return;
        }

        if (!hasChanges) {
          allowDismissRef.current = true;
          setPresented(false);
          return;
        }

        Alert.alert('Discard changes?', 'Your quantity change will be lost.', [
          {
            text: 'Keep Editing',
            style: 'cancel',
            onPress: () => setPresented(true),
          },
          {
            text: 'Discard Changes',
            style: 'destructive',
            onPress: () => {
              allowDismissRef.current = true;
              setPresented(false);
            },
          },
        ]);
      }
    },
    [hasChanges]
  );

  useEffect(() => {
    setPresented(visible);
  }, [visible]);

  return (
    <Host matchContents style={{flex: 1}}>
      <BottomSheet isPresented={presented} onIsPresentedChange={handlePresentedChange} onDismiss={onCancel}>
        <Group
          modifiers={[
            presentationDetents([{height: 180}]),
            interactiveDismissDisabled(processing),
            padding({top: 12, leading: 16, trailing: 16, bottom: 20}),
          ]}
        >
          <VStack spacing={18}>
            <ZStack modifiers={[frame({maxWidth: 9999})]}>
              <Text
                modifiers={[
                  font({weight: 'semibold', size: 17}),
                  lineLimit(1),
                  multilineTextAlignment('center'),
                  frame({maxWidth: 9999}),
                ]}
              >
                {item.name}
              </Text>

              <HStack spacing={12} modifiers={[frame({maxWidth: 9999})]}>
                <SwiftUIButton
                  label=""
                  systemImage="xmark"
                  onPress={requestDismiss}
                  modifiers={[
                    controlSize('large'),
                    buttonStyle('glass'),
                    buttonBorderShape('circle'),
                    disabled(processing),
                    frame({width: 44, height: 44}),
                  ]}
                />
                <Spacer />
                <ZStack modifiers={[frame({width: 44, height: 44})]}>
                  <SwiftUIButton
                    label=""
                    systemImage={processing ? undefined : 'checkmark'}
                    onPress={() => onSave(quantity)}
                    modifiers={[
                      controlSize('large'),
                      buttonStyle('glassProminent'),
                      buttonBorderShape('circle'),
                      disabled(confirmDisabled),
                      frame({width: 44, height: 44}),
                    ]}
                  />
                  {processing ? (
                    <ProgressView modifiers={[progressViewStyle('circular'), controlSize('regular')]} />
                  ) : null}
                </ZStack>
              </HStack>
            </ZStack>

            <RNHostView>
              <NumberWheelInput
                compact
                value={quantity}
                options={quantityOptions}
                onChange={setQuantity}
                disabled={processing}
              />
            </RNHostView>

            {errorMessage ? (
              <Text modifiers={[font({weight: 'semibold', size: 14}), foregroundStyle(colors.danger)]}>
                {errorMessage}
              </Text>
            ) : null}
          </VStack>
        </Group>
      </BottomSheet>
    </Host>
  );
}
