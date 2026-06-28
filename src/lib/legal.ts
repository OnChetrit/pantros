export const legalConfig = {
  appName: 'Pantros',
  supportEmail: 'onchetrit@gmail.com',
  supportResponseWindow: '5 business days',
  lastUpdated: '2026-06-26',
  publicLegalBaseUrl: 'https://onchetrit.github.io/pantros',
} as const;

export function buildMailtoUrl(subject: string) {
  const params = new URLSearchParams({
    subject,
  });

  return `mailto:${legalConfig.supportEmail}?${params.toString()}`;
}
