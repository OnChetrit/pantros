export const AI_CONSENT_VERSION = '2026-06-26';

export function hasActiveAiConsent(profile: {
  aiConsentVersion: string | null;
  aiConsentGrantedAt: string | null;
  aiConsentWithdrawnAt: string | null;
} | null) {
  return Boolean(
    profile &&
      profile.aiConsentVersion === AI_CONSENT_VERSION &&
      profile.aiConsentGrantedAt &&
      !profile.aiConsentWithdrawnAt
  );
}

export function formatAiConsentDate(value: string | null) {
  if (!value) {
    return 'Not accepted';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}
