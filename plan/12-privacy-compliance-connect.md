# 12 — Privacy Labels and Compliance Answers

Status: Pending

## Goal

Accurately disclose the application's data practices in App Store Connect.

## Expected data categories to review

- [ ] Contact information: name and email
- [ ] User content: pantry, item, cart, and uploaded image data
- [ ] Identifiers: Supabase user ID and push-token-related identifiers
- [ ] Product interaction or diagnostics, if any are actually collected
- [ ] Data shared with Supabase
- [ ] Image data shared with OpenAI after consent
- [ ] Data linked to the user's account
- [ ] App functionality purposes

## Compliance answers

- [ ] Confirm no tracking or advertising SDKs are present.
- [ ] Confirm IDFA is not collected.
- [ ] Complete the updated age-rating questionnaire.
- [ ] Complete export-compliance questions.
- [ ] Confirm content rights.
- [ ] Confirm whether the app is directed at children; do not use the Kids
      category unless all Kids requirements are met.
- [ ] Complete EU Digital Services Act trader status if distributing in the EU.
- [ ] Confirm no in-app purchases; if monetization is added, create and review
      StoreKit products before submission.
- [ ] Verify the privacy manifest generated into the production archive.

## Done when

App Store Connect answers match the privacy policy and actual runtime behavior,
including every integrated third-party service.
