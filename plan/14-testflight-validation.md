# 14 — TestFlight Release Validation

Status: Pending

## Goal

Validate the exact App Store binary before submission.

## Test matrix

- [ ] Clean installation on a physical iPhone.
- [ ] Upgrade from the previous installed version.
- [ ] Email sign-up, sign-in, password reset, and sign-out.
- [ ] Apple sign-in.
- [ ] Google sign-in.
- [ ] Account deletion.
- [ ] Create, join, leave, and manage a pantry.
- [ ] Add, edit, delete, and move items.
- [ ] Cart reminder preference and real production push delivery.
- [ ] Barcode scan and expiration scan after AI consent.
- [ ] Camera/photos denied flows.
- [ ] Notification denied flow.
- [ ] Offline launch and reconnect.
- [ ] Background/foreground transitions.
- [ ] Light mode, dark mode, VoiceOver, and large text.
- [ ] Confirm no dev launcher, Metro dependency, or debug copy.
- [ ] Monitor Supabase Edge Function and cron logs.

## Reviewer account

- [ ] Create a permanent demo account.
- [ ] Populate it with representative pantry, item, cart, and reminder data.
- [ ] Keep credentials valid and backend data available throughout review.

## Done when

The exact selected build passes the test matrix without release-blocking bugs.
