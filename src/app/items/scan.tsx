import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult, BarcodeType } from 'expo-camera';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appColors } from '@/components/ui/primitives';
import { triggerMediumImpact } from '@/lib/haptics';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useAppContext } from '@/state/app-context';

const BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14'];

function normalizeScannedBarcode(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length >= 8 && digits.length <= 14) {
    return digits;
  }

  return trimmed;
}

function IconCircleButton({
  icon,
  label,
  onPress,
  disabled = false,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconCircleButton,
        (pressed || disabled) ? styles.buttonPressed : null,
      ]}
    >
      <Ionicons name={icon} size={22} color={disabled ? appColors.muted : appColors.tint} />
    </Pressable>
  );
}

function ScanPermissionState({
  title,
  body,
  icon = 'camera-outline',
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  onClose,
  highlights = [],
}: {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  onClose?: () => void;
  highlights?: string[];
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.permissionScreen, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}>
      <View style={styles.permissionTopBar}>
        {onClose ? <IconCircleButton icon="close" label="Close scanner" onPress={onClose} /> : <View style={styles.topBarSpacer} />}
      </View>

      <View style={styles.permissionContent}>
        <View style={styles.permissionIconOuter}>
          <View style={styles.permissionIconInner}>
            <Ionicons name={icon} size={34} color={appColors.tint} />
          </View>
        </View>

        <View style={styles.permissionCopy}>
          <Text style={styles.permissionTitle}>{title}</Text>
          <Text style={styles.permissionBody}>{body}</Text>
        </View>

        {highlights.length > 0 ? (
          <View style={styles.highlightList}>
            {highlights.map((highlight) => (
              <View key={highlight} style={styles.highlightRow}>
                <Ionicons name="checkmark-circle" size={18} color={appColors.tint} />
                <Text style={styles.highlightText}>{highlight}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>

      <View style={styles.permissionActions}>
        {actionLabel && onAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onAction}
            style={({ pressed }) => [
              styles.permissionActionButton,
              styles.permissionActionButtonPrimary,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <Ionicons name="camera-outline" size={20} color={appColors.textInverse} />
            <Text style={styles.permissionActionButtonPrimaryText}>{actionLabel}</Text>
          </Pressable>
        ) : null}
        {secondaryActionLabel && onSecondaryAction ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSecondaryAction}
            style={({ pressed }) => [
              styles.permissionActionButton,
              styles.permissionActionButtonSecondary,
              pressed ? styles.buttonPressed : null,
            ]}
          >
            <Ionicons name="search-outline" size={20} color={appColors.text} />
            <Text style={styles.permissionActionButtonSecondaryText}>{secondaryActionLabel}</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export default function ScanItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const processingBarcodeRef = useRef(false);
  const openingItemRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const { isAuthenticated, pantryItems, selectedPantry, status } = useAppContext();

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const openManualSearch = useCallback(() => {
    router.replace(`/search?entry=manual&nonce=${Date.now()}`);
  }, [router]);

  const openAppSettings = useCallback(() => {
    void Linking.openSettings();
  }, []);

  const confirmCameraAccess = useCallback(
    (canAskAgain: boolean) => {
      Alert.alert(
        'Use camera for scanning?',
        canAskAgain
          ? 'Confirm to show the camera permission prompt again.'
          : 'Camera access is off for Pantros. Confirm to open Settings and turn it back on.',
        [
          { text: 'Not now', style: 'cancel' },
          { text: 'Search manually', onPress: openManualSearch },
          {
            text: canAskAgain ? 'Confirm' : 'Open Settings',
            onPress: canAskAgain ? () => void requestPermission() : openAppSettings,
          },
        ],
      );
    },
    [openAppSettings, openManualSearch, requestPermission],
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = useCallback((message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToastMessage(message);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 1700);
  }, []);

  const handleBarcodeScanned = useCallback(
    async (result: BarcodeScanningResult) => {
      if (processingBarcodeRef.current || openingItemRef.current) {
        return;
      }

      const barcode = normalizeScannedBarcode(result.data);

      if (!barcode) {
        return;
      }

      processingBarcodeRef.current = true;
      setIsProcessingBarcode(true);

      try {
        void triggerMediumImpact();
        const match = matchPantryItems(pantryItems, barcode).exactBarcodeMatch;

        openingItemRef.current = true;

        if (match) {
          showToast('Item found');
          setTimeout(() => {
            router.replace(`/items/${match.id}`);
            openingItemRef.current = false;
          }, 420);
          return;
        }

        showToast('Creating new item');
        setTimeout(() => {
          router.replace(`/items/new?barcode=${encodeURIComponent(barcode)}`);
          openingItemRef.current = false;
        }, 420);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Could not process that barcode.';
        showToast(message);
        openingItemRef.current = false;
      } finally {
        processingBarcodeRef.current = false;
        setIsProcessingBarcode(false);
      }
    },
    [pantryItems, router, showToast],
  );

  const canScanBarcode = permission?.granted && isCameraReady && !isProcessingBarcode;

  if (status === 'idle' || status === 'loading') {
    return null;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!selectedPantry) {
    return (
      <ScanPermissionState
        title="No pantry selected"
        body="Items need an active pantry workspace before they can be scanned into inventory."
        icon="file-tray-outline"
        onClose={() => router.back()}
      />
    );
  }

  if (!permission) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={appColors.tint} />
      </View>
    );
  }

  if (!permission.granted) {
    const canRequestPermission = permission.canAskAgain;

    return (
      <ScanPermissionState
        title="Confirm camera access"
        body="Confirm again when you are ready to use the camera scanner."
        actionLabel="Confirm Again"
        onAction={() => confirmCameraAccess(canRequestPermission)}
        secondaryActionLabel="Search manually"
        onSecondaryAction={openManualSearch}
        onClose={() => router.back()}
        highlights={[
          'Open existing items by barcode',
          'Start a new item with the scanned barcode',
          'Manual search stays available',
        ]}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        active
        barcodeScannerSettings={{ barcodeTypes: BARCODE_TYPES }}
        onBarcodeScanned={canScanBarcode ? handleBarcodeScanned : undefined}
        onCameraReady={() => setIsCameraReady(true)}
        onMountError={(error) => setCameraError(error.message)}
      />
      <View pointerEvents="box-none" style={[styles.overlay, { paddingTop: insets.top + 12 }]}>
        <View style={styles.topBar}>
          <IconCircleButton icon="close" label="Close scanner" onPress={() => router.back()} />
          <Text style={styles.title}>Scan a barcode</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.scanFrameShell}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>Align the barcode inside the frame to find or create the item.</Text>
        </View>

        {cameraError ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{cameraError}</Text>
          </View>
        ) : null}

        {isProcessingBarcode ? (
          <View style={styles.statusPill}>
            <ActivityIndicator size="small" color={appColors.textInverse} />
            <Text style={styles.statusText}>Looking up barcode</Text>
          </View>
        ) : null}

        <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search manually"
            accessibilityHint="Return to Search + Add without scanning"
            onPress={openManualSearch}
            style={({ pressed }) => [styles.manualButton, pressed ? styles.buttonPressed : null]}
          >
            <Ionicons name="search-outline" size={20} color={appColors.text} />
            <Text style={styles.manualButtonText}>Search manually</Text>
          </Pressable>
        </View>
      </View>

      {toastMessage ? (
        <View pointerEvents="none" style={[styles.toast, { top: insets.top + 74 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.background,
  },
  permissionScreen: {
    flex: 1,
    justifyContent: 'space-between',
    gap: 24,
    paddingHorizontal: 20,
    backgroundColor: appColors.background,
  },
  permissionTopBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  permissionContent: {
    flex: 1,
    justifyContent: 'center',
    gap: 22,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  permissionIconOuter: {
    width: 106,
    height: 106,
    borderRadius: 53,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.tintSoft,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  permissionIconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.borderStrong,
  },
  permissionCopy: {
    gap: 10,
  },
  permissionTitle: {
    color: appColors.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    textAlign: 'center',
  },
  permissionBody: {
    color: appColors.muted,
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    textAlign: 'center',
  },
  highlightList: {
    gap: 12,
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  highlightText: {
    flex: 1,
    color: appColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  permissionActions: {
    gap: 12,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  permissionActionButton: {
    minHeight: 52,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  permissionActionButtonPrimary: {
    backgroundColor: appColors.tint,
  },
  permissionActionButtonSecondary: {
    backgroundColor: appColors.tintSoft,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  permissionActionButtonPrimaryText: {
    color: appColors.textInverse,
    fontSize: 15,
    fontWeight: '800',
  },
  permissionActionButtonSecondaryText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  topBar: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  topBarSpacer: {
    width: 44,
    height: 44,
  },
  title: {
    color: '#ffffff',
    fontSize: 19,
    fontWeight: '800',
  },
  scanFrameShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
  },
  scanFrame: {
    width: '100%',
    maxWidth: 310,
    aspectRatio: 1.6,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.88)',
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
  },
  scanHint: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 310,
  },
  statusPill: {
    alignSelf: 'center',
    minHeight: 42,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(10, 10, 10, 0.76)',
  },
  statusText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  bottomActions: {
    width: '100%',
  },
  manualButton: {
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingHorizontal: 18,
  },
  manualButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(10, 10, 10, 0.86)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  iconCircleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  buttonPressed: {
    opacity: 0.75,
  },
});
