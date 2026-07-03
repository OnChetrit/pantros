# Expo iOS Guidelines

Project-specific implementation rules for Pantros. Follow these when adding or changing screens, routes, components, and styling.

## Primary Goal

Build the best iOS experience Expo can provide before adding custom cross-platform abstractions. Prefer native Expo Router and `@expo/ui/swift-ui` behavior over recreating iOS patterns in JavaScript.

## Platform Split Strategy

- Prefer `*.ios.tsx` files for iOS-specific UI instead of branching entire render trees with `Platform.OS === 'ios'`.
- Keep `Platform.OS` checks limited to small behavioral differences, service code, permission handling, or native API capability checks.
- When iOS and non-iOS UIs diverge meaningfully, keep shared state and business logic in a shared hook or `*.shared.ts(x)` file and expose platform files as thin renderers.
- Do not add parity layers that force Android and web to mimic native iOS exactly. Keep fallbacks simple and explicit.

## Route Hierarchy

- Keep `src/app/_layout.tsx` responsible for app-wide providers, theme wiring, notification bootstrap, and the root stack only.
- Use route groups such as `(auth)` and `(tabs)` to express navigation structure without changing URLs.
- Use `_layout.tsx` in each route group to define the relationship between children instead of repeating navigation setup in screens.
- Keep tabs for persistent top-level destinations only.
- Put detail, create, edit, scan, account, and modal flows outside the tab group unless they are true tab destinations.
- Keep route files thin. Screen state, data loading, and command logic should live in `src/features/**`, `src/components/**`, `src/state/**`, or `src/services/**`.
- Prefer redirects and route guards in layout boundaries where possible instead of scattering auth checks across screens.

## Expo Router on iOS

- Prefer `NativeTabs` for the main application tabs.
- Prefer system headers, large titles, native back behavior, and `Stack.SearchBar` before building custom header chrome.
- Use stack presentation modes that match the platform flow:
  - `formSheet` or modal-style presentation for focused create/edit flows on iOS when appropriate.
  - full-screen only when the task is immersive, camera-like, or should replace the current context.
- Prefer native sheet behaviors such as grabbers and scroll-expansion rather than custom gesture sheets.
- Use `NativeTabs.BottomAccessory` only for contextual tab-bound actions that belong above the system tab bar.

## SwiftUI with `@expo/ui/swift-ui`

- Every SwiftUI surface must be wrapped in `Host`.
- Prefer dedicated `*.ios.tsx` wrappers that expose native SwiftUI views and keep the non-iOS file as the fallback.
- Use `Host matchContents` only for controls with intrinsic size or explicit frame sizing.
- Do not use `matchContents` for flexible-width controls that need the available width.
- Use `Host useViewportSizeMeasurement` when the SwiftUI content should size against the available viewport, especially for full-height `Form` or similar layouts.
- Use `RNHostView` when a SwiftUI surface needs to embed React Native content.
- Use `RNHostView matchContents` only when the SwiftUI parent should size to the React Native child.
- Omit `RNHostView matchContents` when the React Native child uses flex and should fill the available SwiftUI space.

## Preferred Native iOS Components

- Use `List` for scrolling collections that should look and behave like iOS content lists.
- Use `Section` inside `List` for grouped content, settings clusters, empty states, and semantic grouping.
- Use `Form` for settings, account, and editor screens that should follow iOS form behavior.
- Use `TextField` and `SecureField` for text entry when the screen is iOS-specific.
- Use `Toggle`, `Picker`, and `DatePicker` instead of custom pickers for native controls.
- Use `SwipeActions` for row actions before building custom swipe affordances.
- Use `ContextMenu` or `Menu` for secondary actions instead of custom action drawers.
- Use `Button` and `ControlGroup` for iOS-native action clusters.

## Lists and Screen Composition

- Prefer `List` plus `Section` on iOS instead of manually spacing `ScrollView` cards when the content is fundamentally list-like.
- Use list styles intentionally. Default to native grouped or inset-grouped appearance for settings and structured content.
- Keep row chrome minimal inside native lists. Let the system supply separators, grouping, spacing, and selection affordances.
- Use `RNHostView` for React Native rows, banners, or empty states that need to sit inside a SwiftUI `List` without rewriting everything.

## Styling Rules

- Prefer theme tokens and semantic colors from the app theme over one-off colors.
- Do not restyle native containers so heavily that they stop reading as iOS components.
- Prefer system spacing, native typography scale, and SF Symbols-compatible iconography for iOS-first screens.
- Use custom styling to support hierarchy and brand, not to replace platform affordances.
- Avoid building custom faux headers, segmented controls, sheets, search bars, or tab bars when Expo Router or Expo UI already provides the native surface.

## File Organization

- Keep route files in `src/app/**`.
- Keep screen implementations in `src/features/**`.
- Keep reusable building blocks in `src/components/**`.
- If an iOS-native component has shared logic, organize it as:
  - `component.shared.tsx` or hook for shared logic
  - `component.ios.tsx` for SwiftUI/native iOS rendering
  - `component.tsx` for cross-platform fallback

## Development Workflow

- Validate `@expo/ui/swift-ui` behavior in iOS development builds, not Expo Go.
- Use `expo install` for Expo-managed dependencies to stay on the supported version graph.
- Rebuild the development client after native config or module changes.
- Prefer Expo-supported navigation, notifications, auth, and device APIs before adding extra libraries.
- Keep the dependency surface small and biased toward official Expo packages.

## Notifications

- For cold-start routing, use `Notifications.getLastNotificationResponse()` and clear handled state with `Notifications.clearLastNotificationResponse()`.
- Do not switch to the deprecated async variants unless the installed Expo SDK removes the synchronous APIs.

## Decision Rules

- If the screen is iOS-only or heavily iOS-optimized, create a `*.ios.tsx` file.
- If the UI needs native list, form, swipe, menu, picker, or sheet behavior, prefer `@expo/ui/swift-ui`.
- If the difference is only a small prop or service behavior, keep one shared file and use a minimal platform check.
- If a route needs custom layout relationships, solve it in `_layout.tsx`, not inside individual pages.

## References

- Expo UI SwiftUI: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/
- Expo UI Host: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/host/
- Expo UI List: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/list/
- Expo UI RNHostView: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/rnhostview/
- Expo UI Section: https://docs.expo.dev/versions/latest/sdk/ui/swift-ui/section/
- Expo Router notation: https://docs.expo.dev/router/basics/notation/
- Expo Router Stack: https://docs.expo.dev/router/advanced/stack/
- Expo Router Native tabs: https://docs.expo.dev/versions/latest/sdk/router/native-tabs/
- Expo Notifications: https://docs.expo.dev/versions/latest/sdk/notifications/
