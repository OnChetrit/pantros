import { DynamicColorIOS, Platform, useColorScheme } from 'react-native';
import type { ColorValue } from 'react-native';

type ThemePalette = {
  background: string;
  card: string;
  border: string;
  borderStrong: string;
  text: string;
  textInverse: string;
  muted: string;
  tint: string;
  tintSoft: string;
  accent: string;
  accentSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  input: string;
  empty: string;
  metric: string;
  listRow: string;
  listRowEmphasized: string;
  rowPressed: string;
  overlay: string;
  grabber: string;
  shadow: string;
};

type AdaptiveThemeColors = Record<keyof ThemePalette, ColorValue>;

const lightColors: ThemePalette = {
  background: '#f5f8f2',
  card: '#fbfdf8',
  border: '#dbe6da',
  borderStrong: '#c7d8c7',
  text: '#172019',
  textInverse: '#fbfdf8',
  muted: '#536456',
  tint: '#3f7d5a',
  tintSoft: '#dcebdd',
  accent: '#5f8f6f',
  accentSoft: '#e2f0e5',
  warning: '#a55a2a',
  warningSoft: '#f4e1d3',
  danger: '#c74d38',
  dangerSoft: '#f7e5de',
  input: '#edf4eb',
  empty: '#e5f0e5',
  metric: '#f1f7ef',
  listRow: '#f9fcf6',
  listRowEmphasized: '#eef6eb',
  rowPressed: '#f0f6ed',
  overlay: 'rgba(15, 24, 17, 0.16)',
  grabber: '#c8d8c7',
  shadow: '#1b2a1f',
};

const darkColors: ThemePalette = {
  background: '#0f1511',
  card: '#151d17',
  border: '#263329',
  borderStrong: '#35443a',
  text: '#eff7f0',
  textInverse: '#0f1511',
  muted: '#a9b8ac',
  tint: '#8fc79e',
  tintSoft: '#1d2d22',
  accent: '#b5d7b9',
  accentSoft: '#19261d',
  warning: '#e3a06b',
  warningSoft: '#2d1f17',
  danger: '#ef7f6d',
  dangerSoft: '#341c18',
  input: '#1a241d',
  empty: '#1b2a20',
  metric: '#172019',
  listRow: '#141b16',
  listRowEmphasized: '#1b261e',
  rowPressed: '#1f2b22',
  overlay: 'rgba(0, 0, 0, 0.28)',
  grabber: '#516354',
  shadow: '#000000',
};

function adaptive(light: string, dark: string) {
  if (Platform.OS === 'ios') {
    return DynamicColorIOS({ light, dark });
  }

  return dark;
}

export const appColors: AdaptiveThemeColors = {
  background: adaptive(lightColors.background, darkColors.background),
  card: adaptive(lightColors.card, darkColors.card),
  border: adaptive(lightColors.border, darkColors.border),
  borderStrong: adaptive(lightColors.borderStrong, darkColors.borderStrong),
  text: adaptive(lightColors.text, darkColors.text),
  textInverse: adaptive(lightColors.textInverse, darkColors.textInverse),
  muted: adaptive(lightColors.muted, darkColors.muted),
  tint: adaptive(lightColors.tint, darkColors.tint),
  tintSoft: adaptive(lightColors.tintSoft, darkColors.tintSoft),
  accent: adaptive(lightColors.accent, darkColors.accent),
  accentSoft: adaptive(lightColors.accentSoft, darkColors.accentSoft),
  warning: adaptive(lightColors.warning, darkColors.warning),
  warningSoft: adaptive(lightColors.warningSoft, darkColors.warningSoft),
  danger: adaptive(lightColors.danger, darkColors.danger),
  dangerSoft: adaptive(lightColors.dangerSoft, darkColors.dangerSoft),
  input: adaptive(lightColors.input, darkColors.input),
  empty: adaptive(lightColors.empty, darkColors.empty),
  metric: adaptive(lightColors.metric, darkColors.metric),
  listRow: adaptive(lightColors.listRow, darkColors.listRow),
  listRowEmphasized: adaptive(lightColors.listRowEmphasized, darkColors.listRowEmphasized),
  rowPressed: adaptive(lightColors.rowPressed, darkColors.rowPressed),
  overlay: adaptive(lightColors.overlay, darkColors.overlay),
  grabber: adaptive(lightColors.grabber, darkColors.grabber),
  shadow: adaptive(lightColors.shadow, darkColors.shadow),
};

export function useAppTheme() {
  const scheme = useColorScheme();
  const isDark = scheme !== 'light';

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
  };
}
