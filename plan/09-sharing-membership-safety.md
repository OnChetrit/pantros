# 09 — Shared Pantry Safety and Membership Controls

Status: Pending

## Goal

Make private shared pantries manageable and prevent abuse or stranded users.

## Implementation

- [ ] Complete join-by-share-code behavior if it is part of V1.
- [ ] Add a leave-pantry action for non-owners.
- [ ] Add member removal for owners.
- [ ] Add ownership transfer or define deletion behavior.
- [ ] Allow share-code rotation/revocation.
- [ ] Ensure pantry membership is enforced by RLS.
- [ ] Decide whether unknown users can discover or join pantries.
- [ ] If the app becomes public user-generated content, add reporting,
      blocking, moderation, and published contact information.

## Verification

- [ ] A non-member cannot read or modify pantry data.
- [ ] A removed member immediately loses access after session refresh.
- [ ] An old/revoked share code cannot be used.
- [ ] Owners cannot accidentally leave a pantry ownerless.
- [ ] Membership actions are tested with at least two real accounts.

## Done when

Shared pantry access is private, revocable, and safely manageable.
