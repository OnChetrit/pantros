import AsyncStorage from '@react-native-async-storage/async-storage';
import type { PropsWithChildren } from 'react';
import { createContext, createElement, useContext, useEffect, useMemo, useState } from 'react';
import type { ColorValue } from 'react-native';
import { Appearance, DynamicColorIOS, Platform, useColorScheme } from 'react-native';

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
export type AppThemeColors = ThemePalette;

export type ThemePreference = 'device' | 'light' | 'dark';

type ThemeContextValue = {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
};

const THEME_PREFERENCE_KEY = 'app-theme';

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
  background: '#090909',
  card: '#181818',
  border: '#181818',
  borderStrong: '#202020',
  text: '#f4f4f5',
  textInverse: '#090909',
  muted: '#a1a1aa',
  tint: '#8fc79e',
  tintSoft: '#171c18',
  accent: '#cbd5cf',
  accentSoft: '#171917',
  warning: '#e3a06b',
  warningSoft: '#2a1d15',
  danger: '#f08c78',
  dangerSoft: '#301916',
  input: '#1b1b1b',
  empty: '#191919',
  metric: '#1a1a1a',
  listRow: '#1c1c1c',
  listRowEmphasized: '#222222',
  rowPressed: '#262626',
  overlay: 'rgba(0, 0, 0, 0.36)',
  grabber: '#4a4a4a',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function adaptive(light: string, dark: string) {
  if (Platform.OS === 'ios') {
    return DynamicColorIOS({light, dark});
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

function applyColorScheme(preference: ThemePreference) {
  Appearance.setColorScheme(preference === 'device' ? 'unspecified' : preference);
}

function readThemePreference(value: string | null): ThemePreference {
  if (value === 'light' || value === 'dark' || value === 'device') {
    return value;
  }

  return 'device';
}

export function ThemePreferenceProvider({children}: PropsWithChildren) {
  const [themePreference, setThemePreference] = useState<ThemePreference>('device');

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(THEME_PREFERENCE_KEY)
      .then(value => {
        if (cancelled) {
          return;
        }

        const nextPreference = readThemePreference(value);

        setThemePreference(nextPreference);
        applyColorScheme(nextPreference);
      })
      .catch(() => {
        if (!cancelled) {
          applyColorScheme('device');
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const updateThemePreference = async (preference: ThemePreference) => {
    setThemePreference(preference);
    applyColorScheme(preference);
    await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
  };

  return createElement(
    ThemeContext.Provider,
    {
      value: {
        themePreference,
        setThemePreference: updateThemePreference,
      },
    },
    children
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  const systemScheme = useColorScheme();
  const themePreference = context?.themePreference ?? 'device';
  const scheme = themePreference === 'device' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;
  const isDark = scheme === 'dark';

  return {
    isDark,
    colors: isDark ? darkColors : lightColors,
    themePreference,
    setThemePreference: context?.setThemePreference,
  };
}

export function useThemedStyles<T>(createStyles: (colors: AppThemeColors) => T) {
  const {colors} = useAppTheme();

  return useMemo(() => createStyles(colors), [colors, createStyles]);
}
