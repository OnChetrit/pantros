# Pantry Rebuild Plan

## Product Direction

Build a new pantry management app inspired by the feature scope of `new-pantry`, but rewrite it from scratch with a cleaner architecture, a smaller dependency surface, and a native-first UI strategy.

The app should support:

- authentication
- multi-pantry workspaces
- pantry membership and sharing
- pantry inventory tracking
- shopping cart / shopping list flows
- item editing with images, barcode metadata, and expiration dates
- pantry defaults and basic reminder settings

## Technical Constraints

- Start from the official Expo SDK 55 scaffold.
- Keep the same core stack category as `new-pantry`: Expo, Expo Router, React Native, TypeScript, Supabase.
- Use `@expo/ui` for SwiftUI-native iOS surfaces where it makes sense.
- Do not carry over implementation code from `new-pantry`.
- Install only packages that are needed for the target feature set.
- Keep the dependency graph on Expo-supported versions to avoid peer dependency drift.

## Chosen Stack

- `expo`
- `expo-router`
- `@expo/ui`
- `@supabase/supabase-js`
- `@react-native-async-storage/async-storage`
- `expo-auth-session`
- `expo-apple-authentication`
- `expo-image-picker`
- `@react-native-community/datetimepicker`
- `@react-native-picker/picker`
- `react-native-url-polyfill`

## Architecture

### App shell

- `src/app/`
  - route entry
  - auth route group
  - tab route group
  - modal routes

### Domain

- `src/domain/`
  - pantry types
  - item types
  - cart types
  - membership and settings types

### Services

- `src/services/supabase/`
  - client
  - auth service
  - pantry queries
  - item queries
  - cart queries

### State

- `src/state/app-context.tsx`
  - single main context for authenticated app state
  - session
  - profile
  - selected pantry
  - pantry collection
  - items
  - carts
  - async actions

This is intentional. `new-pantry` spreads concerns across multiple context files and utility modules. The new app should expose one main application context for product state and commands, with services hidden behind it.

### UI

- `src/features/auth/`
- `src/features/pantry/`
- `src/features/cart/`
- `src/features/settings/`
- `src/features/items/`
- `src/components/ui/`

## Native UI Strategy

### SwiftUI usage

Use `@expo/ui/swift-ui` on iOS for:

- action clusters
- summary cards
- primary call-to-action surfaces
- sheet-like interaction patterns
- settings rows that benefit from native platform feel

### Cross-platform fallback

React Native components remain the default layout layer for:

- navigation containers
- list virtualization
- cross-platform forms
- Android and web parity

### Important note

`@expo/ui/swift-ui` requires development builds and is not available in Expo Go. The project workflow should therefore assume:

1. Expo dev server for iteration
2. development build for iOS native UI validation

## Data Model

### Pantry

- `id`
- `name`
- `ownerId`
- `shareCode`
- `createdAt`
- `settings`
- `members`

### Item

- `id`
- `pantryId`
- `name`
- `barcode`
- `image`
- `expirationDate`
- `createdAt`
- `isInCart`
- `cartId`
- `quantity`

### Cart

- `id`
- `pantryId`
- `name`
- `isPrimary`
- `createdAt`

## Feature Phases

### Phase 1: Foundation

- configure app metadata
- configure Supabase environment loading
- build root stack and route groups
- define domain types
- create main app context

Status:
completed in the current scaffold. The app now has a root stack, auth and tab route groups, a Supabase bootstrap path, domain models, and one main application context.

### Phase 2: Auth

- email sign in
- email sign up
- Google OAuth via `expo-auth-session`
- Apple sign in on iOS
- profile bootstrap

Status:
completed. The app now supports email auth, Google OAuth, Apple sign in, and profile/session bootstrap through the main app context.

### Phase 3: Pantry workspace

- load user pantries
- auto-select workspace
- create pantry
- rename pantry
- delete pantry
- join pantry by share code

Status:
partially complete. Pantry loading and automatic workspace selection are live, and the main app shell now includes native iOS-first navigation for pantry, cart, search, profile, notifications, and settings.

### Phase 4: Inventory and carts

- pantry list screen
- add item
- edit item
- move item to cart
- remove item from cart
- create and delete carts
- update quantities

### Phase 5: Settings and sharing

- pantry defaults
- reminder configuration
- theme preference
- share code generation
- member visibility and role management

### Phase 6: Native UI refinement

- replace selected iOS cards and action surfaces with SwiftUI `Host` content
- move important settings sections to native SwiftUI rows
- tune modal flows for dev-build validation

## Deliberate Omissions For V1

These exist in `new-pantry` or are hinted by it, but should not block the rewrite:

- OpenAI expiration OCR
- camera barcode scanning
- heavy optimistic realtime edge cases
- glass-effect-heavy presentation

These can return after the baseline app is stable.

## Implementation Order

1. Finish app shell and main context.
2. Ship auth and pantry loading.
3. Ship pantry and cart tabs with manual item flows.
4. Add settings and sharing.
5. Replace selected iOS surfaces with `@expo/ui/swift-ui`.

## Quality Bar

- no copied code from `new-pantry`
- one obvious source of truth for app state
- stable Expo dependency graph
- no unnecessary package installs
- no hidden business logic inside screens
- route files stay thin
