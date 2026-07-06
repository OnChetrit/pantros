# Bugs To Fix

## 1. Search Tab Focus And Input Behavior

- Tapping the Search tab should automatically focus the search input.
- The search input currently does not show its placeholder.
- The search input is not clickable/interactable after opening the Search tab.
- Expected behavior:
  The tab opens directly into an active native search experience with visible placeholder text and immediate keyboard focus.

## 2. Empty State Visual Cleanup

- Current empty states look too heavy.
- Remove empty-state background fills/cards.
- Use more minimal text and lighter presentation.
- Apply this consistently across pantry, cart, search, and any related item/account empty states.

## 3. Cart Quantity Bottom Sheet Picker

- Replace the current cart quantity picker implementation with the same native picker pattern used in [src/features/cart/cart-expiration-review-modal-relative-picker.tsx](/Users/on.chetrit/Projects/personal/Pantros/src/features/cart/cart-expiration-review-modal-relative-picker.tsx:1).
- Quantity options should start at `1`.
- Keep the bottom sheet aligned with the other sheet presentation rules already in the app.

## 4. Component File Organization Refactor

- Every component should live in its own folder.
- Target structure for a component named `test`:
  - `test/test.tsx`
  - `test/test.ios.tsx`
  - `test/test.types.ts`
  - `test/utils.ts`
- When files are related by domain, group them under a shared parent folder.
- Example:
  - `account/profile/*`
  - `account/menu/*`
- Apply the same rule to other feature/component groups so related components live together but still keep one component per folder.

## Notes

- This file is a backlog of known issues and structural follow-up work, not an implementation plan.
- Search tab focus/input behavior should be treated as the highest-priority user-facing bug in this list.
