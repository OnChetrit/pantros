# 05 — App Icon and Brand Assets

Status: Implemented; pending production build validation

## Goal

Replace Expo placeholder branding with final Pantros artwork suitable for the
App Store.

## Current issues

- Production validation still needs to confirm the generated AppIcon catalog
  in an archived build.

## Implementation

- [x] Design an original Pantros app icon.
- [x] Provide a 1024×1024 source.
- [x] Ensure there are no transparent regions.
- [x] Do not pre-round the icon corners.
- [x] Replace the Expo icon asset/configuration.
- [ ] Confirm generated iPhone icon sizes.
- [x] Align splash-screen branding with the final icon.
- [x] Confirm ownership/licensing for every visual asset.

## Verification

- [ ] Inspect the icon on light and dark home-screen backgrounds.
- [ ] Inspect Settings, Spotlight, notification, and App Store variants.
- [ ] Validate the production archive's AppIcon asset catalog.
- [x] Confirm no Expo placeholder imagery remains.

## Done when

The installed production build and App Store product page use final,
rights-cleared Pantros branding.
