import type { PropsWithChildren } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import { Modal, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { appColors } from '@/lib/theme';

type BottomSheetModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  sheetStyle?: StyleProp<ViewStyle>;
  detentHeight?: number;
}>;

export function BottomSheetModal({visible, onClose, onDismiss, sheetStyle, children}: BottomSheetModalProps) {
  return (
    <Modal
      animationType="slide"
      presentationStyle={Platform.OS === 'ios' ? 'pageSheet' : 'fullScreen'}
      visible={visible}
      onDismiss={onDismiss}
      onRequestClose={onClose}
      allowSwipeDismissal={Platform.OS === 'ios'}
    >
      <SafeAreaView style={styles.safeArea}>
        <View accessibilityViewIsModal style={[styles.content, sheetStyle]}>
          {children}
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  content: {
    flex: 1,
    backgroundColor: appColors.background,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    gap: 16,
  },
});
