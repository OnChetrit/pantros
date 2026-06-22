# 03 — AI Disclosure and User Consent

Status: Pending

## Goal

Obtain explicit permission before sending a user's image to a third-party AI
service.

## Implementation

- [ ] Show a disclosure before the first AI-assisted scan.
- [ ] Identify OpenAI as the processor.
- [ ] Explain what is uploaded and why.
- [ ] Explain retention and deletion behavior.
- [ ] Provide clear Accept and Not Now actions.
- [ ] Store the consent version and timestamp per user.
- [ ] Provide a Settings control to withdraw or review consent.
- [ ] Do not invoke the AI function when consent is absent.
- [ ] Keep manual barcode and expiration entry available.
- [ ] Update the privacy policy and App Store privacy answers.

## Verification

- [ ] A new user sees disclosure before the first upload.
- [ ] Rejecting consent prevents upload and preserves manual entry.
- [ ] Accepting consent enables scanning.
- [ ] Withdrawing consent disables future uploads.
- [ ] A changed disclosure version prompts for consent again.

## Done when

No image is shared with OpenAI before explicit, recorded user consent.
