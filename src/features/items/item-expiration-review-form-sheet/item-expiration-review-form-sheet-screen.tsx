import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyNotice } from '@/components/ui/primitives';
import { ItemExpirationModePicker } from '@/features/items/item-expiration-mode-picker/item-expiration-mode-picker';
import { useAppTheme } from '@/lib/theme';
import { useAppContext } from '@/state/app-context';

import { RelativePicker } from '@/features/cart/cart-expiration-review-modal/cart-expiration-review-modal-relative-picker';
import {
  addRelativeDate,
  dayOptions,
  formatExpiration,
  initialRelativeState,
  monthOptions,
  parseIsoDate,
  styles as sharedStyles,
  startOfDay,
  toIsoDate,
  weekOptions,
  type ExpirationMode,
} from '@/features/cart/cart-expiration-review-modal/cart-expiration-review-modal.shared';

export function ItemExpirationReviewFormSheetScreen() {
  const {itemId} = useLocalSearchParams<{itemId?: string | string[]}>();
  const resolvedItemId = Array.isArray(itemId) ? itemId[0] : itemId;
  const {itemBusy, pantryItems, updateItem} = useAppContext();
  const item = pantryItems.find(entry => entry.id === resolvedItemId);

  return (
    <>
      <Stack.Screen
        options={{
          title: item?.name,
          headerBackVisible: false,
          headerLargeTitleEnabled: false,
        }}
      />
      {item ? (
        <ExpirationReviewFormContent key={item.id} item={item} itemBusy={itemBusy} updateItem={updateItem} />
      ) : (
        <EmptyNotice
          title="Item not found"
          body="The selected pantry item is no longer present in the loaded workspace."
        />
      )}
    </>
  );
}

function ExpirationReviewFormContent({
  item,
  itemBusy,
  updateItem,
}: {
  item: NonNullable<ReturnType<typeof useAppContext>['pantryItems'][number]>;
  itemBusy: boolean;
  updateItem: ReturnType<typeof useAppContext>['updateItem'];
}) {
  const {colors, isDark} = useAppTheme();
  const router = useRouter();
  const initialReviewDate = item.expirationDate ?? '';
  const initialRelativeDate = initialRelativeState(initialReviewDate);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<ExpirationMode>('manual');
  const [manualDate, setManualDate] = useState(() => parseIsoDate(initialReviewDate) ?? startOfDay(new Date()));
  const [relativeDays, setRelativeDays] = useState(initialRelativeDate.days);
  const [relativeWeeks, setRelativeWeeks] = useState(initialRelativeDate.weeks);
  const [relativeMonths, setRelativeMonths] = useState(initialRelativeDate.months);

  const resolvedDate = useMemo(() => {
    if (mode === 'manual') {
      return toIsoDate(manualDate);
    }

    return toIsoDate(addRelativeDate(relativeDays, relativeWeeks, relativeMonths));
  }, [manualDate, mode, relativeDays, relativeWeeks, relativeMonths]);
  const hasChanges = resolvedDate !== initialReviewDate;
  const saveDisabled = itemBusy || !hasChanges;

  const handleClose = () => {
    if (itemBusy) {
      return;
    }

    if (!hasChanges) {
      router.back();
      return;
    }

    Alert.alert('Discard changes?', 'Your expiration changes will be lost.', [
      {text: 'Keep Editing', style: 'cancel'},
      {
        text: 'Discard Changes',
        style: 'destructive',
        onPress: () => router.back(),
      },
    ]);
  };

  const handleSave = async () => {
    if (saveDisabled) {
      return;
    }

    try {
      setErrorMessage(null);
      await updateItem(item.id, {
        pantryId: item.pantryId,
        name: item.name,
        barcode: item.barcode,
        image: item.image,
        expirationDate: resolvedDate || null,
        isInCart: item.isInCart,
        cartId: item.cartId,
        quantity: item.quantity,
      });
      router.back();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save expiration date.');
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: item.name,
          headerBackVisible: false,
          headerLargeTitleEnabled: false,
        }}
      />
      {process.env.EXPO_OS === 'ios' ? (
        <>
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button icon="xmark" onPress={handleClose} tintColor="#FFFFFF" />
          </Stack.Toolbar>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button icon="checkmark" onPress={() => void handleSave()} disabled={saveDisabled} />
          </Stack.Toolbar>
        </>
      ) : null}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.screen}>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[sharedStyles.previewCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <Text style={[sharedStyles.previewLabel, {color: colors.muted}]}>Selected date</Text>
            <Text style={[sharedStyles.previewValue, {color: colors.text}]}>{formatExpiration(resolvedDate)}</Text>
          </View>
          {mode === 'manual' ? (
            <View style={[sharedStyles.dateCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <DateTimePicker
                value={manualDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={(_, selectedDate) => {
                  if (selectedDate) {
                    setManualDate(selectedDate);
                  }
                }}
                themeVariant={isDark ? 'dark' : 'light'}
                accentColor={colors.tint}
                textColor={colors.text}
                style={sharedStyles.datePicker}
              />
            </View>
          ) : (
            <View style={sharedStyles.relativeInlineRow}>
              <RelativePicker label="Days" value={relativeDays} options={dayOptions} onChange={setRelativeDays} />
              <RelativePicker label="Weeks" value={relativeWeeks} options={weekOptions} onChange={setRelativeWeeks} />
              <RelativePicker
                label="Months"
                value={relativeMonths}
                options={monthOptions}
                onChange={setRelativeMonths}
              />
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <ItemExpirationModePicker mode={mode} onChange={setMode} />
          {errorMessage ? <Text style={[styles.errorText, {color: colors.danger}]}>{errorMessage}</Text> : null}
          {!hasChanges ? <Text style={[styles.helperText, {color: colors.muted}]}>No changes yet.</Text> : null}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  content: {
    flexGrow: 1,
    paddingTop: 16,
    gap: 16,
  },
  footer: {
    gap: 12,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500',
    textAlign: 'center',
  },
});
