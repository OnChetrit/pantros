# 02 — Move AI Requests and Key to Supabase

Status: Complete

## Goal

Remove the OpenAI secret from the application and route barcode/expiration
image processing through a protected Supabase Edge Function.

## Current risk

The original client-side OpenAI calls have been removed. The remaining risk is
operational: the schema change for AI scan usage was applied manually in the
Supabase SQL Editor because `supabase db push` was blocked on the work network
by Zscaler, so migration history still needs reconciliation from an unfiltered
network.

## Implementation

- [x] Create a Supabase Edge Function for AI image analysis.
- [x] Store the OpenAI key with `supabase secrets set`.
- [x] Require and verify a Supabase user JWT.
- [x] Accept only supported image types and enforce a size limit.
- [x] Define explicit request modes for expiration and barcode extraction.
- [x] Validate and normalize the model response on the server.
- [x] Add rate limiting or per-user usage protection.
- [x] Avoid logging image contents, authorization headers, or secrets.
- [x] Return stable typed errors to the app.
- [x] Replace direct OpenAI calls with the Edge Function client.
- [x] Remove `EXPO_PUBLIC_OPENAI_API_KEY` from code, README, local environment,
      and EAS environment variables.

## Verification

- [x] Confirm the built JavaScript bundle contains no OpenAI key.
- [x] Confirm anonymous requests are rejected.
- [x] Confirm authenticated barcode scanning works.
- [x] Confirm authenticated expiration scanning works.
- [x] Confirm malformed and oversized images are rejected.
- [x] Confirm OpenAI failures display a useful retry/fallback message.
- [x] Run typecheck, lint, and Edge Function tests.

## Done when

No private AI credential is present in the application, and all AI requests are
authenticated and processed server-side.

## Completed record

- `scan-item-ai` was deployed through Supabase CLI.
- `OPENAI_API_KEY` was set in Supabase secrets.
- `private.ai_scan_events` was created manually in the Supabase SQL Editor using
  the checked-in migration SQL because remote `supabase db push` was blocked on
  the work network.
- The app no longer depends on `EXPO_PUBLIC_OPENAI_API_KEY`.

## Follow-up: Migration History Reconciliation

This step is functionally complete, but the manual SQL apply needs a later
cleanup pass so local files and remote migration history stay aligned.

When working from a non-filtered network:

1. Confirm the checked-in migration file still matches the live table/index
   definition for `private.ai_scan_events`.
2. Run `supabase migration list` and inspect whether
   `20260626120000_ai_scan_usage_limits.sql` is absent from remote history.
3. Reconcile remote migration history using the normal Supabase workflow for an
   already-applied migration instead of re-running destructive SQL.
4. Re-run `supabase db push` from that clean network and confirm it reports no
   pending changes for this migration.
5. Document the final reconciliation date in this file once complete.
