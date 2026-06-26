# 03 — AI Disclosure and User Consent

Status: In Progress

## Goal

Obtain explicit permission before sending a user's image to a third-party AI
service.

## Implementation

- [x] Show a disclosure before the first AI-assisted scan.
- [x] Identify OpenAI as the processor.
- [x] Explain what is uploaded and why.
- [x] Explain retention and deletion behavior.
- [x] Provide clear Accept and Not Now actions.
- [x] Store the consent version and timestamp per user.
- [x] Provide a Settings control to withdraw or review consent.
- [x] Do not invoke the AI function when consent is absent.
- [x] Keep manual barcode and expiration entry available.
- [x] Update the privacy policy.
- [ ] Update the App Store privacy answers.
- [ ] Push the Supabase migration to the remote database.

## Verification

- [x] A new user sees disclosure before the first upload.
- [x] Rejecting consent prevents upload and preserves manual entry.
- [x] Accepting consent enables scanning.
- [x] Withdrawing consent disables future uploads.
- [x] A changed disclosure version prompts for consent again.
- [ ] The remote database has the consent columns after `supabase db push`.

## Done when

No image is shared with OpenAI before explicit, recorded user consent, and the
remote Supabase schema includes the required consent fields.
