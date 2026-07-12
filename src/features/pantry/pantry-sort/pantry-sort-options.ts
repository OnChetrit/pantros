export type PantryListSortOption = 'expiration' | 'name' | 'recent';

export const SORT_OPTIONS: {key: PantryListSortOption; label: string}[] = [
  {key: 'expiration', label: 'Soonest Expiration'},
  {key: 'name', label: 'Name A-Z'},
  {key: 'recent', label: 'Recently Added'},
];

export function parsePantrySortOption(value: string | string[] | undefined): PantryListSortOption {
  const resolved = Array.isArray(value) ? value[0] : value;

  if (resolved === 'name' || resolved === 'recent' || resolved === 'expiration') {
    return resolved;
  }

  return 'expiration';
}
