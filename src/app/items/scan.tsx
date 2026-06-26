import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import type { BarcodeScanningResult, BarcodeType, CameraCapturedPicture } from 'expo-camera';
import { Redirect, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomSheetModal } from '@/components/ui/bottom-sheet-modal';
import { EmptyNotice, appColors } from '@/components/ui/primitives';
import type { PantryItem, PantryItemInput } from '@/domain/models';
import { triggerMediumImpact } from '@/lib/haptics';
import { formatExpirationLabel } from '@/lib/pantry-insights';
import { useAppContext } from '@/state/app-context';
import { extractExpirationDate } from '@/features/items/expiration-ai';

type ScanMode = 'barcode' | 'expiration';

type PendingItem =
  | {
      kind: 'cart';
      item: PantryItem;
      capturedImage: string | null;
    }
  | {
      kind: 'unknown';
      barcode: string;
      capturedImage: string | null;
    };

const BARCODE_TYPES: BarcodeType[] = ['ean13', 'ean8', 'upc_a', 'upc_e', 'code128', 'code39', 'code93', 'itf14'];

function normalizeScannedBarcode(value: string) {
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');

  if (digits.length >= 8 && digits.length <= 14) {
    return digits;
  }

  return trimmed;
}

function normalizeForMatch(value: string | null) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');

  return {
    raw: trimmed.toLowerCase(),
    digits: digits.length > 0 ? digits : null,
  };
}

function matchesBarcode(item: PantryItem, barcode: string) {
  const itemValue = normalizeForMatch(item.barcode);
  const scannedValue = normalizeForMatch(barcode);

  if (!itemValue || !scannedValue) {
    return false;
  }

  return itemValue.raw === scannedValue.raw || Boolean(itemValue.digits && itemValue.digits === scannedValue.digits);
}

function formatDisplayDate(value: string | null) {
  if (!value) {
    return 'No expiration date';
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

function makeCartMoveInput(item: PantryItem, expirationDate: string | null): PantryItemInput {
  return {
    pantryId: item.pantryId,
    name: item.name,
    barcode: item.barcode,
    image: item.image,
    expirationDate,
    isInCart: false,
    cartId: null,
    quantity: item.quantity,
  };
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

function SheetButton({
  label,
  icon,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.sheetButton,
        variant === 'primary' ? styles.sheetButtonPrimary : null,
        variant === 'secondary' ? styles.sheetButtonSecondary : null,
        variant === 'danger' ? styles.sheetButtonDanger : null,
        (pressed || disabled) ? styles.buttonPressed : null,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={variant === 'primary' ? appColors.textInverse : appColors.text}
        />
      ) : null}
      <Text style={variant === 'primary' ? styles.sheetButtonPrimaryText : styles.sheetButtonText}>{label}</Text>
    </Pressable>
  );
}

function ScanPermissionState({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.permissionScreen}>
      <EmptyNotice title={title} body={body} />
      {actionLabel && onAction ? (
        <SheetButton label={actionLabel} icon="camera-outline" onPress={onAction} />
      ) : null}
    </View>
  );
}

