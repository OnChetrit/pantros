# 10 — Accessibility and Production UX

Status: Pending

## Goal

Remove accessibility and usability issues that could affect users or review.

## Checklist

- [ ] Add accessibility labels, roles, hints, and states to interactive
      controls that lack visible semantic text.
- [ ] Test VoiceOver navigation and focus order.
- [ ] Test Dynamic Type at large accessibility sizes.
- [ ] Prevent essential text from clipping.
- [ ] Verify color contrast in light and dark mode.
- [ ] Verify touch targets are at least comfortably tappable.
- [ ] Ensure forms identify errors near the affected field.
- [ ] Ensure loading and disabled states are understandable.
- [ ] Verify all screens work with Reduce Motion where relevant.
- [ ] Verify empty, offline, slow-network, and backend-error states.
- [ ] Verify camera/photo/notification denial fallbacks.

## Verification

- [ ] Complete a VoiceOver pass on a physical iPhone.
- [ ] Complete a maximum-text-size pass.
- [ ] Complete light/dark appearance passes.
- [ ] Test a clean install and a returning session.

## Done when

Core authentication, pantry, item, cart, settings, and deletion flows are
usable with VoiceOver and large text.
