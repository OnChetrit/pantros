import { StyleSheet } from 'react-native';

export type CartCheckoutBarProps = {
  selectedCount: number;
  totalCount: number;
  processing: boolean;
  onSubmit: () => void;
  onSecondaryAction: () => void;
};

export const styles = StyleSheet.create({
  footerWrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  shell: {
    gap: 14,
    padding: 16,
    paddingBottom: 0,
  },
  summaryWrap: {
    flex: 1,
    minWidth: 0,
    height: 100,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  title: {
    fontSize: 17,
    lineHeight: 20,
    fontWeight: '800',
  },
  countBadge: {
    minWidth: 48,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeValue: {
    fontSize: 18,
    lineHeight: 18,
    fontWeight: '800',
  },
  actions: {
    flexDirection: 'column',
    gap: 10,
    alignItems: 'center',
  },
  actionsSheet: {
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  secondaryButton: {
    flex: 1,
    minHeight: 42,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  secondaryButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '600',
  },
  primaryButton: {
    flex: 1.3,
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryButtonText: {
    fontSize: 15,
    lineHeight: 18,
    fontWeight: '700',
  },
  buttonPressed: {
    opacity: 0.72,
  },
});
