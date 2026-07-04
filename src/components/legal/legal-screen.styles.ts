import { StyleSheet } from 'react-native';

import { appColors } from '@/components/ui/primitives';

export const styles = StyleSheet.create({
  paragraph: {
    color: appColors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  bullet: {
    color: appColors.text,
    fontSize: 14,
    lineHeight: 22,
  },
  actions: {
    gap: 10,
    paddingTop: 4,
  },
});
