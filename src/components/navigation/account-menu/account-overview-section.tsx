import { MenuRow } from './menu-row';
import { MenuSection } from './menu-section';

export function AccountOverviewSection({
  name,
  email,
  pantryCount,
  memberCount,
}: {
  name: string;
  email?: string | null;
  pantryCount: number;
  memberCount: number;
}) {
  return (
    <MenuSection title="Account">
      <MenuRow icon="person-outline" label="Name" value={name} />
      <MenuRow icon="mail-outline" label="Email" value={email ?? 'No email available'} />
      <MenuRow icon="albums-outline" label="Pantries" value={String(pantryCount)} />
      <MenuRow icon="people-outline" label="Members" value={String(memberCount)} hideDivider />
    </MenuSection>
  );
}
