# Expo React Native iOS-first Project Instructions

## Core principle

Build the app as a React Native app, but use native iOS surfaces whenever Expo exposes them safely: native stack headers, native search bars, native tabs, SF Symbols, system blur, safe-area behavior, and `@expo/ui` only where it improves native feel.

Prefer native platform behavior over recreating iOS manually in JavaScript.

---

## Navigation

Use **Expo Router** as the app router.

Use:

```tsx
import {Stack} from 'expo-router';
```

for screen stacks.

Use native stack headers instead of custom headers whenever possible. Native headers give better iOS behavior: large titles, native search, toolbar placement, swipe-back gestures, blur, and iOS 26 Liquid Glass-style transitions.

For search screens, prefer:

```tsx
<Stack.SearchBar placeholder="Search..." onChangeText={setSearch} />
```

Expo documents `Stack.SearchBar` as a native stack-header search bar, and on iOS 26+ it can also be placed in the bottom toolbar using `Stack.Toolbar.SearchBarSlot`.

For scrollable screens with native search/header behavior, always use:

```tsx
contentInsetAdjustmentBehavior = 'automatic';
```

on `ScrollView`, `FlatList`, or `SectionList`. React Navigation notes this is required on iOS when using native header search behavior.

---

## Tabs

Use **Native Tabs** for main app navigation when the app should feel like a modern iOS app.

```tsx
import {NativeTabs} from 'expo-router/unstable-native-tabs';

export default function Layout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search" role="search">
        <NativeTabs.Trigger.Icon sf="magnifyingglass" md="search" />
        <NativeTabs.Trigger.Label>Search</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
```

Use Native Tabs when:

- the tabs are top-level app sections;
- you want native iOS tab bar appearance;
- you want SF Symbols;
- you want iOS 26-style Liquid Glass behavior;
- you want the Search tab to behave like a native search destination.

Expo’s native tabs use the platform-native system tab bar, but the docs still mark this API as alpha/API-subject-to-change in SDK 54+.

Use JavaScript Tabs only when:

- you need full custom tab-bar UI;
- you need a floating center action button;
- you need custom animations not supported by native tabs;
- the design intentionally does not follow iOS system tabs.

Apple’s guidance: tab bars are for navigating between top-level sections, and search can be a dedicated tab at the trailing end.

---

## Native Tabs vs SwiftUI TabView

Expo Native Tabs are the React Native/Expo Router bridge to platform-native tab bars.

SwiftUI `TabView` is what you would use in a fully native SwiftUI app.

Use Expo Native Tabs in this project. Do not build a separate SwiftUI `TabView` unless you are writing a native module or a fully native screen.

Rule:

- Expo app → `NativeTabs`
- SwiftUI app/native-only feature → `TabView`
- Fully custom JS design → Expo Router JS Tabs or custom tabs

---

## Host vs RNHostView

Use `Host` when rendering `@expo/ui` native components inside React Native.

```tsx
import {Host, Column, Text} from '@expo/ui';

<Host style={{flex: 1}}>
  <Column spacing={12}>
    <Text>Hello</Text>
  </Column>
</Host>;
```

Expo describes `Host` as the root container for universal `@expo/ui` content. On iOS it renders through SwiftUI; on Android through Jetpack Compose; on web it falls back to a React Native `View`.

Use `RNHostView` only when you are already inside an `@expo/ui` / SwiftUI / Compose tree and need to insert normal React Native content back inside it.

```tsx
import {Host, Column, RNHostView, Text} from '@expo/ui';
import {View, Text as RNText} from 'react-native';

<Host matchContents>
  <Column spacing={12}>
    <Text>Native label</Text>

    <RNHostView matchContents>
      <View>
        <RNText>React Native content</RNText>
      </View>
    </RNHostView>
  </Column>
</Host>;
```

Expo describes `RNHostView` as a way to host a React Native subtree inside `@expo/ui` native layouts. By default it fills the native parent; use `matchContents` when it should shrink to fit its RN children.

Simple rule:

```txt
React Native screen
  └── Host
        └── @expo/ui native components
              └── RNHostView
                    └── normal React Native views
```

Do not wrap every screen with `Host`. Use it only for native `@expo/ui` islands.

---

## Column / Row vs View

Use `Column` and `Row` when you are inside `@expo/ui` / native UI land.

Use React Native `View` when building normal React Native UI.

Good:

```tsx
// React Native UI
<View style={{flexDirection: 'row', gap: 12}}>
  <Text>Title</Text>
  <Icon />
</View>
```

Good:

```tsx
// @expo/ui native UI
<Host>
  <Row spacing={12}>
    <Text>Title</Text>
  </Row>
</Host>
```

