let pendingScannedBarcode: string | null = null;

export function setPendingScannedBarcode(value: string) {
  pendingScannedBarcode = value;
}

export function consumePendingScannedBarcode() {
  const value = pendingScannedBarcode;
  pendingScannedBarcode = null;
  return value;
}
