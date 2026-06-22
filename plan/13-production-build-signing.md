# 13 — Production Build and Signing

Status: Pending

## Goal

Create a current store archive with production credentials and Apple's required
toolchain.

## Prerequisites

- Steps 01–12 are complete.
- All intended changes are committed.
- Production environment variables and Supabase secrets are configured.

## Build checklist

- [ ] Confirm the version and remote build number.
- [ ] Ensure EAS uses Xcode 26 or later and the iOS 26 SDK.
- [ ] Confirm the production APNs key/certificate is valid.
- [ ] Confirm the distribution provisioning profile includes push and Sign in
      with Apple.
- [ ] Run typecheck, lint, and Expo Doctor.
- [ ] Run `bun run eas:build:ios`.
- [ ] Inspect build logs for warnings and signing details.
- [ ] Confirm the archive contains the current Git commit.
- [ ] Confirm the build contains no private keys or development configuration.
- [ ] Upload the archive to App Store Connect.

## Done when

A current production build is processed successfully by App Store Connect and
is available for TestFlight testing.
