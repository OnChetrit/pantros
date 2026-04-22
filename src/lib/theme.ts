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
  background: '#f6f1e9',
  card: '#fffaf2',
  border: '#e5dccf',
  borderStrong: '#d9ccb9',
  text: '#211d17',
  textInverse: '#fffaf2',
  muted: '#5f574d',
  tint: '#7a5b32',
  tintSoft: '#efe3cf',
  accent: '#46634f',
  accentSoft: '#dfeadf',
  warning: '#a55a2a',
  warningSoft: '#f4e1d3',
  danger: '#c74d38',
  dangerSoft: '#f7e5de',
  input: '#f3ebde',
  empty: '#efe3cf',
  metric: '#f7f1e6',
  listRow: '#fbf7f0',
  listRowEmphasized: '#f4ecde',
  rowPressed: '#f8f1e7',
  overlay: 'rgba(20, 18, 14, 0.16)',
  grabber: '#d0c1ad',
  shadow: '#2f261b',
};

const darkColors: ThemePalette = {
  background: '#12100d',
  card: '#1a1714',
  border: '#2c2721',
  borderStrong: '#3a332c',
  text: '#f5efe6',
  textInverse: '#12100d',
  muted: '#b3a89a',
  tint: '#d6b48a',
  tintSoft: '#2a2118',
  accent: '#93c5a0',
  accentSoft: '#1a2720',
  warning: '#e3a06b',
  warningSoft: '#2d1f17',
  danger: '#ef7f6d',
  dangerSoft: '#341c18',
  input: '#1f1b17',
  empty: '#241d16',
  metric: '#1d1915',
  listRow: '#191612',
  listRowEmphasized: '#211b15',
  rowPressed: '#221c16',
  overlay: 'rgba(0, 0, 0, 0.28)',
  grabber: '#5f554b',
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
