# 06 — Remove Development Content

Status: Pending

## Goal

Make every visible screen read and behave like a final product.

## Known cleanup

- [ ] Replace “wired into the auth layer” login text.
- [ ] Replace “still bootstrapped from Supabase” profile text.
- [ ] Replace “feature set is still expanding” settings text.
- [ ] Remove or redesign the “Application State” debug section.
- [ ] Remove environment-variable instructions from user-facing errors.
- [ ] Remove debug-only state, diagnostics, and controls from production.
- [ ] Confirm no empty, placeholder, beta, TODO, or developer copy remains.
- [ ] Ensure metadata does not advertise unsupported expiration push alerts.

## Verification

- [ ] Review every route while signed out.
- [ ] Review every route with a new empty account.
- [ ] Review every route with a populated demo account.
- [ ] Search the source for placeholder/debug terminology.
- [ ] Confirm production errors are actionable but do not expose internals.

## Done when

The application contains no temporary copy, exposed implementation details, or
review-inaccessible features.
