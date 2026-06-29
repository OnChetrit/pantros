import type { PantryItem, PantryItemInput } from '@/domain/models';

export function normalizeOptionalText(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function isValidIsoDate(value: string) {
  if (!value) {
    return true;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime());
}

function getComparableItemInput(item: PantryItem | undefined, primaryCartId: string | null) {
  if (!item) {
    return {
      name: '',
      barcode: null,
      image: null,
      expirationDate: null,
      isInCart: false,
      cartId: null,
      quantity: 1,
    };
  }

  return {
    name: item.name,
    barcode: item.barcode,
    image: item.image,
    expirationDate: item.expirationDate,
    isInCart: item.isInCart,
    cartId: item.isInCart ? (item.cartId ?? primaryCartId ?? null) : null,
    quantity: item.isInCart ? item.quantity : 1,
  };
}

export function buildItemInput({
  selectedPantryId,
  name,
  barcode,
  image,
  expirationDate,
  isInCart,
  nextCartId,
  parsedQuantity,
}: {
  selectedPantryId: string | null;
  name: string;
  barcode: string;
  image: string;
  expirationDate: string;
  isInCart: boolean;
  nextCartId: string | null;
  parsedQuantity: number | null;
}): PantryItemInput | null {
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
}

export function hasItemInputChanges(
  currentInput: PantryItemInput | null,
  item: PantryItem | undefined,
  primaryCartId: string | null
) {
  if (!currentInput) {
    return false;
  }

  const initialInput = getComparableItemInput(item, primaryCartId);

  return (
    currentInput.name !== initialInput.name ||
    currentInput.barcode !== initialInput.barcode ||
    currentInput.image !== initialInput.image ||
    currentInput.expirationDate !== initialInput.expirationDate ||
    currentInput.isInCart !== initialInput.isInCart ||
    currentInput.cartId !== initialInput.cartId ||
    currentInput.quantity !== initialInput.quantity
  );
}
