# Legal Site

This folder is the deploy target for Pantros's public legal pages.

## Why it lives here

The source of truth stays in the main app repo so the native legal screens and
the public web pages do not drift apart.

## Build

```bash
bun run legal:build
```

That command generates static files in `legal-site/dist/`:

- `index.html`
- `privacy/index.html`
- `terms/index.html`
- `support/index.html`
- `styles.css`

## Deployment model

This repo is configured to deploy `legal-site/dist/` to GitHub Pages from the
`main` branch through `.github/workflows/deploy-legal-site.yml`.

Default public URLs for this repository:

- `https://onchetrit.github.io/pantros/privacy/`
- `https://onchetrit.github.io/pantros/terms/`
- `https://onchetrit.github.io/pantros/support/`

## GitHub Pages setup

In the GitHub repository settings:

1. Open `Settings` -> `Pages`
2. Set `Source` to `GitHub Actions`
3. Push to `main` or run the workflow manually

If you later move to a custom domain, update
`legalConfig.publicLegalBaseUrl` in `src/lib/legal.ts` and redeploy.

## Updating content

Edit the shared legal content in `src/content/legal-content.ts`, then rebuild
the site. The in-app legal screens will update from the same source.

Set the deployment base URL in `src/lib/legal.ts` via
`legalConfig.publicLegalBaseUrl` before publishing.
