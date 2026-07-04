import type { AccountMenuDestination } from './account-menu.types';
import { MenuRow } from './menu-row';
import { MenuSection } from './menu-section';

export function SupportSection({
  onNavigate,
}: {
  onNavigate: (destination: AccountMenuDestination) => void;
}) {
  return (
    <MenuSection title="Support">
      <MenuRow icon="shield-outline" label="Privacy Policy" onPress={() => onNavigate('privacy')} />
      <MenuRow icon="document-text-outline" label="Terms of Service" onPress={() => onNavigate('terms')} />
      <MenuRow icon="help-buoy-outline" label="Contact Support" onPress={() => onNavigate('support')} hideDivider />
    </MenuSection>
  );
}
