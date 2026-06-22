create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;

create schema if not exists private;

revoke all on schema private from public, anon, authenticated;

create or replace function private.is_valid_time_zone(value text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from pg_catalog.pg_timezone_names
    where name = value
  );
$$;

revoke all on function private.is_valid_time_zone(text) from public;
grant usage on schema private to authenticated;
grant execute on function private.is_valid_time_zone(text) to authenticated;

create table public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  cart_reminders_enabled boolean not null default false,
  cart_reminder_time time without time zone not null default '18:00',
  time_zone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint notification_preferences_time_zone_check check (
    length(trim(time_zone)) > 0
    and private.is_valid_time_zone(time_zone)
  )
);

create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  expo_push_token text not null unique,
  platform text not null,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint push_tokens_platform_check check (platform in ('ios', 'android')),
  constraint push_tokens_expo_token_check check (
    expo_push_token ~ '^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$'
  )
);

create index push_tokens_user_id_active_idx
  on public.push_tokens (user_id)
  where active;

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  reminder_type text not null,
  local_date date not null,
  item_count integer not null,
  pantry_count integer not null,
  status text not null default 'pending',
  expo_ticket_ids text[] not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  sent_at timestamptz,
  constraint notification_deliveries_reminder_type_check check (reminder_type in ('cart')),
  constraint notification_deliveries_status_check check (status in ('pending', 'sent', 'failed')),
  constraint notification_deliveries_item_count_check check (item_count > 0),
  constraint notification_deliveries_pantry_count_check check (pantry_count > 0),
  constraint notification_deliveries_user_type_date_key unique (user_id, reminder_type, local_date)
);

create index notification_deliveries_user_created_at_idx
  on public.notification_deliveries (user_id, created_at desc);

alter table public.notification_preferences enable row level security;
alter table public.push_tokens enable row level security;
alter table public.notification_deliveries enable row level security;

revoke all on public.notification_preferences from anon, authenticated;
revoke all on public.push_tokens from anon, authenticated;
revoke all on public.notification_deliveries from anon, authenticated;

grant select, insert, update on public.notification_preferences to authenticated;
grant select on public.notification_deliveries to authenticated;