export default function ScanItemScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pantryItemsRef = useRef<PantryItem[]>([]);
  const processingBarcodeRef = useRef(false);
  const openingItemRef = useRef(false);
  const [permission, requestPermission] = useCameraPermissions();
  const {
    addItem,
    isAuthenticated,
    itemBusy,
    moveItemToPantry,
    pantryItems,
    selectedPantry,
    selectedPantryId,
    status,
    updateItem,
  } = useAppContext();

  const [mode, setMode] = useState<ScanMode>('barcode');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isProcessingBarcode, setIsProcessingBarcode] = useState(false);
  const [pendingItem, setPendingItem] = useState<PendingItem | null>(null);
  const [pendingName, setPendingName] = useState('');
  const [expirationEnabled, setExpirationEnabled] = useState(true);
  const [detectedExpirationDate, setDetectedExpirationDate] = useState<string | null>(null);
  const [expirationError, setExpirationError] = useState<string | null>(null);
  const [isCapturingExpiration, setIsCapturingExpiration] = useState(false);
  const [sheetError, setSheetError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    pantryItemsRef.current = pantryItems;
  }, [pantryItems]);

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

  const closeSheet = useCallback(() => {
    setPendingItem(null);
    setPendingName('');
    setExpirationEnabled(true);
    setDetectedExpirationDate(null);
    setExpirationError(null);
    setSheetError(null);
    setIsCapturingExpiration(false);
    setMode('barcode');
  }, []);

  const captureStillImage = useCallback(async () => {
    if (!isCameraReady || !cameraRef.current) {
      return null;
    }

    try {
      const picture: CameraCapturedPicture = await cameraRef.current.takePictureAsync({
        quality: 0.72,
        shutterSound: false,
      });
      return picture.uri ?? null;
    } catch {
      return null;
    }
  }, [isCameraReady]);

  const handleBarcodeScanned = useCallback(async (result: BarcodeScanningResult) => {
    if (processingBarcodeRef.current || openingItemRef.current || pendingItem || mode !== 'barcode') {
      return;
    }

    const barcode = normalizeScannedBarcode(result.data);

    if (!barcode) {
      return;
    }

    processingBarcodeRef.current = true;
    setIsProcessingBarcode(true);
    setSheetError(null);
    setExpirationError(null);

    try {
      void triggerMediumImpact();
      const capturedImage = await captureStillImage();
      const matchingPantryItem = pantryItemsRef.current.find((item) => !item.isInCart && matchesBarcode(item, barcode));

      if (matchingPantryItem) {
        openingItemRef.current = true;
        showToast('Already in pantry');
        setTimeout(() => {
          router.push(`/items/${matchingPantryItem.id}`);
          openingItemRef.current = false;
        }, 520);
        return;
      }

      const matchingCartItem = pantryItemsRef.current.find((item) => item.isInCart && matchesBarcode(item, barcode));

      if (matchingCartItem && !matchingCartItem.expirationDate) {
        await moveItemToPantry(matchingCartItem.id);
        showToast('Moved to pantry');
        return;
      }

      if (matchingCartItem) {
        setPendingItem({
          kind: 'cart',
          item: matchingCartItem,
          capturedImage,
        });
        setExpirationEnabled(true);
        setDetectedExpirationDate(null);
        return;
      }

      setPendingItem({
        kind: 'unknown',
        barcode,
        capturedImage,
      });
      setPendingName('');
      setExpirationEnabled(true);
      setDetectedExpirationDate(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not process that barcode.';
      showToast(message);
    } finally {
      processingBarcodeRef.current = false;
      setIsProcessingBarcode(false);
    }
  }, [captureStillImage, mode, moveItemToPantry, pendingItem, router, showToast]);

  const beginExpirationScan = useCallback(() => {
    setExpirationError(null);
    setSheetError(null);
    setExpirationEnabled(true);
    setMode('expiration');
  }, []);

  const handleCaptureExpiration = useCallback(async () => {
    if (isCapturingExpiration) {
      return;
    }

    setExpirationError(null);
    setSheetError(null);
    setIsCapturingExpiration(true);

    try {
      const imageUri = await captureStillImage();

      if (!imageUri) {
        setExpirationError('Could not capture the expiration label. Try again.');
        return;
      }

      const scanResult = await extractExpirationDate(imageUri);

      if (scanResult.success && scanResult.date) {
        setDetectedExpirationDate(scanResult.date);
        setExpirationEnabled(true);
        return;
      }

      setExpirationError(scanResult.error ?? 'No expiration date was detected in that image.');
    } catch (error) {
      setExpirationError(error instanceof Error ? error.message : 'Expiration scan failed.');
    } finally {
      setIsCapturingExpiration(false);
    }
  }, [captureStillImage, isCapturingExpiration]);

  const handleMoveCartItem = useCallback(async (expirationDate: string | null) => {
    if (!pendingItem || pendingItem.kind !== 'cart') {
      return;
    }

    setSheetError(null);

    try {
      const originalExpiration = pendingItem.item.expirationDate;
      const nextExpiration = expirationEnabled ? expirationDate : null;

      if (nextExpiration === originalExpiration) {
        await moveItemToPantry(pendingItem.item.id);
      } else {
        await updateItem(pendingItem.item.id, makeCartMoveInput(pendingItem.item, nextExpiration));
      }

      closeSheet();
      showToast('Moved to pantry');
    } catch (error) {
      setSheetError(error instanceof Error ? error.message : 'Could not move item to pantry.');
    }
  }, [closeSheet, expirationEnabled, moveItemToPantry, pendingItem, showToast, updateItem]);

  const handleAddUnknownItem = useCallback(async (expirationDate: string | null) => {
    if (!pendingItem || pendingItem.kind !== 'unknown' || !selectedPantryId) {
      return;
    }

    const trimmedName = pendingName.trim();

    if (!trimmedName) {
      setSheetError('Name is required.');
      return;
    }

    setSheetError(null);

    try {
      await addItem({
        pantryId: selectedPantryId,
        name: trimmedName,
        barcode: pendingItem.barcode,
        image: pendingItem.capturedImage,
        expirationDate,
        isInCart: false,
        cartId: null,
        quantity: 1,
      });

      closeSheet();
      showToast('Added to pantry');
    } catch (error) {
      setSheetError(error instanceof Error ? error.message : 'Could not add item to pantry.');
    }
  }, [addItem, closeSheet, pendingItem, pendingName, selectedPantryId, showToast]);

  const canScanBarcode = permission?.granted && isCameraReady && !isProcessingBarcode && !pendingItem && mode === 'barcode';
  const canSaveUnknown = pendingItem?.kind === 'unknown' && pendingName.trim().length > 0 && !itemBusy;
  const activeExpirationDate = useMemo(() => {
    if (!pendingItem || !expirationEnabled) {
      return null;
    }

    if (detectedExpirationDate) {
      return detectedExpirationDate;
    }

    return pendingItem.kind === 'cart' ? pendingItem.item.expirationDate : null;
  }, [detectedExpirationDate, expirationEnabled, pendingItem]);

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
    return (
      <ScanPermissionState
        title="Camera access needed"
        body="Camera access is required to scan barcodes and expiration labels."
        actionLabel={permission.canAskAgain ? 'Allow Camera' : undefined}
        onAction={permission.canAskAgain ? () => void requestPermission() : undefined}
      />
    );
  }

  return (
    <View style={styles.screen}>
      <CameraView
        ref={cameraRef}
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
          <Text style={styles.title}>{mode === 'barcode' ? 'Scan a barcode' : 'Scan an expiration'}</Text>
          <View style={styles.topBarSpacer} />
        </View>

        <View style={styles.scanFrameShell}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>
            {mode === 'barcode' ? 'Align the barcode inside the frame' : 'Point at the printed date and tap capture'}
          </Text>
        </View>

        {cameraError ? (
          <View style={styles.statusPill}>
            <Text style={styles.statusText}>{cameraError}</Text>
          </View>
        ) : null}

        {isProcessingBarcode ? (
          <View style={styles.statusPill}>
            <ActivityIndicator size="small" color={appColors.textInverse} />
            <Text style={styles.statusText}>Checking barcode</Text>
          </View>
        ) : null}

        <View style={[styles.bottomActions, { paddingBottom: Math.max(insets.bottom, 18) }]}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Add item manually"
            accessibilityHint="Opens the manual item form"
            onPress={() => router.replace('/items/new')}
            style={({ pressed }) => [styles.manualButton, pressed ? styles.buttonPressed : null]}
          >
            <Ionicons name="create-outline" size={20} color={appColors.text} />
            <Text style={styles.manualButtonText}>Add item manually</Text>
          </Pressable>
        </View>
      </View>

      {toastMessage ? (
        <View pointerEvents="none" style={[styles.toast, { top: insets.top + 74 }]}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      ) : null}

      <BottomSheetModal visible={Boolean(pendingItem)} onClose={closeSheet} sheetStyle={styles.sheet}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.sheetKeyboard}>
          {pendingItem?.kind === 'cart' ? (
            <View style={styles.sheetContent}>
              <View style={styles.itemPreviewRow}>
                <View style={styles.itemImageShell}>
                  {pendingItem.item.image || pendingItem.capturedImage ? (
                    <Image source={{ uri: pendingItem.item.image ?? pendingItem.capturedImage ?? '' }} style={styles.itemImage} />
                  ) : (
                    <Ionicons name="cube-outline" size={24} color={appColors.muted} />
                  )}
                </View>
                <View style={styles.itemPreviewCopy}>
                  <Text style={styles.sheetTitle}>{pendingItem.item.name}</Text>
                  <Text style={styles.sheetSubtitle}>Found in cart</Text>
                </View>
              </View>

              <View style={styles.expirationRow}>
                <View style={styles.expirationCopy}>
                  <Text style={styles.fieldLabel}>Expiration</Text>
                  <Text style={styles.expirationValue}>
                    {expirationEnabled ? formatDisplayDate(activeExpirationDate) : 'No expiration date'}
                  </Text>
                  {pendingItem.item.expirationDate && expirationEnabled ? (
                    <Text style={styles.expirationMeta}>{formatExpirationLabel(activeExpirationDate)}</Text>
                  ) : null}
                </View>
                <Switch value={expirationEnabled} onValueChange={setExpirationEnabled} />
                <IconCircleButton icon="camera-outline" label="Replace expiration" onPress={beginExpirationScan} />
              </View>

              {mode === 'expiration' ? (
                <SheetButton
                  label={isCapturingExpiration ? 'Reading Date' : detectedExpirationDate ? 'Scan Again' : 'Capture Date'}
                  icon="camera"
                  variant="secondary"
                  disabled={isCapturingExpiration}
                  onPress={() => void handleCaptureExpiration()}
                />
              ) : null}

              {detectedExpirationDate ? (
                <View style={styles.successBox}>
                  <Text style={styles.successLabel}>Detected date</Text>
                  <Text style={styles.successValue}>{formatDisplayDate(detectedExpirationDate)}</Text>
                </View>
              ) : null}

              {expirationError ? <Text style={styles.errorText}>{expirationError}</Text> : null}
              {sheetError ? <Text style={styles.errorText}>{sheetError}</Text> : null}

              <View style={styles.actionRow}>
                {!expirationEnabled ? (
                  <SheetButton
                    label="Move Without Date"
                    icon="return-up-back-outline"
                    variant="secondary"
                    disabled={itemBusy}
                    onPress={() => void handleMoveCartItem(null)}
                  />
                ) : (
                  <SheetButton
                    label="Move to Pantry"
                    icon="checkmark"
                    disabled={itemBusy}
                    onPress={() => void handleMoveCartItem(activeExpirationDate)}
                  />
                )}
              </View>
            </View>
          ) : null}

          {pendingItem?.kind === 'unknown' ? (
            <View style={styles.sheetContent}>
              <View style={styles.itemPreviewRow}>
                <View style={styles.itemImageShell}>
                  {pendingItem.capturedImage ? (
                    <Image source={{ uri: pendingItem.capturedImage }} style={styles.itemImage} />
                  ) : (
                    <Ionicons name="barcode-outline" size={24} color={appColors.muted} />
                  )}
                </View>
                <View style={styles.itemPreviewCopy}>
                  <Text style={styles.sheetTitle}>New pantry item</Text>
                  <Text style={styles.sheetSubtitle}>{pendingItem.barcode}</Text>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.fieldLabel}>Name</Text>
                <TextInput
                  value={pendingName}
                  onChangeText={(value) => {
                    setPendingName(value);
                    setSheetError(null);
                  }}
                  placeholder="Item name"
                  placeholderTextColor={appColors.muted}
                  autoCapitalize="words"
                  autoCorrect
                  style={styles.textInput}
                />
              </View>

              {detectedExpirationDate ? (
                <View style={styles.successBox}>
                  <Text style={styles.successLabel}>Detected expiration</Text>
                  <Text style={styles.successValue}>{formatDisplayDate(detectedExpirationDate)}</Text>
                </View>
              ) : mode === 'expiration' ? (
                <View style={styles.expirationPrompt}>
                  <Text style={styles.fieldLabel}>Expiration scan</Text>
                  <View style={styles.actionRow}>
                    <SheetButton
                      label={isCapturingExpiration ? 'Reading Date' : 'Capture Date'}
                      icon="camera"
                      variant="secondary"
                      disabled={isCapturingExpiration}
                      onPress={() => void handleCaptureExpiration()}
                    />
                    <SheetButton
                      label="Skip"
                      icon="play-skip-forward-outline"
                      disabled={!canSaveUnknown}
                      onPress={() => void handleAddUnknownItem(null)}
                    />
                  </View>
                </View>
              ) : (
                <View style={styles.expirationPrompt}>
                  <Text style={styles.fieldLabel}>Add expiration?</Text>
                  <View style={styles.actionRow}>
                    <SheetButton
                      label="Scan Expiration"
                      icon="camera-outline"
                      variant="secondary"
                      onPress={beginExpirationScan}
                    />
                    <SheetButton
                      label="Skip"
                      icon="play-skip-forward-outline"
                      disabled={!canSaveUnknown}
                      onPress={() => void handleAddUnknownItem(null)}
                    />
                  </View>
                </View>
              )}

              {expirationError ? <Text style={styles.errorText}>{expirationError}</Text> : null}
              {sheetError ? <Text style={styles.errorText}>{sheetError}</Text> : null}

              {detectedExpirationDate || expirationError ? (
                <View style={styles.actionRow}>
                  <SheetButton
                    label="Skip Date"
                    icon="play-skip-forward-outline"
                    variant="secondary"
                    disabled={!canSaveUnknown}
                    onPress={() => void handleAddUnknownItem(null)}
                  />
                  <SheetButton
                    label="Add to Pantry"
                    icon="checkmark"
                    disabled={!canSaveUnknown || !detectedExpirationDate}
                    onPress={() => void handleAddUnknownItem(detectedExpirationDate)}
                  />
                </View>
              ) : null}
            </View>
          ) : null}
        </KeyboardAvoidingView>
      </BottomSheetModal>
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
    justifyContent: 'center',
    gap: 16,
    padding: 20,
    backgroundColor: appColors.background,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topBar: {
    minHeight: 44,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  topBarSpacer: {
    width: 44,
    height: 44,
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
  scanFrameShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 36,
  },
  scanFrame: {
    width: '100%',
    maxWidth: 320,
    aspectRatio: 1.58,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.86)',
    backgroundColor: 'rgba(0, 0, 0, 0.06)',
  },
  scanHint: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowRadius: 8,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  manualButton: {
    minHeight: 52,
    borderRadius: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  manualButtonText: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  statusPill: {
    position: 'absolute',
    alignSelf: 'center',
    top: '18%',
    minHeight: 38,
    borderRadius: 19,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
  },
  statusText: {
    color: appColors.textInverse,
    fontSize: 13,
    fontWeight: '800',
  },
  toast: {
    position: 'absolute',
    alignSelf: 'center',
    maxWidth: '84%',
    minHeight: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.74)',
  },
  toastText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  sheet: {
    paddingHorizontal: 16,
    gap: 12,
  },
  sheetKeyboard: {
    gap: 12,
  },
  sheetContent: {
    gap: 14,
  },
  itemPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemImageShell: {
    width: 58,
    height: 58,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemPreviewCopy: {
    flex: 1,
    gap: 4,
  },
  sheetTitle: {
    color: appColors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  sheetSubtitle: {
    color: appColors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldLabel: {
    color: appColors.text,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  expirationRow: {
    minHeight: 66,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  expirationCopy: {
    flex: 1,
    gap: 3,
  },
  expirationValue: {
    color: appColors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  expirationMeta: {
    color: appColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  inputGroup: {
    gap: 6,
  },
  textInput: {
    minHeight: 50,
    borderRadius: 16,
    paddingHorizontal: 14,
    color: appColors.text,
    fontSize: 16,
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  expirationPrompt: {
    gap: 10,
  },
  successBox: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 3,
    backgroundColor: appColors.accentSoft,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  successLabel: {
    color: appColors.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  successValue: {
    color: appColors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    color: appColors.danger,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  sheetButton: {
    minHeight: 48,
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  sheetButtonPrimary: {
    backgroundColor: appColors.tint,
  },
  sheetButtonSecondary: {
    backgroundColor: appColors.tintSoft,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  sheetButtonDanger: {
    backgroundColor: appColors.dangerSoft,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  sheetButtonText: {
    color: appColors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  sheetButtonPrimaryText: {
    color: appColors.textInverse,
    fontSize: 14,
    fontWeight: '800',
  },
  buttonPressed: {
    opacity: 0.58,
  },
});
