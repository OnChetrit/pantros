import { mkdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { getLegalDocuments } from '../src/content/legal-content';
import { buildMailtoUrl, legalConfig } from '../src/lib/legal';

const outputDir = path.resolve(process.cwd(), 'legal-site/dist');

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderSection(section: { title: string; content: { type: string; text: string }[] }) {
  const hasBullets = section.content.some((item) => item.type === 'bullet');
  const hasParagraphs = section.content.some((item) => item.type === 'paragraph');

  const paragraphMarkup = hasParagraphs
    ? section.content
        .filter((item) => item.type === 'paragraph')
        .map((item) => `<p>${escapeHtml(item.text)}</p>`)
        .join('\n')
    : '';

  const bulletMarkup = hasBullets
    ? `<ul>${section.content
        .filter((item) => item.type === 'bullet')
        .map((item) => `<li>${escapeHtml(item.text)}</li>`)
        .join('\n')}</ul>`
    : '';

  return `
    <section class="section">
      <h2>${escapeHtml(section.title)}</h2>
      ${paragraphMarkup}
      ${bulletMarkup}
    </section>
  `;
}

function renderPage(options: {
  title: string;
  subtitle: string;
  body: string;
  canonicalPath: string;
  sitePathPrefix: string;
}) {
  const siteTitle = `${options.title} | ${legalConfig.appName}`;
  const canonicalBase = legalConfig.publicLegalBaseUrl.replace(/\/$/, '');

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(siteTitle)}</title>
    <meta name="description" content="${escapeHtml(options.subtitle)}" />
    <link rel="canonical" href="${canonicalBase}${options.canonicalPath}" />
    <link rel="stylesheet" href="${options.sitePathPrefix}/styles.css" />
  </head>
  <body>
    <main class="shell">
      <header class="hero">
        <div class="eyebrow">${escapeHtml(legalConfig.appName)}</div>
        <h1>${escapeHtml(options.title)}</h1>
        <p class="subtitle">${escapeHtml(options.subtitle)}</p>
        <nav class="nav">
          <a href="${options.sitePathPrefix}/">Legal Home</a>
          <a href="${options.sitePathPrefix}/privacy/">Privacy</a>
          <a href="${options.sitePathPrefix}/terms/">Terms</a>
          <a href="${options.sitePathPrefix}/support/">Support</a>
        </nav>
      </header>
      <div class="card">
        ${options.body}
      </div>
    </main>
  </body>
</html>
`;
}

async function writePage(relativePath: string, html: string) {
  const destination = path.join(outputDir, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, html, 'utf8');
}

async function build() {
  await rm(outputDir, { recursive: true, force: true });
  await mkdir(outputDir, { recursive: true });

  const documents = getLegalDocuments();
  const siteUrl = new URL(legalConfig.publicLegalBaseUrl);
  const sitePathPrefix = siteUrl.pathname.replace(/\/$/, '');

  const styles = `:root {
  color-scheme: light;
  --bg: #f4efe6;
  --surface: rgba(255, 252, 247, 0.94);
  --text: #1e1a17;
  --muted: #5f564f;
  --line: rgba(91, 73, 58, 0.16);
  --accent: #bb5a2d;
  --accent-soft: rgba(187, 90, 45, 0.12);
}

* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  min-height: 100%;
  background:
    radial-gradient(circle at top left, rgba(187, 90, 45, 0.16), transparent 26rem),
    linear-gradient(180deg, #f8f3eb 0%, var(--bg) 100%);
  color: var(--text);
  font-family: Georgia, "Iowan Old Style", "Palatino Linotype", serif;
}

body {
  padding: 32px 16px 48px;
}

a {
  color: var(--accent);
}

.shell {
  max-width: 860px;
  margin: 0 auto;
}

.hero {
  margin-bottom: 20px;
}

.eyebrow {
  font: 700 0.8rem/1.2 "Helvetica Neue", Arial, sans-serif;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--accent);
}

h1, h2 {
  margin: 0;
}

h1 {
  margin-top: 10px;
  font-size: clamp(2.2rem, 5vw, 3.6rem);
  line-height: 0.98;
}

.subtitle {
  margin: 14px 0 0;
  max-width: 52rem;
  color: var(--muted);
  font-size: 1.02rem;
  line-height: 1.7;
}

.nav {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.nav a {
  padding: 10px 14px;
  border: 1px solid var(--line);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.58);
  text-decoration: none;
}

.card {
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: 28px;
  background: var(--surface);
  backdrop-filter: blur(14px);
  box-shadow: 0 24px 60px rgba(40, 24, 7, 0.08);
}

.section + .section {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

.section h2 {
  margin-bottom: 12px;
  font-size: 1.18rem;
}

p, li {
  margin: 0;
  font-size: 1rem;
  line-height: 1.8;
  color: var(--text);
}

p + p {
  margin-top: 12px;
}

ul {
  margin: 0;
  padding-left: 1.25rem;
}

li + li {
  margin-top: 10px;
}

.home-list {
  display: grid;
  gap: 14px;
}

.home-link {
  display: block;
  padding: 18px 20px;
  border: 1px solid var(--line);
  border-radius: 20px;
  background: var(--accent-soft);
  color: inherit;
  text-decoration: none;
}

.home-link strong {
  display: block;
  font-family: "Helvetica Neue", Arial, sans-serif;
  font-size: 1rem;
}

.home-link span {
  display: block;
  margin-top: 6px;
  color: var(--muted);
}

@media (max-width: 640px) {
  body {
    padding-inline: 12px;
  }

  .card {
    padding: 20px;
    border-radius: 22px;
  }
}`;

  await writePage('styles.css', styles);
  await writePage('.nojekyll', '');

  for (const document of documents) {
    const body = document.sections.map(renderSection).join('\n');
    await writePage(
      `${document.slug}/index.html`,
      renderPage({
        title: document.title,
        subtitle: document.subtitle,
        body,
        canonicalPath: `/${document.slug}/`,
        sitePathPrefix,
      })
    );
  }

  const homeBody = `
    <section class="section">
      <h2>Public legal pages</h2>
      <p>These pages are generated from the same legal content source used inside the Pantry app.</p>
      <div class="home-list">
        ${documents
          .map(
            (document) => `
              <a class="home-link" href="/${document.slug}/">
                <strong>${escapeHtml(document.title)}</strong>
                <span>${escapeHtml(document.subtitle)}</span>
              </a>
            `
          )
          .join('\n')}
      </div>
    </section>
    <section class="section">
      <h2>Contact</h2>
      <p>Email support at <a href="${escapeHtml(buildMailtoUrl('Pantry support'))}">${escapeHtml(
        legalConfig.supportEmail
      )}</a>.</p>
    </section>
  `;

  await writePage(
    'index.html',
    renderPage({
      title: `${legalConfig.appName} Legal`,
      subtitle: 'Public privacy, terms, and support pages for App Store review and customer access.',
      body: homeBody,
      canonicalPath: '/index.html',
      sitePathPrefix,
    })
  );
}

await build();