Do not mix randomly.

Use `View` for:

- normal app layout;
- lists;
- cards;
- screens;
- animated components;
- React Native gesture handlers;
- Reanimated views.

Use `Column` / `Row` for:

- native `@expo/ui` components;
- small native-feeling controls;
- SwiftUI/Compose-style layout islands.

Project rule: default to `View`. Reach for `Host`, `Column`, and `Row` only when using `@expo/ui`.

---

## Lists

Use the right list component:

```txt
Small static content       → ScrollView
Flat data                  → FlatList
Grouped data               → SectionList
Very large/heavy lists     → FlashList
Animated reorder/removal   → Animated.FlatList or FlashList with layout animation
```

Never use `ScrollView` for long dynamic lists.

For `FlatList` / `SectionList`:

- always use `keyExtractor`;
- memoize list rows with `React.memo`;
- keep row components light;
- avoid large images in rows;
- avoid heavy nested views;
- use thumbnails;
- use `getItemLayout` when row height is fixed.

React Native’s own performance guide recommends light list items, `memo`, optimized images, and `getItemLayout` for fixed-height rows.

Example:

```tsx
const ProductRow = memo(function ProductRow({item}: Props) {
  return (
    <Pressable>
      <Text>{item.name}</Text>
    </Pressable>
  );
});

<FlatList
  data={items}
  keyExtractor={item => item.id}
  renderItem={({item}) => <ProductRow item={item} />}
  contentInsetAdjustmentBehavior="automatic"
/>;
```

---

## Animated lists

For simple item insert/remove/reorder animations, use Reanimated:

```tsx
import Animated, {LinearTransition} from 'react-native-reanimated';

<Animated.FlatList
  data={items}
  keyExtractor={item => item.id}
  renderItem={renderItem}
  itemLayoutAnimation={LinearTransition}
/>;
```

Reanimated’s `itemLayoutAnimation` is made for list layout changes, but it only works with single-column `Animated.FlatList`; `numColumns > 1` is not supported.

For very large lists, use FlashList. If using React Native `LayoutAnimation` with FlashList, call:

```tsx
listRef.current?.prepareForLayoutAnimationRender();
LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
```

FlashList documents this requirement and also recommends `keyExtractor` for layout animation correctness.

Avoid animating every row during scroll unless necessary. Prefer:

- native scroll;
- lightweight opacity/transform animations;
- Reanimated worklets;
- no state updates on every scroll frame.

---

## Header icons and iOS 26 native blur

Do not build fake blurred headers with absolute-positioned views unless there is no native option.

Use native stack options and toolbar APIs.

Recommended:

- use native Stack header;
- use `Stack.Toolbar` for header actions;
- use SF Symbols where available;
- let iOS handle blur and Liquid Glass transitions;
- keep content under the header using automatic inset adjustment.

Example direction:

```tsx
<Stack.Screen
  options={{
    title: 'Pantry',
    headerLargeTitle: true,
    headerTransparent: true,
    headerBlurEffect: 'systemMaterial',
  }}
/>
```

React Navigation documents that `headerBlurEffect` requires `headerTransparent: true`.

For iOS 26 search/toolbars, prefer Expo Router’s native `Stack.SearchBar` and `Stack.Toolbar` APIs instead of custom header search UI.

---

## iOS design rules

Follow iOS behavior first:

- use native navigation transitions;
- use large titles for main screens;
- use regular titles for detail screens;
- use native search for search-heavy screens;
- keep tabs for top-level sections only;
- do not put destructive/action buttons in the tab bar;
- use toolbar/header buttons for actions;
- use SF Symbols for tab/header icons;
- avoid over-customizing native controls.

Apple separates navigation surfaces from action surfaces: tab bars navigate; toolbars act on current content.

---

## Recommended project defaults

Use:

- Expo Router
- Native Stack
- Native Tabs for main app tabs
- `Stack.SearchBar` for search screens
- `FlatList` / `SectionList` / `FlashList`
- Reanimated for layout/list animations
- `View` for normal layout
- `Host` only for `@expo/ui`
- `RNHostView` only inside `Host` when embedding RN content into native UI

Avoid:

- custom headers unless required;
- custom tab bars unless product design demands it;
- `ScrollView` for dynamic lists;
- mixing `@expo/ui` layout and React Native layout without clear boundaries;
- animating list rows with React state on scroll;
- recreating iOS blur/search/tab behavior manually.

---

## Mental model

Build 90% of the app with React Native.

Use Expo native APIs for:

- navigation;
- tabs;
- headers;
- search;
- toolbar actions;
- platform-native UI islands.

Only drop into `@expo/ui` when the native feel is worth the extra bridge complexity.
