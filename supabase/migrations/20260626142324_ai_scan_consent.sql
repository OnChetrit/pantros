alter table public.profiles
  add column if not exists ai_consent_version text,
  add column if not exists ai_consent_granted_at timestamptz,
  add column if not exists ai_consent_withdrawn_at timestamptz;
