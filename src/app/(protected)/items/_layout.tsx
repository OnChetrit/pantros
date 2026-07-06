import { Platform } from 'react-native';
import { Stack } from 'expo-router';

import { FORM_SHEET_DETENT } from '@/components/sheets/sheet-presets/sheet-presets';

export default function ProtectedItemsLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="scan"
        options={{
          headerShown: false,
          presentation: 'fullScreenModal',
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="new"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          title: '',
          sheetGrabberVisible: true,
          sheetCornerRadius: 24,
          sheetAllowedDetents: Platform.OS === 'ios' ? [FORM_SHEET_DETENT] : undefined,
          sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
          sheetExpandsWhenScrolledToEdge: true,
          sheetElevation: 24,
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          title: '',
          sheetGrabberVisible: Platform.OS === 'ios' ? true : undefined,
          sheetCornerRadius: Platform.OS === 'ios' ? 24 : undefined,
          sheetAllowedDetents: Platform.OS === 'ios' ? [FORM_SHEET_DETENT] : undefined,
          sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
          sheetExpandsWhenScrolledToEdge: Platform.OS === 'ios' ? true : undefined,
        }}
      />
    </Stack>
  );
}
