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
    alignItems: 'stretch',
    justifyContent: 'space-between',
    gap: 16,
    width: '100%',
    flex: 1,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
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
    flex: 1,
    alignItems: 'stretch',
    width: '100%',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: 8,
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
  },
  datePicker: {
    width: '100%',
    alignSelf: 'stretch',
    display: 'flex',
    justifyContent: 'center',
  },
  relativeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  relativeInlineRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
  },
  relativeInlineInput: {
    flex: 1,
    minWidth: 0,
    height: 88,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingRight: 14,
  },
  relativeInlinePicker: {
    flex: 1,
    height: 120,
    marginTop: -16,
    marginBottom: -16,
    display: 'flex',
    justifyContent: 'center',
  },
  relativeInlinePickerItem: {
    fontSize: 20,
  },
  relativeInlineSuffix: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
  },
  error: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
  },
  actions: {
    gap: 8,
    paddingTop: 2,
    display: 'flex',
    width: '100%',
  },
  button: {
    width: '100%',
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
