# Pantry App Store Release Plan

This folder is the release tracker for publishing Pantry to the iOS App Store.
Work through the numbered files in order. A step is complete only after its
implementation, verification, and documentation checkboxes are finished.

## Current baseline

- App: Pantry
- Bundle ID: `com.onchetrit.pantry-ai`
- App version: `1.0.0`
- Stack: Expo SDK 55, React Native, Supabase, EAS
- TypeScript: passing
- Lint: passing
- Expo Doctor: 19/19 checks passing
- Push notifications: working on a physical development device
- Latest store build: version `1.0.0` build `5`, created from an older commit
- Submission status: not ready

## Execution order

| Step | Area | Status |
| --- | --- | --- |
| 01 | In-app account deletion | Complete |
| 02 | Move AI requests and key to Supabase | Complete |
| 03 | AI disclosure and user consent | Pending |
| 04 | Privacy policy, support, and legal links | In progress |
| 05 | App icon and brand assets | Pending |
| 06 | Remove development content | Pending |
| 07 | Permissions and native configuration | Pending |
| 08 | Authentication recovery and account controls | Pending |
| 09 | Shared pantry safety and membership controls | Pending |
| 10 | Accessibility and production UX | Pending |
| 11 | App Store metadata and screenshots | Pending |
| 12 | Privacy labels and compliance answers | Pending |
| 13 | Production build and signing | Pending |
| 14 | TestFlight release validation | Pending |
| 15 | App Review submission | Pending |

## Working rules

- Complete one numbered step at a time.
- Do not place private API keys in `EXPO_PUBLIC_*` variables.
- All Supabase schema changes require migrations and RLS review.
- Test Supabase changes against the linked project after deployment.
- Run `bun run typecheck` and `bun run lint` after application changes.
- Run `npx expo-doctor` after dependency or native configuration changes.
- Test native permissions, authentication, and notifications on a physical
  iPhone.
- Update this table and the relevant step file when a step is completed.

## Final release gate

The app can be submitted only when:

- all release-blocking steps are complete;
- a fresh production archive contains the current code;
- the archive is tested through TestFlight;
- App Store Connect metadata, privacy answers, review credentials, and URLs are
  complete;
- the production Supabase backend and notification schedule are operational.
