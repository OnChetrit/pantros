import { padding, presentationDetents, presentationDragIndicator } from '@expo/ui/swift-ui/modifiers';

export const SHEET_HORIZONTAL_PADDING = 20;
const SHEET_TOP_PADDING = 12;
const SHEET_BOTTOM_PADDING = 20;
export const FORM_SHEET_DETENT = 0.96;

export function createBottomSheetModifiers(height?: number) {
  return [
    padding({
      top: SHEET_TOP_PADDING,
      leading: SHEET_HORIZONTAL_PADDING,
      trailing: SHEET_HORIZONTAL_PADDING,
      bottom: SHEET_BOTTOM_PADDING,
    }),
    presentationDragIndicator('hidden'),
    ...(height ? [presentationDetents([{height}])] : []),
  ];
}
