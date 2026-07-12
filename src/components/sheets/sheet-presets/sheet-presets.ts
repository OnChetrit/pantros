import { Platform } from 'react-native';

export const FORM_SHEET_DETENT = 0.96;
export const COMPACT_SHEET_DETENT = 0.38;
export const REVIEW_SHEET_DETENTS = [0.72, FORM_SHEET_DETENT] as const;

export function createFormSheetOptions({
  detents,
  title = '',
}: {
  detents?: readonly number[];
  title?: string;
}) {
  const isIos = Platform.OS === 'ios';

  return {
    presentation: isIos ? ('formSheet' as const) : ('modal' as const),
    title,
    sheetGrabberVisible: isIos ? true : undefined,
    sheetCornerRadius: isIos ? 24 : undefined,
    sheetAllowedDetents: isIos ? [...(detents ?? [FORM_SHEET_DETENT])] : undefined,
    sheetInitialDetentIndex: isIos ? 0 : undefined,
    sheetExpandsWhenScrolledToEdge: isIos ? true : undefined,
    sheetElevation: isIos ? 24 : undefined,
    animation: 'slide_from_bottom' as const,
    gestureDirection: 'vertical' as const,
    headerTransparent: isIos,
    contentStyle: isIos ? {backgroundColor: 'transparent'} : undefined,
  };
}
