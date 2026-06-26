# Legal Site

This folder is the deploy target for Pantry's public legal pages.

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

Deploy `legal-site/dist/` as a small static site on any host that can serve
plain HTML files.

Recommended stable URLs:

- `/privacy/`
- `/terms/`
- `/support/`

If you want the pages under `/legal/...`, add your host-level routing or deploy
the contents of `dist` beneath a `/legal` base path.

## Updating content

Edit the shared legal content in `src/content/legal-content.ts`, then rebuild
the site. The in-app legal screens will update from the same source.

Set the deployment base URL in `src/lib/legal.ts` via
`legalConfig.publicLegalBaseUrl` before publishing.
