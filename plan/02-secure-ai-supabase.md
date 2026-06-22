# 02 — Move AI Requests and Key to Supabase

Status: Pending

## Goal

Remove the OpenAI secret from the application and route barcode/expiration
image processing through a protected Supabase Edge Function.

## Current risk

`EXPO_PUBLIC_OPENAI_API_KEY` is embedded in the client bundle, and the app calls
OpenAI directly from:

- `src/features/items/expiration-ai.ts`
- `src/features/items/barcode-ai.ts`

## Implementation

- [ ] Create a Supabase Edge Function for AI image analysis.
- [ ] Store the OpenAI key with `supabase secrets set`.
- [ ] Require and verify a Supabase user JWT.
- [ ] Accept only supported image types and enforce a size limit.
- [ ] Define explicit request modes for expiration and barcode extraction.
- [ ] Validate and normalize the model response on the server.
- [ ] Add rate limiting or per-user usage protection.
- [ ] Avoid logging image contents, authorization headers, or secrets.
- [ ] Return stable typed errors to the app.
- [ ] Replace direct OpenAI calls with the Edge Function client.
- [ ] Remove `EXPO_PUBLIC_OPENAI_API_KEY` from code, README, local environment,
      and EAS environment variables.

## Verification

- [ ] Confirm the built JavaScript bundle contains no OpenAI key.
- [ ] Confirm anonymous requests are rejected.
- [ ] Confirm authenticated barcode scanning works.
- [ ] Confirm authenticated expiration scanning works.
- [ ] Confirm malformed and oversized images are rejected.
- [ ] Confirm OpenAI failures display a useful retry/fallback message.
- [ ] Run typecheck, lint, and Edge Function tests.

## Done when

No private AI credential is present in the application, and all AI requests are
authenticated and processed server-side.
