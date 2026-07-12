import { Host, RNHostView, Row } from '@expo/ui';

import { AvatarSidebarButton } from '@/components/navigation/avatar-sidebar/avatar-sidebar';

export function AndroidAvatarSidebarButton() {
  return (
    <Host matchContents>
      <Row alignment="center">
        <RNHostView matchContents>
          <AvatarSidebarButton />
        </RNHostView>
      </Row>
    </Host>
  );
}
