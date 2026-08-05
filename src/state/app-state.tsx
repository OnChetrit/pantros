import type { PropsWithChildren } from 'react';

import { AccountStateProvider } from './account-state';
import { AddItemDestinationProvider } from './add-item-destination-state';
import { AuthStateProvider } from './auth-state';
import { ItemStateProvider } from './item-state';
import { NotificationStateProvider } from './notification-state';
import { ShoppingCartStateProvider } from './shopping-cart-state';
import { WorkspaceStateProvider } from './workspace-state';

export function AppStateProvider({children}: PropsWithChildren) {
  return (
    <AuthStateProvider>
      <WorkspaceStateProvider>
        <AddItemDestinationProvider>
          <NotificationStateProvider>
            <ShoppingCartStateProvider>
              <ItemStateProvider>
                <AccountStateProvider>{children}</AccountStateProvider>
              </ItemStateProvider>
            </ShoppingCartStateProvider>
          </NotificationStateProvider>
        </AddItemDestinationProvider>
      </WorkspaceStateProvider>
    </AuthStateProvider>
  );
}
