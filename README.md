# Pantros

Pantros is a mobile pantry-management app being rebuilt with Expo Router, Supabase, and native iOS-focused Expo UI surfaces.

## Highlights

- Pantry, cart, and product-management flows.
- Supabase-backed authentication and synced data.
- Expo Router navigation with native tabs and iOS development-build support.
- Cart reminders through Expo Push Notifications, Supabase Cron, and an Edge Function.
- In-app privacy, terms, and support pages.

## Tech

Expo SDK 56, React Native, Expo Router, Supabase, TypeScript, and Expo UI.

## Run locally

### Prerequisites

- Bun
- An Expo development environment
- Supabase project credentials

~~~bash
bun install
cp .env.example .env
~~~

Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env, then choose a target:

~~~bash
bun run ios
bun run android
bun run web
~~~

For native-only UI validation, create a development build:

~~~bash
bun run run:ios
# or
bun run run:android
~~~

## Quality checks

~~~bash
bun run lint
bun run typecheck
~~~