create policy "Users can read their notification preferences"
  on public.notification_preferences
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can create their notification preferences"
  on public.notification_preferences
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their notification preferences"
  on public.notification_preferences
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can read their notification deliveries"
  on public.notification_deliveries
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function private.register_push_token(
  p_expo_push_token text,
  p_platform text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
begin
  if caller_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if p_platform not in ('ios', 'android') then
    raise exception 'Unsupported push platform';
  end if;

  if p_expo_push_token !~ '^(Expo|Exponent)PushToken\[[A-Za-z0-9_-]+\]$' then
    raise exception 'Invalid Expo push token';
  end if;

  insert into public.push_tokens (
    user_id,
    expo_push_token,
    platform,
    active,
    last_seen_at
  )
  values (
    caller_user_id,
    p_expo_push_token,
    p_platform,
    true,
    now()
  )
  on conflict (expo_push_token) do update
  set
    user_id = excluded.user_id,
    platform = excluded.platform,
    active = true,
    last_seen_at = now();
end;
$$;

create or replace function private.unregister_push_token(
  p_expo_push_token text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
begin
  if caller_user_id is null then
    raise exception 'Authentication is required';
  end if;

  delete from public.push_tokens
  where user_id = caller_user_id
    and expo_push_token = p_expo_push_token;
end;
$$;

revoke all on function private.register_push_token(text, text) from public;
revoke all on function private.unregister_push_token(text) from public;
grant usage on schema private to authenticated;
grant execute on function private.register_push_token(text, text) to authenticated;
grant execute on function private.unregister_push_token(text) to authenticated;

create or replace function public.register_push_token(
  p_expo_push_token text,
  p_platform text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.register_push_token(p_expo_push_token, p_platform);
$$;

create or replace function public.unregister_push_token(
  p_expo_push_token text
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.unregister_push_token(p_expo_push_token);
$$;

revoke all on function public.register_push_token(text, text) from public, anon;
revoke all on function public.unregister_push_token(text) from public, anon;
grant execute on function public.register_push_token(text, text) to authenticated;
grant execute on function public.unregister_push_token(text) to authenticated;

create or replace function public.claim_due_cart_reminders(
  p_now timestamptz default now()
)
returns table (
  delivery_id uuid,
  user_id uuid,
  local_date date,
  item_count integer,
  pantry_count integer,
  expo_push_tokens text[]
)
language sql
security invoker
set search_path = ''
as $$
  with stale_deliveries as (
    delete from public.notification_deliveries delivery
    where delivery.reminder_type = 'cart'
      and delivery.status in ('pending', 'failed')
      and delivery.created_at < p_now - interval '15 minutes'
    returning delivery.id
  ),
  due_users as (
    select
      preferences.user_id,
      (p_now at time zone preferences.time_zone)::date as local_date
    from public.notification_preferences preferences
    cross join (select count(*) from stale_deliveries) cleanup
    where preferences.cart_reminders_enabled
      and (p_now at time zone preferences.time_zone)::time >= preferences.cart_reminder_time
      and exists (
        select 1
        from public.push_tokens token
        where token.user_id = preferences.user_id
          and token.active
      )
  ),
  cart_counts as (
    select
      due.user_id,
      due.local_date,
      count(item.id)::integer as item_count,
      count(distinct item.pantry_id)::integer as pantry_count
    from due_users due
    join public.pantry_members membership
      on membership.user_id = due.user_id
    join public.items item
      on item.pantry_id = membership.pantry_id
      and item.is_in_cart
    group by due.user_id, due.local_date
  ),
  claimed_deliveries as (
    insert into public.notification_deliveries (
      user_id,
      reminder_type,
      local_date,
      item_count,
      pantry_count,
      status
    )
    select
      counts.user_id,
      'cart',
      counts.local_date,
      counts.item_count,
      counts.pantry_count,
      'pending'
    from cart_counts counts
    on conflict (user_id, reminder_type, local_date) do nothing
    returning
      id,
      notification_deliveries.user_id,
      notification_deliveries.local_date,
      notification_deliveries.item_count,
      notification_deliveries.pantry_count
  )
  select
    claimed.id as delivery_id,
    claimed.user_id,
    claimed.local_date,
    claimed.item_count,
    claimed.pantry_count,
    array_agg(token.expo_push_token order by token.created_at) as expo_push_tokens
  from claimed_deliveries claimed
  join public.push_tokens token
    on token.user_id = claimed.user_id
    and token.active
  group by
    claimed.id,
    claimed.user_id,
    claimed.local_date,
    claimed.item_count,
    claimed.pantry_count;
$$;

revoke all on function public.claim_due_cart_reminders(timestamptz) from public, anon, authenticated;
grant execute on function public.claim_due_cart_reminders(timestamptz) to service_role;

create or replace function private.schedule_cart_reminder_cron()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1
    from vault.decrypted_secrets
    where name = 'project_url'
      and decrypted_secret is not null
  ) or not exists (
    select 1
    from vault.decrypted_secrets
    where name = 'cart_reminder_cron_secret'
      and decrypted_secret is not null
  ) then
    raise notice 'Cart reminder cron was not scheduled. Add project_url and cart_reminder_cron_secret to Vault, then run select private.schedule_cart_reminder_cron();';
    return false;
  end if;

  if exists (
    select 1
    from cron.job
    where jobname = 'send-cart-reminders'
  ) then
    perform cron.unschedule('send-cart-reminders');
  end if;

  perform cron.schedule(
    'send-cart-reminders',
    '*/5 * * * *',
    $job$
      select net.http_post(
        url := (
          select rtrim(decrypted_secret, '/')
          from vault.decrypted_secrets
          where name = 'project_url'
        ) || '/functions/v1/send-cart-reminders',
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'x-cron-secret', (
            select decrypted_secret
            from vault.decrypted_secrets
            where name = 'cart_reminder_cron_secret'
          )
        ),
        body := jsonb_build_object('triggered_at', now()),
        timeout_milliseconds := 10000
      );
    $job$
  );

  return true;
end;
$$;

revoke all on function private.schedule_cart_reminder_cron() from public, anon, authenticated;

select private.schedule_cart_reminder_cron();
