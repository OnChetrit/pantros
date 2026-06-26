# 04 — Privacy Policy, Support, and Legal Links

Status: In progress

## Goal

Provide public and in-app legal/support resources required for App Store review.

## Required public pages

- [x] Privacy Policy
- [x] Support/contact page

## Recommended public page

- [x] Terms of Service

Apple's standard EULA can apply if a custom EULA is not needed, but the app
should still make its service terms clear.

## Privacy policy coverage

- [x] Account data: name, email, Supabase user ID
- [x] Pantry, item, cart, membership, and settings data
- [x] Uploaded or scanned product images
- [x] Push tokens and notification preferences
- [x] Supabase as backend/data processor
- [x] OpenAI as an AI processor
- [x] Purpose of each data category
- [x] Retention periods
- [x] Account and data deletion process
- [x] Consent withdrawal
- [x] Security practices
- [x] Contact information
- [x] Children's privacy position

## In-app changes

- [x] Add Privacy Policy to Settings/Profile.
- [x] Add Terms of Service to Settings/Profile.
- [x] Add Contact Support to Settings/Profile.
- [x] Ensure links open successfully and are accessible without hidden steps.

## App Store Connect

- [ ] Enter the Privacy Policy URL.
- [ ] Enter the Support URL.
- [ ] Add the Privacy Choices URL if a dedicated choices page is created.

## Done when

All URLs are public, accurate, available during review, and linked from inside
the application.

## Current implementation notes

- Privacy, Terms, and Support screens now exist in the app and web route tree
  under `/legal/privacy`, `/legal/terms`, and `/legal/support`.
- Settings and Profile now link directly to those screens.
- The privacy policy content now covers the release checklist items for data
  categories, AI processing, retention, deletion, consent withdrawal,
  security, contact, and children's privacy.
- `src/lib/legal.ts` now contains a real support email and a current legal
  policy update date.
- The repo now includes a separate static legal-site build target generated
  from the same shared legal content used by the in-app screens.
- What still remains for this step is operational rather than in-app:
  set the final `publicLegalBaseUrl`, publish the generated HTTPS pages, and
  enter those URLs into App Store Connect before submission.
