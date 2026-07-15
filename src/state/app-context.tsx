import { createContext, useContext, useMemo } from 'react';
import type { PropsWithChildren } from 'react';

import type { AccountDeletionDecision, NotificationPreferences, PantryItemInput } from '@/domain/models';

import { AppStateProvider } from './app-state';
import { useAccountState } from './account-state';
import { useAuthState } from './auth-state';
import { PartialItemActionError, useItemState } from './item-state';
import { useNotificationState } from './notification-state';
import { useWorkspaceState } from './workspace-state';

type AppContextValue = {
  status: ReturnType<typeof useWorkspaceState>['status'];
  isEnvReady: ReturnType<typeof useAuthState>['isEnvReady'];
  session: ReturnType<typeof useAuthState>['session'];
  profile: ReturnType<typeof useWorkspaceState>['profile'];
  notificationPreferences: ReturnType<typeof useNotificationState>['notificationPreferences'];
  pantries: ReturnType<typeof useWorkspaceState>['pantries'];
  selectedPantryId: ReturnType<typeof useWorkspaceState>['selectedPantryId'];
  selectedPantry: ReturnType<typeof useWorkspaceState>['selectedPantry'];
  items: ReturnType<typeof useWorkspaceState>['items'];
  carts: ReturnType<typeof useWorkspaceState>['carts'];
  pantryItems: ReturnType<typeof useWorkspaceState>['pantryItems'];
  pantryCarts: ReturnType<typeof useWorkspaceState>['pantryCarts'];
  isAuthenticated: ReturnType<typeof useAuthState>['isAuthenticated'];
  errorMessage: string | null;
  authBusy: ReturnType<typeof useAuthState>['authBusy'];
  itemBusy: ReturnType<typeof useItemState>['itemBusy'];
  notificationBusy: ReturnType<typeof useNotificationState>['notificationBusy'];
  accountDeletionBusy: ReturnType<typeof useAccountState>['accountDeletionBusy'];
  refreshAppState: () => Promise<void>;
  selectPantry: (pantryId: string) => void;
  addItem: (input: PantryItemInput) => Promise<ReturnType<typeof useWorkspaceState>['items'][number]>;
  updateItem: ReturnType<typeof useItemState>['updateItem'];
  moveItemToCart: ReturnType<typeof useItemState>['moveItemToCart'];
  moveItemsToCart: ReturnType<typeof useItemState>['moveItemsToCart'];
  moveItemToPantry: ReturnType<typeof useItemState>['moveItemToPantry'];
  moveItemsToPantry: ReturnType<typeof useItemState>['moveItemsToPantry'];
  completeCartItemWithExpiration: ReturnType<typeof useItemState>['completeCartItemWithExpiration'];
  deleteItem: ReturnType<typeof useItemState>['deleteItem'];
  deleteItems: ReturnType<typeof useItemState>['deleteItems'];
  saveNotificationPreferences: (preferences: NotificationPreferences) => Promise<NotificationPreferences>;
  signIn: ReturnType<typeof useAuthState>['signIn'];
  signUp: ReturnType<typeof useAuthState>['signUp'];
  signInWithGoogle: ReturnType<typeof useAuthState>['signInWithGoogle'];
  signInWithApple: ReturnType<typeof useAuthState>['signInWithApple'];
  signOut: ReturnType<typeof useAuthState>['signOut'];
  deleteAccount: (decisions: AccountDeletionDecision[]) => Promise<void>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

function AppContextBridge({children}: PropsWithChildren) {
  const auth = useAuthState();
  const workspace = useWorkspaceState();
  const notifications = useNotificationState();
  const items = useItemState();
  const account = useAccountState();

  const value = useMemo<AppContextValue>(
    () => ({
      status: workspace.status,
      isEnvReady: auth.isEnvReady,
      session: auth.session,
      profile: workspace.profile,
      notificationPreferences: notifications.notificationPreferences,
      pantries: workspace.pantries,
      selectedPantryId: workspace.selectedPantryId,
      selectedPantry: workspace.selectedPantry,
      items: workspace.items,
      carts: workspace.carts,
      pantryItems: workspace.pantryItems,
      pantryCarts: workspace.pantryCarts,
      isAuthenticated: auth.isAuthenticated,
      errorMessage:
        auth.errorMessage ??
        workspace.errorMessage ??
        notifications.errorMessage ??
        items.errorMessage ??
        account.errorMessage,
      authBusy: auth.authBusy,
      itemBusy: items.itemBusy,
      notificationBusy: notifications.notificationBusy,
      accountDeletionBusy: account.accountDeletionBusy,
      refreshAppState: async () => {
        await Promise.all([
          workspace.refreshWorkspace(),
          notifications.refreshNotificationPreferences(),
        ]);
      },
      selectPantry: workspace.selectPantry,
      addItem: items.addItem,
      updateItem: items.updateItem,
      moveItemToCart: items.moveItemToCart,
      moveItemsToCart: items.moveItemsToCart,
      moveItemToPantry: items.moveItemToPantry,
      moveItemsToPantry: items.moveItemsToPantry,
      completeCartItemWithExpiration: items.completeCartItemWithExpiration,
      deleteItem: items.deleteItem,
      deleteItems: items.deleteItems,
      saveNotificationPreferences: notifications.saveNotificationPreferences,
      signIn: auth.signIn,
      signUp: auth.signUp,
      signInWithGoogle: auth.signInWithGoogle,
      signInWithApple: auth.signInWithApple,
      signOut: auth.signOut,
      deleteAccount: account.deleteAccount,
    }),
    [account, auth, items, notifications, workspace]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function AppProvider({children}: PropsWithChildren) {
  return (
    <AppStateProvider>
      <AppContextBridge>{children}</AppContextBridge>
    </AppStateProvider>
  );
}

export {PartialItemActionError};

export function useAppContext() {
  const value = useContext(AppContext);

  if (!value) {
    throw new Error('useAppContext must be used inside AppProvider');
  }

  return value;
}
