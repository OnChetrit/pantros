import DateTimePicker from '@react-native-community/datetimepicker';
import { Stack, useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { EmptyNotice } from '@/components/ui/primitives';
import { useCartCheckout } from '@/features/cart/cart-checkout-context/cart-checkout-context';
import {
  formatRelativeDuration,
  RelativeDatePickerRow,
  relativeDurationInDays,
} from '@/features/items/item-expiration-field/item-relative-picker';
import { ItemExpirationModePicker } from '@/features/items/item-expiration-mode-picker/item-expiration-mode-picker';
import { useAppTheme } from '@/lib/theme';

import { Spacer } from '@expo/ui';
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
} from './cart-expiration-review-modal.shared';

export function CartExpirationReviewScreen() {
  const {
    checkoutProgress,
    checkoutQueue,
    currentReviewItem,
    reviewDate,
    saveAndContinueReview,
    setReviewDate,
    skipCurrentReview,
    cancelReview,
  } = useCartCheckout();
  const {colors, isDark} = useAppTheme();
  const router = useRouter();

  useEffect(() => {
    if (!currentReviewItem) {
      router.back();
    }
  }, [currentReviewItem, router]);

  if (!currentReviewItem) {
    return (
      <EmptyNotice
        title="No item in review"
        body="The selected cart item is no longer waiting for an expiration date."
      />
    );
  }

  const reviewStep = checkoutQueue.findIndex(item => item.id === currentReviewItem.id) + 1;

  return (
    <CartExpirationReviewContent
      errorMessage={checkoutProgress.errorMessage}
      isDark={isDark}
      item={currentReviewItem}
      onCancel={cancelReview}
      onChangeDate={setReviewDate}
      onSave={() => void saveAndContinueReview()}
      onSkip={() => void skipCurrentReview()}
      processing={checkoutProgress.processing}
      reviewDate={reviewDate}
      step={reviewStep}
      totalSteps={checkoutQueue.length}
      colors={colors}
    />
  );
}

function CartExpirationReviewContent({
  item,
  reviewDate,
  processing,
  errorMessage,
  onChangeDate,
  onSave,
  onSkip,
  onCancel,
  colors,
  isDark,
  step,
  totalSteps,
}: {
  item: NonNullable<ReturnType<typeof useCartCheckout>['currentReviewItem']>;
  reviewDate: string;
  processing: boolean;
  errorMessage: string | null;
  onChangeDate: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onCancel: () => void;
  colors: ReturnType<typeof useAppTheme>['colors'];
  isDark: boolean;
  step: number;
  totalSteps: number;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<ExpirationMode>('manual');
  const [manualDate, setManualDate] = useState(() => parseIsoDate(reviewDate) ?? startOfDay(new Date()));
  const [relativeDays, setRelativeDays] = useState(() => initialRelativeState(reviewDate).days);
  const [relativeWeeks, setRelativeWeeks] = useState(() => initialRelativeState(reviewDate).weeks);
  const [relativeMonths, setRelativeMonths] = useState(() => initialRelativeState(reviewDate).months);
  const [initialReviewDate] = useState(reviewDate);

  const resolvedDate = useMemo(() => {
    if (mode === 'manual') {
      return toIsoDate(manualDate);
    }

    return toIsoDate(addRelativeDate(relativeDays, relativeWeeks, relativeMonths));
  }, [manualDate, mode, relativeDays, relativeWeeks, relativeMonths]);

  useEffect(() => {
    if (resolvedDate !== reviewDate) {
      onChangeDate(resolvedDate);
    }
  }, [onChangeDate, resolvedDate, reviewDate]);

  const hasChanges = resolvedDate !== initialReviewDate;
  const previewRelativeState =
    mode === 'relative'
      ? {days: relativeDays, weeks: relativeWeeks, months: relativeMonths}
      : initialRelativeState(resolvedDate);
  const isCloseExpiration =
    relativeDurationInDays(previewRelativeState.days, previewRelativeState.weeks, previewRelativeState.months) < 7;

  const handleClose = () => {
    if (processing) {
      return;
    }

    if (!hasChanges) {
      onCancel();
      router.back();
      return;
    }

    Alert.alert('Discard changes?', 'Your expiration changes will be lost.', [
      {text: 'Keep Editing', style: 'cancel'},
      {
        text: 'Discard Changes',
        style: 'destructive',
        onPress: () => {
          onCancel();
          router.back();
        },
      },
    ]);
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: item.name,
          headerLargeTitle: false,
        }}
      />
      {process.env.EXPO_OS === 'ios' ? (
        <>
          <Stack.Toolbar placement="left">
            <Stack.Toolbar.Button icon="xmark" onPress={handleClose} disabled={processing} />
          </Stack.Toolbar>
          <Stack.Toolbar placement="right">
            <Stack.Toolbar.Button disabled tintColor={colors.muted}>
              {`${step}/${totalSteps}`}
            </Stack.Toolbar.Button>
            <Stack.Toolbar.Button icon="forward.fill" onPress={onSkip} disabled={processing} />
            <Stack.Toolbar.Button onPress={onSave} disabled={!hasChanges || processing} variant="done">
              Save
            </Stack.Toolbar.Button>
          </Stack.Toolbar>
        </>
      ) : null}
      <View style={styles.screen}>
        <ScrollView
          style={styles.scroll}
          contentInsetAdjustmentBehavior="automatic"
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.previewCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
            <View style={styles.previewRow}>
              <Text
                selectable
                style={[
                  sharedStyles.previewValue,
                  {color: isCloseExpiration ? colors.warning : colors.tint, flexShrink: 1},
                ]}
              >
                {formatExpiration(resolvedDate)}
              </Text>
              <Spacer />
              <Text
                selectable
                style={[sharedStyles.previewRelative, {color: isCloseExpiration ? colors.danger : colors.accent}]}
              >
                {formatRelativeDuration(
                  previewRelativeState.days,
                  previewRelativeState.weeks,
                  previewRelativeState.months
                )}
              </Text>
            </View>
          </View>

          <ItemExpirationModePicker mode={mode} onChange={setMode} />

          {mode === 'manual' ? (
            <View style={[sharedStyles.dateCard, {backgroundColor: colors.card, borderColor: colors.border}]}>
              <DateTimePicker
                value={manualDate}
                mode="date"
                display="default"
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
          ) : null}
          {mode === 'relative' ? (
            <RelativeDatePickerRow
              days={relativeDays}
              weeks={relativeWeeks}
              months={relativeMonths}
              dayOptions={dayOptions}
              weekOptions={weekOptions}
              monthOptions={monthOptions}
              onChangeDays={setRelativeDays}
              onChangeWeeks={setRelativeWeeks}
              onChangeMonths={setRelativeMonths}
            />
          ) : null}

          {errorMessage ? (
            <Text selectable style={[sharedStyles.error, {color: colors.danger}]}>
              {errorMessage}
            </Text>
          ) : null}
          {!hasChanges ? (
            <Text selectable style={[styles.helperText, {color: colors.muted}]}>
              No changes yet.
            </Text>
          ) : null}
        </ScrollView>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
  },
  screen: {
    flex: 1,
    // paddingHorizontal: 20,
  },
  content: {
    paddingTop: 20,
    paddingBottom: 16,
    gap: 12,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  previewRelative: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
    flexShrink: 0,
  },
  helperText: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
  },
});
