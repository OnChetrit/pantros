# 01 — In-App Account Deletion

Status: Next

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

- [ ] List every pantry owned by the deleting user.
- [ ] Show the remaining member count for each pantry.
- [ ] Preselect **Transfer ownership and exit** when another member exists.
- [ ] Identify the member who will become the new owner.
- [ ] Allow the owner to choose another eligible member if desired.
- [ ] Show a stronger warning when **Delete pantry** is selected because all
      members will lose the pantry and its data.
- [ ] Require the user to resolve every owned pantry before enabling the final
      Delete Account action.

## Implementation

- [ ] Audit all tables that reference `auth.users`.
- [ ] Define deletion behavior for profiles, memberships, pantries, items,
      carts, notification preferences, deliveries, push tokens, and uploaded
      images.
- [ ] Create a protected Supabase Edge Function using the service-role key only
      on the server.
- [ ] Validate the caller from their JWT; never accept a user ID from the
      client as authority.
- [ ] Validate that every selected ownership recipient is still an active
      member when the deletion transaction runs.
- [ ] Revoke or remove external provider authorization where supported.
- [ ] Transfer or delete each owned pantry according to the user's recorded
      decision in a transaction-safe operation.
- [ ] Remove the deleting user from pantries owned by other users.
- [ ] Delete the Supabase Auth user last.
- [ ] Add a confirmation and progress/error UI.
- [ ] Clear local session and cached app state after success.
- [ ] Add the deletion behavior and retention rules to the privacy policy.

## Security requirements

- The service-role key must never enter the application bundle.
- The function may delete only the authenticated caller.
- RLS remains enabled on exposed tables.
- Existing sessions must be signed out/revoked as part of the flow.
- Failures must not leave pantries with inaccessible ownership.

## Verification

- [ ] Delete an email/password test account.
- [ ] Delete an Apple-authenticated test account.
- [ ] Delete a Google-authenticated test account.
- [ ] Confirm the Auth user is gone.
- [ ] Confirm push tokens and preferences are gone.
- [ ] Confirm transferring ownership preserves the pantry and promotes the
      selected member.
- [ ] Confirm the default “next member” is selected deterministically.
- [ ] Confirm deleting an owned pantry removes its related data and access for
      all members.
- [ ] Confirm a single-member pantry can only be deleted.
- [ ] Confirm a user with multiple owned pantries must choose an action for
      each pantry.
- [ ] Confirm the deleting user is removed from pantries owned by other users.
- [ ] Confirm a member who leaves during confirmation cannot receive ownership.
- [ ] Confirm a deleted account cannot restore access with an old token.
- [ ] Run typecheck, lint, and Supabase security checks.

## Done when

Account deletion works end to end from a production-like physical-device build,
and the deletion/retention behavior is documented publicly.
