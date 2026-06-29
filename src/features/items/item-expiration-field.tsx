import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker as NativePicker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Platform, Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useAiConsent } from '@/hooks/use-ai-consent';
import { useAppTheme, useThemedStyles } from '@/lib/theme';

import { extractExpirationDate } from './expiration-ai';
import { ItemExpirationModePicker } from './item-expiration-mode-picker';

type ExpirationMode = 'manual' | 'relative' | 'scan';

const dayOptions = Array.from({length: 31}, (_, index) => index);
const weekOptions = Array.from({length: 53}, (_, index) => index);
const monthOptions = Array.from({length: 25}, (_, index) => index);

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function parseIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function toIsoDate(value: Date) {
  return startOfDay(value).toISOString().split('T')[0];
}

function addRelativeDate(days: number, weeks: number, months: number) {
  const next = startOfDay(new Date());

  next.setMonth(next.getMonth() + months);
  next.setDate(next.getDate() + weeks * 7 + days);

  return next;
}

function formatDisplayDate(value: string) {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return 'No expiration date';
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function initialRelativeState(value: string): {days: number; weeks: number; months: number} {
  const parsed = parseIsoDate(value);
  if (!parsed) {
    return {days: 0, weeks: 0, months: 0};
  }

  const diffMs = startOfDay(parsed).getTime() - startOfDay(new Date()).getTime();
  const diffDays = Math.max(1, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  const months = Math.min(24, Math.floor(diffDays / 30));
  const daysAfterMonths = diffDays - months * 30;
  const weeks = Math.min(52, Math.floor(daysAfterMonths / 7));
  const days = Math.min(30, daysAfterMonths - weeks * 7);

  return {days, weeks, months};
}

export function ItemExpirationField({value, onChange}: {value: string; onChange: (value: string) => void}) {
  const { ensureAiConsent } = useAiConsent();
  const styles = useThemedStyles(createStyles);
  const initialDate = parseIsoDate(value) ?? startOfDay(new Date());
  const initialRelative = initialRelativeState(value);
  const [isEnabled, setIsEnabled] = useState(Boolean(value));
  const [mode, setMode] = useState<ExpirationMode>('manual');
  const [manualDate, setManualDate] = useState(initialDate);
  const [relativeDays, setRelativeDays] = useState(initialRelative.days);
  const [relativeWeeks, setRelativeWeeks] = useState(initialRelative.weeks);
  const [relativeMonths, setRelativeMonths] = useState(initialRelative.months);
  const [scanDetectedDate, setScanDetectedDate] = useState<string | null>(value || null);
  const [scanOriginalText, setScanOriginalText] = useState<string | null>(null);
  const [scanBusy, setScanBusy] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const {colors, isDark} = useAppTheme();

  const resolvedDate = useMemo(() => {
    if (!isEnabled) {
      return '';
    }

    if (mode === 'manual') {
      return toIsoDate(manualDate);
    }

    if (mode === 'relative') {
      return toIsoDate(addRelativeDate(relativeDays, relativeWeeks, relativeMonths));
    }

    return scanDetectedDate ?? value;
  }, [isEnabled, manualDate, mode, relativeDays, relativeWeeks, relativeMonths, scanDetectedDate, value]);

  useEffect(() => {
    onChange(resolvedDate);
  }, [onChange, resolvedDate]);

  const previewLabel = resolvedDate ? formatDisplayDate(resolvedDate) : 'No expiration date';

  const enableMode = (nextMode: ExpirationMode) => {
    setIsEnabled(true);
    setMode(nextMode);

    if (nextMode === 'scan' && !scanDetectedDate) {
      setScanError(null);
    }
  };

  const clearExpiration = () => {
    setIsEnabled(false);
    setScanError(null);
    setScanDetectedDate(null);
    setScanOriginalText(null);
  };

  const pickImage = async (source: 'camera' | 'library') => {
    setScanBusy(false);
    setScanError(null);
    setScanOriginalText(null);
    setScanDetectedDate(null);

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission required',
        source === 'camera'
          ? 'Camera access is required to photograph expiration labels.'
          : 'Photo library access is required to choose an expiration label image.'
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

    const imageUri = result.assets[0].uri;
    setIsEnabled(true);
    setMode('scan');

    const allowed = await ensureAiConsent();

    if (!allowed) {
      setScanError('AI scanning is off until you accept the disclosure. You can still set the date manually.');
      setMode('manual');
      return;
    }

    setScanBusy(true);
    const scanned = await extractExpirationDate(imageUri);
    setScanBusy(false);

    if (scanned.success && scanned.date) {
      setScanDetectedDate(scanned.date);
      setScanOriginalText(scanned.originalText);
      const parsedDate = parseIsoDate(scanned.date);

      if (parsedDate) {
        setManualDate(parsedDate);
      }

      setMode('manual');
      return;
    }

    setScanError(scanned.error ?? 'No expiration date was detected in that image.');
  };

  const openScanSourcePicker = () => {
    Alert.alert('Scan Expiration', 'Choose how to capture the expiration date.', [
      {
        text: 'Camera',
        onPress: () => {
          void pickImage('camera');
        },
      },
      {
        text: 'Camera Roll',
        onPress: () => {
          void pickImage('library');
        },
      },
      {
        text: 'Cancel',
        style: 'cancel',
      },
    ]);
  };

  return (
    <View style={styles.card}>
      <View style={styles.toggleRow}>
        <Text style={styles.toggleTitle}>EXPIRATION</Text>
        <Switch
          value={isEnabled}
          onValueChange={nextValue => {
            if (nextValue) {
              setIsEnabled(true);
              setMode('manual');
              setScanError(null);
              return;
            }

            clearExpiration();
          }}
        />
      </View>
      {isEnabled ? (
        <View style={styles.previewCard}>
          <Text style={styles.previewLabel}>Selected date</Text>
          <Text style={styles.previewValue}>{previewLabel}</Text>
        </View>
      ) : null}

      {isEnabled ? <ItemExpirationModePicker mode={mode} onChange={enableMode} /> : null}

      {isEnabled && mode === 'manual' ? (
        <View style={[styles.controlBlock, styles.datePickerCard]}>
          <DateTimePicker
            value={manualDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, selectedDate) => {
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
      ) : null}

      {isEnabled && mode === 'relative' ? (
        <View style={styles.controlBlock}>
          <View style={styles.relativeRow}>
            <View style={styles.relativePicker}>
              <Text style={styles.relativeLabel}>Days</Text>
              <NativePicker
                selectedValue={relativeDays}
                onValueChange={value => {
                  if (typeof value === 'number') {
                    setRelativeDays(value);
                  }
                }}
                itemStyle={styles.pickerItem}
                style={styles.picker}
              >
                {dayOptions.map(amount => (
                  <NativePicker.Item key={amount} label={String(amount)} value={amount} />
                ))}
              </NativePicker>
            </View>
            <View style={styles.relativePicker}>
              <Text style={styles.relativeLabel}>Weeks</Text>
              <NativePicker
                selectedValue={relativeWeeks}
                onValueChange={value => {
                  if (typeof value === 'number') {
                    setRelativeWeeks(value);
                  }
                }}
                itemStyle={styles.pickerItem}
                style={styles.picker}
              >
                {weekOptions.map(amount => (
                  <NativePicker.Item key={amount} label={String(amount)} value={amount} />
                ))}
              </NativePicker>
            </View>
            <View style={styles.relativePicker}>
              <Text style={styles.relativeLabel}>Months</Text>
              <NativePicker
                selectedValue={relativeMonths}
                onValueChange={value => {
                  if (typeof value === 'number') {
                    setRelativeMonths(value);
                  }
                }}
                itemStyle={styles.pickerItem}
                style={styles.picker}
              >
                {monthOptions.map(amount => (
                  <NativePicker.Item key={amount} label={String(amount)} value={amount} />
                ))}
              </NativePicker>
            </View>
          </View>
        </View>
      ) : null}

      {isEnabled && mode === 'scan' ? (
        <View style={styles.controlBlock}>
          <Pressable onPress={openScanSourcePicker} style={[styles.scanActionButton, styles.scanActionPrimary]}>
            <Text style={styles.scanActionPrimaryText}>Scan Expiration</Text>
          </Pressable>

          {scanBusy ? (
            <View style={styles.scanStatus}>
              <ActivityIndicator color={colors.tint} />
              <Text style={styles.scanStatusText}>Extracting expiration date from the image…</Text>
            </View>
          ) : null}

          {scanDetectedDate && mode === 'scan' ? (
            <View style={styles.scanResult}>
              <Text style={styles.scanResultLabel}>Detected date</Text>
              <Text style={styles.scanResultValue}>{formatDisplayDate(scanDetectedDate)}</Text>
              {scanOriginalText ? <Text style={styles.scanResultMeta}>Matched text: {scanOriginalText}</Text> : null}
            </View>
          ) : null}

          {scanError ? (
            <View style={styles.inlineError}>
              <Text style={styles.inlineErrorText}>{scanError}</Text>
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (colors: import('@/lib/theme').AppThemeColors) => StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 12,
    gap: 12,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleRow: {
    minHeight: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  toggleTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  previewCard: {
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.metric,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  previewLabel: {
    color: colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  previewValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  controlBlock: {
    gap: 12,
  },
  datePickerCard: {
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  datePicker: {
    alignSelf: 'stretch',
  },
  relativeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  relativePicker: {
    flex: 1,
    minHeight: 156,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: colors.input,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  relativeLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  picker: {
    color: colors.text,
  },
  pickerItem: {
    color: colors.text,
    fontSize: 18,
  },
  scanActionButton: {
    minHeight: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.tintSoft,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 16,
  },
  scanActionPrimary: {
    backgroundColor: colors.tint,
    borderColor: colors.tint,
  },
  scanActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  scanActionPrimaryText: {
    color: colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  scanStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  scanStatusText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  scanResult: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    backgroundColor: colors.accentSoft,
    borderWidth: 1,
    borderColor: colors.border,
  },
  scanResultLabel: {
    color: colors.muted,
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scanResultValue: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  scanResultMeta: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
  },
  inlineError: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.dangerSoft,
  },
  inlineErrorText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
  },
});
