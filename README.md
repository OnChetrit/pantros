# Pantry

Clean Expo SDK 55 scaffold for a full rewrite of the pantry app.

## Goals

- keep the same product category as `new-pantry`
- do not reuse implementation code from `new-pantry`
- rebuild around one main app context
- use Expo Router, Supabase, and Expo UI SwiftUI-native surfaces

## Planning

The rewrite plan is documented in `docs/PLAN.md`.

## Environment

Bun is the package manager and script runner for this project.

```bash
brew tap oven-sh/bun
brew install oven-sh/bun/bun
bun install
```

Create `.env` or `.env.local` with:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

`Pantry/.gitignore` now ignores `.env`, so keep real values there and commit only `.env.example`.

For AI barcode and expiration scanning, set `OPENAI_API_KEY` as a Supabase Edge
Function secret instead of exposing it in Expo public env.

## Run

```bash
bun run ios
bun run android
bun run web
```

## Native UI Note

`@expo/ui/swift-ui` requires iOS development builds for real native validation and is not available in Expo Go.

## Development Builds

`expo-dev-client` is installed and configured.

Create and run a local development build with:

```bash
bun run run:ios
```

or

```bash
bun run run:android
```

If you make changes that affect native configuration, rebuild the app:

```bash
bun run prebuild
```

## Push Notifications

Cart reminders use Expo Push Notifications with a Supabase Cron job and Edge
Function. Users can enable reminders and choose their local reminder time from
the Settings screen.

Deployment and credential setup are documented in
[`docs/PUSH_NOTIFICATIONS.md`](docs/PUSH_NOTIFICATIONS.md).

## Legal Pages

The app now includes legal/support routes in the app, plus a separate static
legal-site build target in the same repo.

In-app routes:

- `/legal/privacy`
- `/legal/terms`
- `/legal/support`

Public static site:

```bash
bun run legal:build
```

This generates deployable HTML files in `legal-site/dist/` from the shared
source in `src/content/legal-content.ts`.

Update `src/lib/legal.ts` before release so the support email, canonical legal
site base URL, and any final branding or contact details match production.

## EAS Migration From `new-pantry`

`Pantry` now includes:

- `eas.json`
- the linked EAS project id from `new-pantry`
- build scripts for iOS and Android production or preview builds

Recommended migration steps:

1. Log in to Expo:

   ```bash
   bunx eas-cli login
   ```

2. Make sure the Expo project slug matches this app config.

   `Pantry` now uses:
   - app name: `Pantry`
   - app slug: `pantry-ai`

   If the linked Expo project is still named `new-pantry` or `pantry`, rename that existing Expo project in the Expo dashboard to `pantry-ai` first, then verify the link:

   ```bash
   bunx eas-cli project:info
   ```

   The linked project should resolve to the existing EAS project id:
   `b400235c-f7ce-40cb-8056-74170351dbcf`

3. Add the public Supabase env vars to EAS so cloud builds have the same config as local:

   ```bash
   bunx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_URL --value <your-url> --environment production
   bunx eas-cli env:create --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value <your-anon-key> --environment production
   ```

   Repeat for `preview` and `development` if you use those profiles.

4. Decide whether you are replacing the existing published `new-pantry` app or shipping a new app identity.

   If you want to replace the existing App Store / Play Store app, `Pantry` must use the same native identifiers as `new-pantry` before the first production build:

   - iOS bundle id: `com.on.chetrit.new-pantry`
   - Android package: `com.on.chetrit.newpantry`
   - URL scheme: `newpantry`

   Right now `Pantry` is still configured as:

   - iOS bundle id: `com.onchetrit.pantry`
   - Android package: `com.onchetrit.pantry`
   - URL scheme: `pantry`

   With the current identifiers, `Pantry` will build as a different app and will not replace `new-pantry`.

5. If you change identifiers or other native config, regenerate native code before building:

   ```bash
   bun run prebuild --clean
   ```

6. Build:

   ```bash
   bun run eas:build:ios
   bun run eas:build:android
   ```

7. Submit when the production builds are ready:

   ```bash
   bunx eas-cli submit --platform ios --profile production
   bunx eas-cli submit --platform android --profile production
   ```
