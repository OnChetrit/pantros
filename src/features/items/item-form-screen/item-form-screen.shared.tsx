import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert } from 'react-native';

import type { PantryItem, PantryItemInput } from '@/domain/models';
import { matchPantryItems } from '@/lib/pantry-insights';
import { useItemState } from '@/state/item-state';
import { useWorkspaceState } from '@/state/workspace-state';

import { buildItemInput, hasItemInputChanges, isValidIsoDate } from '../item-form/item-form.utils';

export type ItemFormScreenProps = {
  initialBarcode?: string | null;
  item?: PantryItem;
  initialName?: string | null;
};

export { ItemFormBody } from '../item-form-body/item-form-body';
export { ItemFormSaveButton } from '../item-form-save-button/item-form-save-button';

export function useItemFormController({initialBarcode, item, initialName}: ItemFormScreenProps) {
  const router = useRouter();
  const {addItem, itemBusy, updateItem} = useItemState();
  const {pantryCarts, pantryItems, selectedPantry, selectedPantryId} = useWorkspaceState();

  const primaryCartId = pantryCarts.find(cart => cart.isPrimary)?.id ?? pantryCarts[0]?.id ?? null;

  const [name, setName] = useState(item?.name ?? initialName ?? '');
  const [quantity, setQuantity] = useState(String(item?.quantity ?? 1));
  const [barcode, setBarcode] = useState(item?.barcode ?? initialBarcode ?? '');
  const [image, setImage] = useState(item?.image ?? '');
  const [expirationDate, setExpirationDate] = useState(item?.expirationDate ?? '');
  const [isInCart, setIsInCart] = useState(item?.isInCart ?? false);
  const [formError, setFormError] = useState<string | null>(null);

  const title = item ? 'Edit Item' : 'Add Item';
  const parsedQuantity = useMemo(() => {
    const value = Number.parseInt(quantity, 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  }, [quantity]);

  const nameMatches = useMemo(() => {
    if (item) {
      return null;
    }

    return matchPantryItems(pantryItems, name);
  }, [item, name, pantryItems]);

  const duplicateCandidates = useMemo(() => {
    if (item || !nameMatches || nameMatches.normalizedQuery.length < 2) {
      return [];
    }

    const candidates = nameMatches.exactNameMatch ? [nameMatches.exactNameMatch] : [];

    for (const candidate of nameMatches.partialMatches) {
      if (candidates.some(entry => entry.id === candidate.id)) {
        continue;
      }

      candidates.push(candidate);

      if (candidates.length === 4) {
        break;
      }
    }

    return candidates;
  }, [item, nameMatches]);

  const exactDuplicate = useMemo(() => {
    if (item || !nameMatches?.normalizedQuery) {
      return null;
    }

    return nameMatches.exactNameMatch;
  }, [item, nameMatches]);

  const nextCartId = isInCart ? (item?.cartId ?? primaryCartId ?? null) : null;
  const currentInput = useMemo<PantryItemInput | null>(() => {
    return buildItemInput({
      selectedPantryId,
      name,
      barcode,
      image,
      expirationDate,
      isInCart,
      nextCartId,
      parsedQuantity,
    });
  }, [barcode, expirationDate, image, isInCart, name, nextCartId, parsedQuantity, selectedPantryId]);

  const hasChanges = useMemo(() => {
    return hasItemInputChanges(currentInput, item, primaryCartId);
  }, [currentInput, item, primaryCartId]);

  const canSave =
    Boolean(selectedPantryId) &&
    hasChanges &&
    name.trim().length > 0 &&
    isValidIsoDate(expirationDate) &&
    (!isInCart || Boolean(parsedQuantity));

  const handlePickAsset = async (source: 'camera' | 'library') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        source === 'camera'
          ? 'Camera access is required for this action.'
          : 'Photo library access is required for this action.'
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

    setImage(result.assets[0].uri);
  };

  const openImageSourcePicker = () => {
    Alert.alert('Insert Image', 'Choose how to add the item image.', [
      {
        text: 'Camera',
        onPress: () => {
          void handlePickAsset('camera');
        },
      },
      {
        text: 'Camera Roll',
        onPress: () => {
          void handlePickAsset('library');
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
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

  return {
    canSave,
    duplicateCandidates,
    exactDuplicate,
    formError,
    handleMissingPantry,
    handleSave,
    image,
    isInCart,
    itemBusy,
    name,
    parsedQuantity,
    router,
    selectedPantry,
    setBarcode,
    setExpirationDate,
    setImage,
    setIsInCart,
    setName,
    setQuantity,
    title,
    barcode,
    expirationDate,
    item,
    openImageSourcePicker,
  };
}
