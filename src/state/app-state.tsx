import type { PropsWithChildren } from 'react';

import { AccountStateProvider } from './account-state';
import { AddItemDestinationProvider } from './add-item-destination-state';
import { AuthStateProvider } from './auth-state';
import { ItemStateProvider } from './item-state';
import { NotificationStateProvider } from './notification-state';
import { WorkspaceStateProvider } from './workspace-state';

export function AppStateProvider({children}: PropsWithChildren) {
  return (
    <AuthStateProvider>
      <WorkspaceStateProvider>
        <AddItemDestinationProvider>
          <NotificationStateProvider>
            <ItemStateProvider>
              <AccountStateProvider>{children}</AccountStateProvider>
            </ItemStateProvider>
          </NotificationStateProvider>
        </AddItemDestinationProvider>
      </WorkspaceStateProvider>
    </AuthStateProvider>
  );
}
