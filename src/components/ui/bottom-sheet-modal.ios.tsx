import { BottomSheet, Group, Host, RNHostView } from '@expo/ui/swift-ui';
import {
  padding,
  presentationBackground,
  presentationDetents,
  presentationDragIndicator
} from '@expo/ui/swift-ui/modifiers';
import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { View } from 'react-native';

import { appColors } from '@/lib/theme';

type BottomSheetModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  sheetStyle?: StyleProp<ViewStyle>;
  detentHeight?: number;
}>;

export function BottomSheetModal({
  visible,
  onClose,
  onDismiss,
  sheetStyle,
  detentHeight,
  children,
}: BottomSheetModalProps) {
  return (
    <Host style={{position: 'absolute'}} pointerEvents="none">
      <BottomSheet
        isPresented={visible}
        onIsPresentedChange={isPresented => {
          if (!isPresented) {
            onClose();
          }
        }}
        onDismiss={onDismiss}
        fitToContents={!detentHeight}
      >
        <Group
          modifiers={[
            padding({top: 12, leading: 16, trailing: 16, bottom: 12}),
            presentationDragIndicator('visible'),
            // presentationBackgroundInteraction('enabled'),
            presentationBackground(appColors.background as string),
            ...(detentHeight ? [presentationDetents([{height: detentHeight}])] : []),
          ]}
        >
          <RNHostView matchContents>
            <View accessibilityViewIsModal style={sheetStyle}>
              {children}
            </View>
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  );
}
