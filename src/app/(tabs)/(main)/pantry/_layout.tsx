import { Stack } from 'expo-router';
import { Platform } from 'react-native';

import { AndroidAvatarSidebarButton } from '@/components/navigation/android-avatar-sidebar-button/android-avatar-sidebar-button';
import { COMPACT_SHEET_DETENT, REVIEW_SHEET_DETENTS } from '@/components/sheets/sheet-presets/sheet-presets';
import { useAppTheme } from '@/lib/theme';

export default function PantryLayout() {
  const {colors} = useAppTheme();

  return (
    <Stack
      screenOptions={{
        title: 'Pantry',
        headerLargeTitle: Platform.OS === 'ios',
        headerTransparent: Platform.OS === 'ios',
        headerShadowVisible: false,
        headerStyle: {
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : colors.background,
        },
        headerTintColor: colors.tint,
        headerTitleStyle: {color: colors.text},
        headerLargeTitleStyle: {color: colors.text},
        headerRight: Platform.OS === 'ios' ? undefined : () => <AndroidAvatarSidebarButton />,
      }}
    >
      <Stack.Screen name="index" options={{title: 'Pantry'}} />
      <Stack.Screen
        name="sort"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          title: 'Sort',
          sheetCornerRadius: Platform.OS === 'ios' ? 24 : undefined,
          sheetElevation: Platform.OS === 'ios' ? 24 : undefined,
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
          headerTransparent: Platform.OS === 'ios',
          contentStyle: Platform.OS === 'ios' ? {backgroundColor: 'transparent'} : undefined,
        }}
      />
      <Stack.Screen
        name="quantity"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          sheetCornerRadius: Platform.OS === 'ios' ? 24 : undefined,
          sheetAllowedDetents: Platform.OS === 'ios' ? [COMPACT_SHEET_DETENT] : undefined,
          sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
          sheetExpandsWhenScrolledToEdge: Platform.OS === 'ios' ? true : undefined,
          sheetElevation: Platform.OS === 'ios' ? 24 : undefined,
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
          headerTransparent: Platform.OS === 'ios',
          contentStyle: Platform.OS === 'ios' ? {backgroundColor: 'transparent'} : undefined,
        }}
      />
      <Stack.Screen
        name="review-expiration"
        options={{
          presentation: Platform.OS === 'ios' ? 'formSheet' : 'modal',
          sheetCornerRadius: Platform.OS === 'ios' ? 24 : undefined,
          sheetAllowedDetents: Platform.OS === 'ios' ? [...REVIEW_SHEET_DETENTS] : undefined,
          sheetInitialDetentIndex: Platform.OS === 'ios' ? 0 : undefined,
          sheetExpandsWhenScrolledToEdge: Platform.OS === 'ios' ? true : undefined,
          sheetElevation: Platform.OS === 'ios' ? 24 : undefined,
          animation: 'slide_from_bottom',
          gestureDirection: 'vertical',
          headerTransparent: Platform.OS === 'ios',
          contentStyle: Platform.OS === 'ios' ? {backgroundColor: 'transparent'} : undefined,
        }}
      />
    </Stack>
  );
}
