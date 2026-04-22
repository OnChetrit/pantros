export type PantryRole = 'owner' | 'admin' | 'member';

export type ReminderSettings = {
  expirationRemindersEnabled: boolean;
  reminderTime: string;
  reminderDaysBefore: number;
  lowStockAlertsEnabled: boolean;
  lowStockThreshold: number;
  defaultExpirationDays: number | null;
};

export type PantryMember = {
  userId: string;
  name: string;
  email: string;
  role: PantryRole;
  joinedAt: string;
};

export type Pantry = {
  id: string;
  name: string;
  ownerId: string;
  shareCode: string | null;
  createdAt: string;
  settings: ReminderSettings;
  members: PantryMember[];
};

export type PantryItem = {
  id: string;
  pantryId: string;
  name: string;
  barcode: string | null;
  image: string | null;
  expirationDate: string | null;
  createdAt: string;
  isInCart: boolean;
  cartId: string | null;
  quantity: number;
};

export type PantryItemInput = {
  pantryId: string;
  name: string;
  barcode: string | null;
  image: string | null;
  expirationDate: string | null;
  isInCart: boolean;
  cartId: string | null;
  quantity: number;
};

export type Cart = {
  id: string;
  pantryId: string;
  name: string;
  isPrimary: boolean;
  createdAt: string;
};

export type UserProfile = {
  id: string;
  email: string;
  fullName: string | null;
  avatarUrl: string | null;
  createdAt: string;
};

export type WorkspaceBundle = {
  profile: UserProfile | null;
  pantries: Pantry[];
  items: PantryItem[];
  carts: Cart[];
};

export type BootstrapStatus = 'idle' | 'loading' | 'ready' | 'error';
