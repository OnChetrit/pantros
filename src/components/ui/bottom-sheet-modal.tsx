import type { PropsWithChildren } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { Animated, Easing, Modal, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appColors } from '@/lib/theme';

const EXIT_CLEARANCE = 48;

type BottomSheetModalProps = PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  onDismiss?: () => void;
  sheetStyle?: StyleProp<ViewStyle>;
}>;

export function BottomSheetModal({
  visible,
  onClose,
  onDismiss,
  sheetStyle,
  children,
}: BottomSheetModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const [isMounted, setIsMounted] = useState(visible);
  const [sheetHeight, setSheetHeight] = useState(0);
  const progress = useRef(new Animated.Value(0)).current;
  const visibleRef = useRef(visible);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    visibleRef.current = visible;
  }, [visible]);

  useEffect(() => {
    onDismissRef.current = onDismiss;
  }, [onDismiss]);

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
    }
  }, [visible]);

  useEffect(() => {
    if (!isMounted) {
      return;
    }

    progress.stopAnimation();

    if (visible) {
      if (sheetHeight <= 0) {
        progress.setValue(0);
        return;
      }

      Animated.spring(progress, {
        toValue: 1,
        damping: 24,
        stiffness: 260,
        mass: 0.86,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(progress, {
      toValue: 0,
      duration: 240,
      easing: Easing.in(Easing.cubic),
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished && !visibleRef.current) {
        setIsMounted(false);
        onDismissRef.current?.();
      }
    });
  }, [isMounted, progress, sheetHeight, visible]);

  if (!isMounted) {
    return null;
  }

  const hiddenTranslateY = sheetHeight > 0 ? sheetHeight + EXIT_CLEARANCE : windowHeight;
  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [hiddenTranslateY, 0],
    extrapolate: 'clamp',
  });
  const scrimOpacity = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const handleSheetLayout = (event: LayoutChangeEvent) => {
    const nextHeight = event.nativeEvent.layout.height;

    setSheetHeight((currentHeight) => (Math.abs(currentHeight - nextHeight) > 1 ? nextHeight : currentHeight));
  };

  return (
    <Modal
      animationType="none"
      transparent
      statusBarTranslucent
      presentationStyle="overFullScreen"
      visible={isMounted}
      onRequestClose={onClose}
    >
      <View style={styles.modalRoot}>
        <Animated.View pointerEvents={visible ? 'auto' : 'none'} style={[styles.backdrop, { opacity: scrimOpacity }]}>
          <Pressable accessibilityRole="button" accessibilityLabel="Close menu" style={styles.scrim} onPress={onClose} />
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          onLayout={handleSheetLayout}
          pointerEvents={visible ? 'auto' : 'none'}
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(insets.bottom, 12) + 10,
              transform: [{ translateY }],
            },
            sheetStyle,
          ]}
        >
          <View style={styles.sheetGrabber} />
          {children}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: appColors.overlay,
  },
  scrim: {
    flex: 1,
  },
  sheet: {
    backgroundColor: appColors.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 10,
    gap: 16,
    shadowColor: appColors.shadow,
    shadowOpacity: 0.14,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: -6 },
    elevation: 14,
  },
  sheetGrabber: {
    alignSelf: 'center',
    width: 38,
    height: 5,
    borderRadius: 999,
    backgroundColor: appColors.grabber,
    marginBottom: 4,
  },
});
