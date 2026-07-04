import type { PantryItem } from '@/domain/models';
import { useAppTheme } from '@/lib/theme';
import { StyleSheet } from 'react-native';

export type CartExpirationReviewModalProps = {
  visible: boolean;
  item: PantryItem | null;
  step: number;
  totalSteps: number;
  reviewDate: string;
  processing: boolean;
  errorMessage: string | null;
  onChangeDate: (value: string) => void;
  onSave: () => void;
  onSkip: () => void;
  onCancel: () => void;
};

export type ExpirationMode = 'manual' | 'relative';

export const dayOptions = Array.from({length: 31}, (_, index) => index);
export const weekOptions = Array.from({length: 53}, (_, index) => index);
export const monthOptions = Array.from({length: 25}, (_, index) => index);

export function startOfDay(value: Date) {
  const next = new Date(value);
  next.setHours(0, 0, 0, 0);
  return next;
}

export function parseIsoDate(value: string | null) {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function toIsoDate(value: Date) {
  return startOfDay(value).toISOString().split('T')[0]!;
}

export function addRelativeDate(days: number, weeks: number, months: number) {
  const next = startOfDay(new Date());
  next.setMonth(next.getMonth() + months);
  next.setDate(next.getDate() + weeks * 7 + days);
  return next;
}

export function initialRelativeState(value: string) {
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

export function formatExpiration(value: string | null) {
  if (!value) {
    return 'No expiration saved';
  }

  const parsed = parseIsoDate(value);

  if (!parsed) {
    return 'Expiration needs review';
  }

  return parsed.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export const styles = StyleSheet.create({
  sheet: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    gap: 16,
  },
  header: {
    gap: 6,
  },
  eyebrow: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 21,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  previewLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  previewValue: {
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '700',
  },
  dateCard: {
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    alignItems: 'center',
    overflow: 'hidden',
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
    borderWidth: 1,
    justifyContent: 'center',
  },
  relativeLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  picker: {
    flex: 1,
  },
  pickerItem: {
    fontSize: 18,
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actions: {
    gap: 10,
    paddingTop: 4,
  },
  button: {
    minHeight: 52,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '800',
  },
});

export type AppThemeColors = ReturnType<typeof useAppTheme>['colors'];
