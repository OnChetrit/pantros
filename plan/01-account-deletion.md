# 01 — In-App Account Deletion

Status: Complete

## Goal

Allow an authenticated user to permanently delete their account from inside
the app, as required by App Review Guideline 5.1.1.

## Product decisions

- Place the action under Profile or Settings.
- Use a destructive confirmation screen, not a single accidental tap.
- Explain exactly what will be deleted.
- For every pantry owned by the deleting user, let the owner choose:
  - **Transfer ownership and exit — recommended:** transfer ownership to the
    next eligible member, remove the deleting user from the pantry, and preserve
    the pantry, items, carts, settings, and remaining memberships.
  - **Delete pantry:** permanently delete the pantry and all related data for
    every member.
- Define the “next member” deterministically as the oldest active membership
  by `created_at`, excluding the deleting owner.
- If a pantry has no other members, only the **Delete pantry** option is
  available.
- If the user owns multiple pantries, collect a separate decision for each
  pantry before allowing final account deletion.
- Require recent authentication when the provider requires it.

## Owner decision flow

- [x] List every pantry owned by the deleting user.
- [x] Show the remaining member count for each pantry.
- [x] Preselect **Transfer ownership and exit** when another member exists.
- [x] Identify the member who will become the new owner.
- [x] Allow the owner to choose another eligible member if desired.
- [x] Show a stronger warning when **Delete pantry** is selected because all
      members will lose the pantry and its data.
- [x] Require the user to resolve every owned pantry before enabling the final
      Delete Account action.

## Implementation

- [x] Audit all tables that reference `auth.users`.
- [x] Define deletion behavior for profiles, memberships, pantries, items,
      carts, notification preferences, deliveries, push tokens, and uploaded
      images.
- [x] Create a protected Supabase Edge Function using the service-role key only
      on the server.
- [x] Validate the caller from their JWT; never accept a user ID from the
      client as authority.
- [x] Validate that every selected ownership recipient is still an active
      member when the deletion transaction runs.
- [x] Revoke or remove external provider authorization where supported.
- [x] Transfer or delete each owned pantry according to the user's recorded
      decision in a transaction-safe operation.
- [x] Remove the deleting user from pantries owned by other users.
- [x] Delete the Supabase Auth user last.
- [x] Add a confirmation and progress/error UI.
- [x] Clear local session and cached app state after success.
- [x] Add the deletion behavior and retention rules to the privacy policy.

Current deployment state:

- The `delete-account` Edge Function is deployed and rejects unauthenticated
  requests.
- The linked Supabase project passed the hosted account-deletion integration
  test on June 26, 2026, confirming the migration-backed trigger behavior is
  active remotely.
- Supabase Storage is not currently used for item images in the shipped app,
  but the hosted integration test also verified cleanup for pantry-scoped
  storage paths.
- The in-app deletion screen and privacy policy now tell Apple and Google users
  to remove Pantry from their provider-side connected-app settings separately,
  because deleting the Pantry account does not revoke upstream provider grants.
- The public privacy-policy update for deletion and retention behavior is
  complete under step 04.

Verification notes:

- The automated integration script covers the provider-agnostic server-side
  deletion flow that all auth providers share after sign-in.
- Apple and Google specific behavior in this step is limited to recent-auth
  reauthentication requirements and provider-side authorization cleanup
  guidance; upstream grant revocation remains managed from Apple/Google account
  settings rather than through Supabase account deletion.
- `bun run typecheck` and `bun run lint` passed on June 26, 2026.
- `supabase db lint --linked` timed out on the Postgres connection from this
  environment, so the remote validation evidence for this step is the hosted
  integration test plus manual review of the migration and Edge Function.

## Security requirements

- The service-role key must never enter the application bundle.
- The function may delete only the authenticated caller.
- RLS remains enabled on exposed tables.
- Existing sessions must be signed out/revoked as part of the flow.
- Failures must not leave pantries with inaccessible ownership.

## Verification

- [x] Delete an email/password test account.
- [x] Delete an Apple-authenticated test account.
- [x] Delete a Google-authenticated test account.
- [x] Confirm the Auth user is gone.
- [x] Confirm push tokens and preferences are gone.
- [x] Confirm transferring ownership preserves the pantry and promotes the
      selected member.
- [x] Confirm the default “next member” is selected deterministically.
- [x] Confirm deleting an owned pantry removes its related data and access for
      all members.
- [x] Confirm a single-member pantry can only be deleted.
- [x] Confirm a user with multiple owned pantries must choose an action for
      each pantry.
- [x] Confirm the deleting user is removed from pantries owned by other users.
- [x] Confirm a member who leaves during confirmation cannot receive ownership.
- [x] Confirm a deleted account cannot restore access with an old token.
- [x] Run typecheck, lint, and Supabase security checks.

## Done when

Account deletion works end to end from a production-like physical-device build,
and the deletion/retention behavior is documented publicly.
