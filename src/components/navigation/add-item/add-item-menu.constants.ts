import type { ComponentProps } from 'react';

import { Ionicons } from '@expo/vector-icons';

export const MENU_MAX_WIDTH = 340;
export const MENU_ROW_HEIGHT = 64;
export const MENU_PILL_HEIGHT = 66;
export const MENU_ROW_GAP = 8;
export const MENU_VERTICAL_PADDING = 14;

export const ADD_ITEM_ACTIONS = [
  {
    id: 'scan',
    label: 'Scan barcode',
    description: 'Use the camera',
    icon: 'barcode-outline',
  },
  {
    id: 'manual',
    label: 'Add manually',
    description: 'Search first, then create',
    icon: 'create-outline',
  },
] as const satisfies readonly {
  id: string;
  label: string;
  description: string;
  icon: ComponentProps<typeof Ionicons>['name'];
}[];

export type AddItemAction = (typeof ADD_ITEM_ACTIONS)[number]['id'];

export const SECONDARY_ADD_ITEM_ACTIONS = ADD_ITEM_ACTIONS.slice(0, -1);
export const PRIMARY_ADD_ITEM_ACTION = ADD_ITEM_ACTIONS[ADD_ITEM_ACTIONS.length - 1];
export const MENU_MIN_HEIGHT =
  SECONDARY_ADD_ITEM_ACTIONS.length * MENU_ROW_HEIGHT +
  MENU_ROW_GAP +
  MENU_PILL_HEIGHT +
  MENU_VERTICAL_PADDING * 2;
