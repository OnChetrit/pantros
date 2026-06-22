# 07 — Permissions and Native Configuration

Status: Pending

## Goal

Request only permissions required by the application's final feature set.

## Implementation

- [ ] Disable microphone permission in the Expo Camera configuration.
- [ ] Remove Android `RECORD_AUDIO`.
- [ ] Keep camera wording specific to barcode and expiration scanning.
- [ ] Keep photo-library wording specific to importing product images.
- [ ] Keep notifications opt-in and explain their value before requesting.
- [ ] Confirm manual item entry works when camera/photos are denied.
- [ ] Confirm the production build excludes Expo development networking and
      launcher configuration.
- [ ] Verify Sign in with Apple and production push entitlements.
- [ ] Confirm the iPhone-only device target is intentional.

## Verification

- [ ] Generate native configuration from a clean prebuild.
- [ ] Inspect the production Info.plist and entitlements.
- [ ] Test every permission in allowed, denied, and limited states.
- [ ] Confirm no microphone prompt appears.
- [ ] Run Expo Doctor.

## Done when

The production binary contains only justified permissions and production
entitlements.
