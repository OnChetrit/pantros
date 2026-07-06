# Pantros Project Instructions

Follow [docs/EXPO_IOS_GUIDELINES.md](docs/EXPO_IOS_GUIDELINES.md) as the detailed Expo and iOS implementation playbook for this repo.

## Native iOS First

- Prefer native iOS surfaces before custom React Native recreations.
- Use Expo Router native stack features, `NativeTabs`, `Stack.SearchBar`, native sheet/modal options, and system headers where possible.
- Use `@expo/ui` universal `Row` and `Column` directly for layout stacks instead of `View` with `flexDirection` when the screen can support them.
- Do not add wrapper or helper abstractions around Expo universal `Row`/`Column`; use `Host`, `Row`, `Column`, `RNHostView`, and `Spacer` directly at the call site.
- Use `@expo/ui/swift-ui` for iOS-only controls that benefit from platform behavior, especially `Button`, `ContextMenu`, `DatePicker`, `Form`, `List`, `Picker`, `Section`, `SwipeActions`, `TextField`, and `Toggle`.
- Avoid custom JS gesture and animation implementations when a native SwiftUI or Expo Router equivalent exists.
- Keep Android/default fallbacks simple and explicit instead of building complex parity layers.

## Notifications

- Use `Notifications.getLastNotificationResponse()` and `Notifications.clearLastNotificationResponse()` for cold-start notification routing.
- Avoid the deprecated async variants unless the installed Expo SDK removes the synchronous API.
