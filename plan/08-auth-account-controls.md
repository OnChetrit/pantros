# 08 — Authentication Recovery and Account Controls

Status: Pending

## Goal

Make authentication complete enough for real users and App Review.

## Implementation

- [ ] Add forgot-password email flow.
- [ ] Add deep-link handling for password recovery.
- [ ] Add a reset-password screen.
- [ ] Handle expired and reused recovery links.
- [ ] Confirm email verification behavior and copy.
- [ ] Confirm Apple and Google provider configuration for production.
- [ ] Add an understandable sign-out path.
- [ ] Handle revoked provider credentials and expired sessions.
- [ ] Avoid displaying raw Supabase errors.

## Verification

- [ ] Email sign-up and verification.
- [ ] Email sign-in and sign-out.
- [ ] Password reset from a physical iPhone.
- [ ] Apple sign-in, returning sign-in, and cancellation.
- [ ] Google sign-in, returning sign-in, and cancellation.
- [ ] Cold launch with valid and expired sessions.

## Done when

All advertised sign-in methods and account recovery paths work in TestFlight.
