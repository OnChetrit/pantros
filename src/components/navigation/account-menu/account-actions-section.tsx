import type { AccountMenuDestination } from './account-menu.types';
import { MenuRow } from './menu-row';
import { MenuSection } from './menu-section';

export function AccountActionsSection({
  onNavigate,
  onSignOut,
}: {
  onNavigate: (destination: AccountMenuDestination) => void;
  onSignOut: () => void;
}) {
  return (
    <MenuSection title="Account Actions">
      <MenuRow icon="trash-outline" label="Delete Account" onPress={() => onNavigate('delete')} danger />
      <MenuRow icon="log-out-outline" label="Sign Out" onPress={onSignOut} danger hideDivider />
    </MenuSection>
  );
}
