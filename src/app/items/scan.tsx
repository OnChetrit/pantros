import { Ionicons } from '@expo/vector-icons';
import type { BarcodeScanningResult, BarcodeType } from 'expo-camera';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Redirect, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { appColors } from '@/components/ui/primitives';
import { ScanPermissionState } from '@/features/scan/scan-permission-state/scan-permission-state';
import { triggerMediumImpact } from '@/lib/haptics';
import { useAppTheme, useThemedStyles } from '@/lib/theme';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useAuthState } from '@/state/auth-state';
import { setPendingScannedBarcode } from '@/state/barcode-scan-state';
import { useWorkspaceState } from '@/state/workspace-state';

const BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14'];

function normalizeScannedBarcode(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length >= 8 && digits.length <= 14) {
    return digits;
  }

  return trimmed;
}

export default function ScanItemScreen() {
  const router = useRouter();
  const {mode} = useLocalSearchParams<{mode?: string | string[]}>();
  const insets = useSafeAreaInsets();
  const styles = useThemedStyles(createStyles);
  const {colors} = useAppTheme();
  const processingBarcodeRef = useRef(false);
  const openingItemRef = useRef(false);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [permission, requestPermission, getPermission] = useCameraPermissions();
  const {isAuthenticated, status} = useAuthState();
  const {pantryItems, selectedPantry} = useWorkspaceState();
  const launchMode = Array.isArray(mode) ? mode[0] : mode;
  const isFormScan = launchMode === 'form';

  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingPermission, setIsCheckingPermission] = useState(false);

  const openManualSearch = useCallback(() => {
    if (isFormScan) {
      router.back();
      return;
    }

    router.replace(`/search?entry=manual&nonce=${Date.now()}`);
  }, [isFormScan, router]);

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
          {text: 'Not now', style: 'cancel'},
          {text: 'Search manually', onPress: openManualSearch},
          {
            text: canAskAgain ? 'Confirm' : 'Open Settings',
            onPress: canAskAgain ? () => void requestPermission() : openAppSettings,
          },
        ]
      );
    },
    [openAppSettings, openManualSearch, requestPermission]
  );

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const hydratePermission = async () => {
      try {
        await getPermission();
      } finally {
        if (isMounted) {
          setIsCheckingPermission(false);
        }
      }
    };

    void hydratePermission();

    return () => {
      isMounted = false;
    };
  }, [getPermission]);

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

        if (isFormScan) {
          showToast('Barcode captured');
          setPendingScannedBarcode(barcode);
          setTimeout(() => {
            openingItemRef.current = false;
            router.back();
          }, 260);
          return;
        }

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
    [isFormScan, pantryItems, router, showToast]
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
      <>
        <Stack.Screen
          options={{
            title: 'Scan Barcode',
          }}
        />
        <ScanPermissionState
          title="No pantry selected"
          body="Items need an active pantry workspace before they can be scanned into inventory."
          icon="file-tray-outline"
        />
      </>
    );
  }

  if (!permission && isCheckingPermission) {
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={appColors.tint} />
      </View>
    );
  }

  if (!permission) {
    return (
      <>
        <Stack.Screen
          options={{
            title: 'Scan Barcode',
          }}
        />
        <ScanPermissionState
          title="Camera status unavailable"
          body="Pantros could not read the current camera permission state. Confirm again to continue scanning."
          actionLabel="Confirm Again"
          onAction={() => void requestPermission()}
          secondaryActionLabel={isFormScan ? 'Back to item' : 'Search manually'}
          onSecondaryAction={openManualSearch}
        />
      </>
    );
  }

  if (!permission.granted) {
    const canRequestPermission = permission.canAskAgain;

    return (
      <>
        <Stack.Screen
          options={{
            title: 'Scan Barcode',
          }}
        />
        <ScanPermissionState
          title="Confirm camera access"
          body="Confirm again when you are ready to use the camera scanner."
          actionLabel="Confirm Again"
          onAction={() => confirmCameraAccess(canRequestPermission)}
          secondaryActionLabel={isFormScan ? 'Back to item' : 'Search manually'}
          onSecondaryAction={openManualSearch}
          highlights={[
            isFormScan ? 'Fill the current item barcode field directly' : 'Open existing items by barcode',
            isFormScan ? 'Return to the form after a successful scan' : 'Start a new item with the scanned barcode',
            isFormScan ? 'Back out without changing the form' : 'Manual search stays available',
          ]}
        />
      </>
    );
  }

  return (
    <View style={styles.screen}>
      <Stack.Screen
        options={{
          title: 'Scan Barcode',
          headerTransparent: true,
          headerShadowVisible: false,
          headerTintColor: colors.textInverse,
          headerTitleStyle: {color: colors.textInverse},
        }}
      />
      {!isFormScan ? (
        <Stack.Toolbar placement="right">
          <Stack.Toolbar.Button icon="magnifyingglass" onPress={openManualSearch} tintColor={colors.textInverse}>
            Search
          </Stack.Toolbar.Button>
        </Stack.Toolbar>
      ) : null}
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        mode="picture"
        active
        barcodeScannerSettings={{barcodeTypes: BARCODE_TYPES}}
        onBarcodeScanned={canScanBarcode ? handleBarcodeScanned : undefined}
        onCameraReady={() => setIsCameraReady(true)}
        onMountError={error => setCameraError(error.message)}
      />
      <View pointerEvents="box-none" style={[styles.overlay, {paddingTop: insets.top + 12}]}>
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
          <View style={[styles.statusPill, styles.statusPillRow]}>
            <ActivityIndicator size="small" color={appColors.textInverse} />
            <Text style={styles.statusText}>Looking up barcode</Text>
          </View>
        ) : null}

        <View style={[styles.bottomActions, {paddingBottom: Math.max(insets.bottom, 18)}]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Search manually"
            accessibilityHint="Return to Search + Add without scanning"
            onPress={openManualSearch}
            style={({pressed}) => [styles.manualButton, pressed ? styles.buttonPressed : null]}
          >
            <View style={styles.manualButtonContent}>
              <Ionicons name="search-outline" size={20} color={appColors.text} />
              <Text style={styles.manualButtonText}>Search manually</Text>
            </View>
          </Pressable>
        </View>
      </View>

      {toastMessage ? (
        <View pointerEvents="none" style={[styles.toast, {top: insets.top + 74}]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#000000',
    },
    loadingScreen: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.background,
    },
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
      paddingHorizontal: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.28)',
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
      backgroundColor: 'rgba(10, 10, 10, 0.76)',
    },
    statusPillRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
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
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      paddingHorizontal: 18,
      justifyContent: 'center',
    },
    manualButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
    },
    manualButtonText: {
      color: colors.text,
      fontSize: 15,
      fontWeight: '800',
    },
    buttonPressed: {
      opacity: 0.75,
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
  });
