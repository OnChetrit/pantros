import {
  BottomSheet,
  Button as SwiftUIButton,
  Group,
  HStack,
  Host,
  ProgressView,
  RNHostView,
  Spacer,
  Text,
  VStack,
  ZStack,
} from '@expo/ui/swift-ui';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Platform, Text as RNText, View } from 'react-native';

import type { PantryItem } from '@/domain/models';
import { ItemExpirationModePicker } from '@/features/items/item-expiration-mode-picker/item-expiration-mode-picker';
import {
  buttonBorderShape,
  buttonStyle,
  controlSize,
  disabled,
  font,
  foregroundStyle,
  frame,
  interactiveDismissDisabled,
  lineLimit,
  multilineTextAlignment,
  padding,
  presentationDetents,
  progressViewStyle,
} from '@expo/ui/swift-ui/modifiers';
import { RelativePicker } from './cart-expiration-review-modal-relative-picker';
import {
  addRelativeDate,
  type AppThemeColors,
  type CartExpirationReviewModalProps,
  dayOptions,
  type ExpirationMode,
  formatExpiration,
  initialRelativeState,
  monthOptions,
  parseIsoDate,
  startOfDay,
  styles,
  toIsoDate,
  weekOptions,
} from './cart-expiration-review-modal.shared';

export function ReviewModalContent({
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
}: Omit<CartExpirationReviewModalProps, 'visible' | 'item'> & {
  item: PantryItem;
  colors: AppThemeColors;
  isDark: boolean;
}) {
  const [presented, setPresented] = useState(true);
  const allowDismissRef = useRef(false);
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

  const requestDismiss = useCallback(() => {
    if (processing) {
      return;
    }

    if (!hasChanges) {
      allowDismissRef.current = true;
      setPresented(false);
      return;
    }

    Alert.alert('Discard changes?', 'Your expiration changes will be lost.', [
      {text: 'Keep Editing', style: 'cancel', onPress: () => setPresented(true)},
      {
        text: 'Discard Changes',
        style: 'destructive',
        onPress: () => {
          allowDismissRef.current = true;
          setPresented(false);
        },
      },
    ]);
  }, [hasChanges, processing]);

  const handlePresentedChange = useCallback(
    (nextPresented: boolean) => {
      if (!nextPresented) {
        if (allowDismissRef.current) {
          allowDismissRef.current = false;
          setPresented(false);
          return;
        }

        requestDismiss();
      }
    },
    [requestDismiss]
  );
  return (
    <Host>
      <BottomSheet isPresented={presented} onIsPresentedChange={handlePresentedChange} onDismiss={onCancel}>
        <Group
          modifiers={[
            presentationDetents(['medium', 'large']),
            interactiveDismissDisabled(processing),
            padding({top: 12, leading: 16, trailing: 16, bottom: 20}),
          ]}
        >
          <VStack spacing={18}>
            <ZStack modifiers={[frame({maxWidth: 9999})]}>
              <Text
                modifiers={[
                  font({weight: 'semibold', size: 17}),
                  lineLimit(1),
                  multilineTextAlignment('center'),
                  frame({maxWidth: 9999}),
                ]}
              >
                {item.name}
              </Text>

              <HStack spacing={12} modifiers={[frame({maxWidth: 9999})]}>
                <SwiftUIButton
                  label=""
                  systemImage="xmark"
                  onPress={requestDismiss}
                  modifiers={[
                    controlSize('large'),
                    buttonStyle('glass'),
                    buttonBorderShape('circle'),
                    disabled(processing),
                    frame({width: 44, height: 44}),
                  ]}
                />
                <Spacer />
                <SwiftUIButton
                  label=""
                  systemImage="forward.fill"
                  onPress={onSkip}
                  modifiers={[
                    controlSize('large'),
                    buttonStyle('glass'),
                    buttonBorderShape('circle'),
                    disabled(processing),
                    frame({width: 44, height: 44}),
                  ]}
                />
                <ZStack modifiers={[frame({width: 44, height: 44})]}>
                  <SwiftUIButton
                    label=""
                    systemImage={processing ? undefined : 'checkmark'}
                    onPress={onSave}
                    modifiers={[
                      controlSize('large'),
                      buttonStyle('glassProminent'),
                      buttonBorderShape('circle'),
                      disabled(!hasChanges || processing),
                      frame({width: 44, height: 44}),
                    ]}
                  />
                  {processing ? (
                    <ProgressView modifiers={[progressViewStyle('circular'), controlSize('regular')]} />
                  ) : null}
                </ZStack>
              </HStack>
            </ZStack>

            <RNHostView matchContents>
              <View>
                <View style={[styles.previewCard, {backgroundColor: colors.background, borderColor: colors.border}]}>
                  <RNText style={[styles.previewLabel, {color: colors.muted}]}>Selected date</RNText>
                  <RNText style={[styles.previewValue, {color: colors.text}]}>{formatExpiration(resolvedDate)}</RNText>
                </View>

                <ItemExpirationModePicker mode={mode} onChange={setMode} />

                {mode === 'manual' ? (
                  <View style={[styles.dateCard, {backgroundColor: colors.background, borderColor: colors.border}]}>
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
                      style={styles.datePicker}
                    />
                  </View>
                ) : (
                  <View style={styles.relativeInlineRow}>
                    <RelativePicker label="Days" value={relativeDays} options={dayOptions} onChange={setRelativeDays} />
                    <RelativePicker
                      label="Weeks"
                      value={relativeWeeks}
                      options={weekOptions}
                      onChange={setRelativeWeeks}
                    />
                    <RelativePicker
                      label="Months"
                      value={relativeMonths}
                      options={monthOptions}
                      onChange={setRelativeMonths}
                    />
                  </View>
                )}

                {errorMessage ? <RNText style={[styles.error, {color: colors.danger}]}>{errorMessage}</RNText> : null}
              </View>
            </RNHostView>

            {!hasChanges ? (
              <Text modifiers={[font({size: 13}), foregroundStyle('secondaryLabel')]}>
                No changes yet.
              </Text>
            ) : null}
          </VStack>
        </Group>
      </BottomSheet>
    </Host>
  );
}
