import type { ThemePreference } from '@/lib/theme';

import { MenuSection } from './menu-section';
import { ThemePreferenceSelector } from './theme-preference-selector';

export function AppearanceSection({
  themePreference,
  onChangeThemePreference,
}: {
  themePreference: ThemePreference;
  onChangeThemePreference: (preference: ThemePreference) => void;
}) {
  return (
    <MenuSection>
      <ThemePreferenceSelector value={themePreference} onChange={onChangeThemePreference} />
    </MenuSection>
  );
}
