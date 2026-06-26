import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { AppTextInput, EmptyNotice, appColors } from '@/components/ui/primitives';
import type { PantryItem, PantryItemInput } from '@/domain/models';
import { useAiConsent } from '@/hooks/use-ai-consent';
import { useAppContext } from '@/state/app-context';

import { extractBarcodeValue } from './barcode-ai';
import { ItemExpirationField } from './item-expiration-field';

function normalizeOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function isValidIsoDate(value: string) {
  if (!value) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function FieldLabel({ children }: { children: string }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

export function ItemFormScreen({ item }: { item?: PantryItem }) {
  const router = useRouter();
  const { addItem, itemBusy, pantryCarts, pantryItems, selectedPantry, selectedPantryId, updateItem } = useAppContext();
  const { ensureAiConsent } = useAiConsent();

  const primaryCartId = pantryCarts.find((cart) => cart.isPrimary)?.id ?? pantryCarts[0]?.id ?? null;

  const [name, setName] = useState(item?.name ?? '');
  const [quantity, setQuantity] = useState('1');
  const [barcode, setBarcode] = useState(item?.barcode ?? '');
  const [image, setImage] = useState(item?.image ?? '');
  const [expirationDate, setExpirationDate] = useState(item?.expirationDate ?? '');
  const [isInCart, setIsInCart] = useState(item?.isInCart ?? false);
  const [formError, setFormError] = useState<string | null>(null);
  const [barcodeBusy, setBarcodeBusy] = useState(false);
  const [barcodeError, setBarcodeError] = useState<string | null>(null);

  const title = item ? 'Edit Item' : 'Add Item';
  const normalizedName = name.trim().toLowerCase();
  const parsedQuantity = useMemo(() => {
    const value = Number.parseInt(quantity, 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [quantity]);

  const duplicateCandidates = useMemo(() => {
    const query = normalizedName;

    if (item || query.length < 2) {
      return [];
    }

    return pantryItems
      .filter((entry) => entry.name.toLowerCase().includes(query))
      .slice(0, 4);
  }, [item, normalizedName, pantryItems]);

  const exactDuplicate = useMemo(() => {
    if (item || !normalizedName) {
      return null;
    }

    return pantryItems.find((entry) => entry.name.trim().toLowerCase() === normalizedName) ?? null;
  }, [item, normalizedName, pantryItems]);

  const nextCartId = isInCart ? item?.cartId ?? primaryCartId ?? null : null;
  const currentInput = useMemo<PantryItemInput | null>(() => {
    if (!selectedPantryId) {
      return null;
    }

    return {
      pantryId: selectedPantryId,
      name: name.trim(),
      barcode: normalizeOptionalText(barcode),
      image: normalizeOptionalText(image),
      expirationDate: normalizeOptionalText(expirationDate),
      isInCart,
      cartId: nextCartId,
      quantity: isInCart ? (parsedQuantity ?? 1) : 1,
    };
  }, [barcode, expirationDate, image, isInCart, name, nextCartId, parsedQuantity, selectedPantryId]);

  const hasChanges = useMemo(() => {
    if (!currentInput) {
      return false;
    }

    const initialInput = item
      ? {
          name: item.name,
          barcode: item.barcode,
          image: item.image,
          expirationDate: item.expirationDate,
          isInCart: item.isInCart,
          cartId: item.isInCart ? item.cartId ?? primaryCartId ?? null : null,
          quantity: item.isInCart ? 1 : 1,
        }
      : {
          name: '',
          barcode: null,
          image: null,
          expirationDate: null,
          isInCart: false,
          cartId: null,
          quantity: 1,
        };

    return (
      currentInput.name !== initialInput.name ||
      currentInput.barcode !== initialInput.barcode ||
      currentInput.image !== initialInput.image ||
      currentInput.expirationDate !== initialInput.expirationDate ||
      currentInput.isInCart !== initialInput.isInCart ||
      currentInput.cartId !== initialInput.cartId ||
      currentInput.quantity !== initialInput.quantity
    );
  }, [currentInput, item, primaryCartId]);

  const canSave =
    Boolean(selectedPantryId) &&
    hasChanges &&
    name.trim().length > 0 &&
    isValidIsoDate(expirationDate) &&
    (!isInCart || Boolean(parsedQuantity));

  const openImageSourcePicker = (mode: 'image' | 'barcode') => {
    const actionTitle = mode === 'image' ? 'Insert Image' : 'Scan Barcode';
    const actionMessage = mode === 'image' ? 'Choose how to add the item image.' : 'Choose how to capture the barcode.';

    Alert.alert(actionTitle, actionMessage, [
      {
        text: 'Camera',
        onPress: () => {
          void handlePickAsset('camera', mode);
        },
      },
      {
        text: 'Camera Roll',
        onPress: () => {
          void handlePickAsset('library', mode);
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  const handlePickAsset = async (source: 'camera' | 'library', mode: 'image' | 'barcode') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        source === 'camera'
          ? 'Camera access is required for this action.'
          : 'Photo library access is required for this action.',
      );
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.8,
          });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    const imageUri = result.assets[0].uri;

    if (mode === 'image') {
      setImage(imageUri);
      return;
    }

    const allowed = await ensureAiConsent();

    if (!allowed) {
      setBarcodeError('AI scanning is off until you accept the disclosure. You can enter the barcode manually.');
      return;
    }

    setBarcodeBusy(true);
    setBarcodeError(null);

    if (!image) {
      setImage(imageUri);
    }

    const scanned = await extractBarcodeValue(imageUri);
    setBarcodeBusy(false);

    if (scanned.success && scanned.barcode) {
      setBarcode(scanned.barcode);
      return;
    }

    setBarcodeError(scanned.error ?? 'No barcode digits were detected in that image.');
  };

  const handleSave = async () => {
    if (!selectedPantryId) {
      setFormError('Select or create a pantry before adding items.');
      return;
    }

    if (!canSave || (isInCart && !parsedQuantity)) {
      setFormError('Use a name, an optional expiration date, and a positive quantity for cart items.');
      return;
    }

    if (exactDuplicate) {
      router.replace(`/items/${exactDuplicate.id}`);
      return;
    }

    if (!currentInput) {
      return;
    }

    try {
      if (item) {
        await updateItem(item.id, currentInput);
      } else {
        await addItem(currentInput);
      }

      router.back();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save item.';
      setFormError(message);
    }
  };

  const handleMissingPantry = () => {
    Alert.alert('No pantry selected', 'Create or join a pantry before adding items.');
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
      <Stack.Screen
        options={{
          title,
          headerTitleAlign: 'center',
          headerBackVisible: Boolean(item) || Platform.OS !== 'ios',
          headerBackButtonDisplayMode: item && Platform.OS === 'ios' ? 'minimal' : undefined,
          headerRight: () => (
            <Pressable
              onPress={selectedPantry ? () => void handleSave() : handleMissingPantry}
              disabled={itemBusy || !canSave}
              accessibilityRole="button"
              accessibilityLabel={item ? 'Save item' : 'Add item'}
              style={({ pressed }) => [
                styles.headerActionButton,
                (pressed || itemBusy || !canSave) ? styles.headerActionButtonPressed : null,
              ]}
            >
              <Ionicons
                name="checkmark"
                size={24}
                color={itemBusy || !canSave ? appColors.muted : appColors.tint}
              />
            </Pressable>
          ),
          unstable_headerLeftItems:
            Platform.OS === 'ios' && !item
              ? () => [
                  {
                    type: 'button',
                    label: 'Close',
                    icon: { type: 'sfSymbol', name: 'xmark' },
                    onPress: () => router.back(),
                    tintColor: appColors.tint,
                  },
                ]
              : undefined,
        }}
      />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        contentInsetAdjustmentBehavior="automatic"
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.heroRow}>
          <Pressable onPress={() => openImageSourcePicker('image')} style={styles.imageButton}>
            {image ? (
              <Image source={{ uri: image }} style={styles.imagePreview} />
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>No Image</Text>
              </View>
            )}
          </Pressable>
        </View>

        {!selectedPantry ? (
          <EmptyNotice
            title="No pantry selected"
            body="Items belong to a pantry workspace. Select or create a pantry before adding inventory."
          />
        ) : null}

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <FieldLabel>Name</FieldLabel>
            <AppTextInput value={name} onChangeText={setName} placeholder="" />
            {duplicateCandidates.length > 0 ? (
              <View style={styles.suggestionList}>
                {duplicateCandidates.map((candidate) => {
                  const isExact = candidate.id === exactDuplicate?.id;

                  return (
                    <Pressable
                      key={candidate.id}
                      onPress={() => router.replace(`/items/${candidate.id}`)}
                      style={({ pressed }) => [
                        styles.suggestionRow,
                        isExact ? styles.suggestionRowExact : null,
                        pressed ? styles.suggestionRowPressed : null,
                      ]}
                    >
                      <Text style={styles.suggestionName}>{candidate.name}</Text>
                      <Text style={styles.suggestionAction}>{isExact ? 'Open existing' : 'Use existing'}</Text>
                    </Pressable>
                  );
                })}
              </View>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <FieldLabel>Barcode</FieldLabel>
            <AppTextInput
              value={barcode}
              onChangeText={setBarcode}
              placeholder=""
              autoCapitalize="none"
              rightSlot={
                <Pressable
                  onPress={() => openImageSourcePicker('barcode')}
                  accessibilityRole="button"
                  accessibilityLabel="Scan barcode"
                  style={({ pressed }) => [styles.inputIconButton, pressed ? styles.inputIconButtonPressed : null]}
                >
                  <Ionicons name="scan-outline" size={20} color={appColors.tint} />
                </Pressable>
              }
            />
            {barcodeBusy ? (
              <View style={styles.inlineStatus}>
                <ActivityIndicator color={appColors.tint} size="small" />
                <Text style={styles.inlineStatusText}>Reading barcode from image…</Text>
              </View>
            ) : null}
            {barcodeError ? (
              <View style={styles.inlineError}>
                <Text style={styles.inlineErrorText}>{barcodeError}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.fieldGroup}>
            <View style={styles.fieldHeader}>
              <FieldLabel>Add To Cart</FieldLabel>
              <Switch value={isInCart} onValueChange={setIsInCart} />
            </View>
          </View>

          {isInCart ? (
            <View style={styles.fieldGroup}>
              <FieldLabel>Quantity</FieldLabel>
              <View style={styles.stepper}>
                <Pressable
                  onPress={() => {
                    const nextValue = Math.max(1, parsedQuantity ?? 1) - 1;
                    setQuantity(String(Math.max(1, nextValue)));
                  }}
                  style={({ pressed }) => [styles.stepperButton, pressed ? styles.stepperButtonPressed : null]}
                >
                  <Ionicons name="remove" size={18} color={appColors.text} />
                </Pressable>
                <Text style={styles.stepperValue}>{parsedQuantity ?? 1}</Text>
                <Pressable
                  onPress={() => {
                    setQuantity(String((parsedQuantity ?? 1) + 1));
                  }}
                  style={({ pressed }) => [styles.stepperButton, pressed ? styles.stepperButtonPressed : null]}
                >
                  <Ionicons name="add" size={18} color={appColors.text} />
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>

        <ItemExpirationField value={expirationDate} onChange={setExpirationDate} />

        {formError ? <EmptyNotice title="Could not save item" body={formError} /> : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  scroll: {
    flex: 1,
    backgroundColor: appColors.background,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    gap: 10,
  },
  heroRow: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    overflow: 'hidden',
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  imagePreview: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.input,
  },
  imagePlaceholderText: {
    color: appColors.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  headerActionButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActionButtonPressed: {
    opacity: 0.5,
  },
  card: {
    borderRadius: 20,
    padding: 12,
    gap: 12,
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  fieldLabel: {
    color: appColors.text,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  suggestionList: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: appColors.border,
    backgroundColor: appColors.input,
  },
  suggestionRow: {
    minHeight: 40,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: appColors.border,
  },
  suggestionRowExact: {
    backgroundColor: appColors.tintSoft,
  },
  suggestionRowPressed: {
    opacity: 0.7,
  },
  suggestionName: {
    flex: 1,
    color: appColors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  suggestionAction: {
    color: appColors.tint,
    fontSize: 12,
    fontWeight: '800',
  },
  inputIconButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputIconButtonPressed: {
    opacity: 0.55,
  },
  inlineStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inlineStatusText: {
    color: appColors.muted,
    fontSize: 13,
  },
  inlineError: {
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: appColors.dangerSoft,
  },
  inlineErrorText: {
    color: appColors.text,
    fontSize: 13,
    lineHeight: 18,
  },
  stepper: {
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: appColors.input,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  stepperButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: appColors.card,
    borderWidth: 1,
    borderColor: appColors.border,
  },
  stepperButtonPressed: {
    opacity: 0.6,
  },
  stepperValue: {
    color: appColors.text,
    fontSize: 17,
    fontWeight: '800',
  },
});
