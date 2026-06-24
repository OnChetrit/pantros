-- Applied through the Supabase Management API as migration 20260622191532.
create schema if not exists private;

revoke all on schema private from public, anon, authenticated;
grant usage on schema private to authenticated;

create table private.account_deletion_requests (
  user_id uuid primary key references auth.users(id) on delete cascade,
  decisions jsonb not null,
  requested_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '15 minutes'),
  constraint account_deletion_requests_decisions_array_check
    check (jsonb_typeof(decisions) = 'array')
);

revoke all on private.account_deletion_requests from public, anon, authenticated;

create index if not exists pantries_owner_id_idx
  on public.pantries (owner_id);

create index if not exists pantry_members_user_id_idx
  on public.pantry_members (user_id);

create index if not exists pantry_members_pantry_joined_at_idx
  on public.pantry_members (pantry_id, joined_at, user_id);

create or replace function private.prepare_account_deletion(
  p_user_id uuid,
  p_decisions jsonb
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  owned_pantry_count integer;
  decision_count integer;
begin
  if p_user_id is null then
    raise exception 'A user ID is required';
  end if;

  if not exists (
    select 1
    from auth.users
    where id = p_user_id
  ) then
    raise exception 'The account no longer exists';
  end if;

  if p_decisions is null or jsonb_typeof(p_decisions) <> 'array' then
    raise exception 'Pantry decisions must be an array';
  end if;

  select count(*)
  into owned_pantry_count
  from public.pantries
  where owner_id = p_user_id;

  select count(*)
  into decision_count
  from jsonb_to_recordset(p_decisions) as decision(
    pantry_id uuid,
    action text,
    transfer_to_user_id uuid
  );

  if decision_count <> owned_pantry_count then
    raise exception 'A decision is required for every owned pantry';
  end if;

  if exists (
    select decision.pantry_id
    from jsonb_to_recordset(p_decisions) as decision(
      pantry_id uuid,
      action text,
      transfer_to_user_id uuid
    )
    group by decision.pantry_id
    having count(*) > 1
  ) then
    raise exception 'Each pantry can have only one deletion decision';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_decisions) as decision(
      pantry_id uuid,
      action text,
      transfer_to_user_id uuid
    )
    where decision.pantry_id is null
      or decision.action not in ('transfer', 'delete')
      or (
        decision.action = 'transfer'
        and (
          decision.transfer_to_user_id is null
          or decision.transfer_to_user_id = p_user_id
        )
      )
      or (
        decision.action = 'delete'
        and decision.transfer_to_user_id is not null
      )
  ) then
    raise exception 'One or more pantry decisions are invalid';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_decisions) as decision(
      pantry_id uuid,
      action text,
      transfer_to_user_id uuid
    )
    left join public.pantries pantry
      on pantry.id = decision.pantry_id
      and pantry.owner_id = p_user_id
    where pantry.id is null
  ) or exists (
    select 1
    from public.pantries pantry
    where pantry.owner_id = p_user_id
      and not exists (
        select 1
        from jsonb_to_recordset(p_decisions) as decision(
          pantry_id uuid,
          action text,
          transfer_to_user_id uuid
        )
        where decision.pantry_id = pantry.id
      )
  ) then
    raise exception 'Pantry ownership changed. Refresh and try again';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_decisions) as decision(
      pantry_id uuid,
      action text,
      transfer_to_user_id uuid
    )
    where decision.action = 'transfer'
      and not exists (
        select 1
        from public.pantry_members membership
        where membership.pantry_id = decision.pantry_id
          and membership.user_id = decision.transfer_to_user_id
          and membership.user_id <> p_user_id
      )
  ) then
    raise exception 'A selected ownership recipient is no longer a pantry member';
  end if;

  insert into private.account_deletion_requests (
    user_id,
    decisions,
    requested_at,
    expires_at
  )
  values (
    p_user_id,
    p_decisions,
    now(),
    now() + interval '15 minutes'
  )
  on conflict (user_id) do update
  set
    decisions = excluded.decisions,
    requested_at = excluded.requested_at,
    expires_at = excluded.expires_at;
end;
$$;

revoke all on function private.prepare_account_deletion(uuid, jsonb) from public;
grant usage on schema private to service_role;
grant execute on function private.prepare_account_deletion(uuid, jsonb) to service_role;

create or replace function public.prepare_account_deletion(
  p_user_id uuid,
  p_decisions jsonb
)
returns void
language sql
security invoker
set search_path = ''
as $$
  select private.prepare_account_deletion(p_user_id, p_decisions);
$$;

revoke all on function public.prepare_account_deletion(uuid, jsonb)
  from public, anon, authenticated;
grant execute on function public.prepare_account_deletion(uuid, jsonb)
  to service_role;

create or replace function private.apply_account_deletion()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  request_decisions jsonb;
  request_expires_at timestamptz;
  owned_pantry_count integer;
  decision_count integer;
  decision record;
begin
  select
    request.decisions,
    request.expires_at
  into
    request_decisions,
    request_expires_at
  from private.account_deletion_requests request
  where request.user_id = old.id
  for update;

  if request_decisions is null then
    raise exception 'Account deletion must be requested from the app first';
  end if;

  if request_expires_at <= now() then
    raise exception 'The account deletion request expired. Refresh and try again';
  end if;

  perform pantry.id
  from public.pantries pantry
  where pantry.owner_id = old.id
  order by pantry.id
  for update;

  select count(*)
  into owned_pantry_count
  from public.pantries
  where owner_id = old.id;

  select count(*)
  into decision_count
  from jsonb_to_recordset(request_decisions) as requested_decision(
    pantry_id uuid,
    action text,
    transfer_to_user_id uuid
  );

  if decision_count <> owned_pantry_count then
    raise exception 'Pantry ownership changed. Refresh and try again';
  end if;

  if exists (
    select 1
    from public.pantries pantry
    where pantry.owner_id = old.id
      and not exists (
        select 1
        from jsonb_to_recordset(request_decisions) as requested_decision(
          pantry_id uuid,
          action text,
          transfer_to_user_id uuid
        )
        where requested_decision.pantry_id = pantry.id
      )
  ) then
    raise exception 'Pantry ownership changed. Refresh and try again';
  end if;

  for decision in
    select
      requested_decision.pantry_id,
      requested_decision.action,
      requested_decision.transfer_to_user_id
    from jsonb_to_recordset(request_decisions) as requested_decision(
      pantry_id uuid,
      action text,
      transfer_to_user_id uuid
    )
    order by requested_decision.pantry_id
  loop
    if decision.action = 'transfer' then
      perform membership.id
      from public.pantry_members membership
      where membership.pantry_id = decision.pantry_id
        and membership.user_id = decision.transfer_to_user_id
        and membership.user_id <> old.id
      for update;

      if not found then
        raise exception 'A selected ownership recipient is no longer a pantry member';
      end if;

      update public.pantry_members
      set role = 'member'
      where pantry_id = decision.pantry_id
        and user_id = old.id;

      update public.pantry_members
      set role = 'owner'
      where pantry_id = decision.pantry_id
        and user_id = decision.transfer_to_user_id;

      update public.pantries
      set
        owner_id = decision.transfer_to_user_id,
        updated_at = now()
      where id = decision.pantry_id
        and owner_id = old.id;

      if not found then
        raise exception 'Pantry ownership changed. Refresh and try again';
      end if;

      delete from public.pantry_members
      where pantry_id = decision.pantry_id
        and user_id = old.id;
    elsif decision.action = 'delete' then
      delete from public.items
      where pantry_id = decision.pantry_id;

      delete from public.carts
      where pantry_id = decision.pantry_id;

      delete from public.pantry_settings
      where pantry_id = decision.pantry_id;

      delete from public.pantry_members
      where pantry_id = decision.pantry_id;

      delete from public.pantries
      where id = decision.pantry_id
        and owner_id = old.id;

      if not found then
        raise exception 'Pantry ownership changed. Refresh and try again';
      end if;
    else
      raise exception 'Unsupported pantry deletion action';
    end if;
  end loop;

  delete from public.pantry_members
  where user_id = old.id;

  delete from public.notification_deliveries
  where user_id = old.id;

  delete from public.notification_preferences
  where user_id = old.id;

  delete from public.push_tokens
  where user_id = old.id;

  delete from public.profiles
  where id = old.id;

  return old;
end;
$$;

revoke all on function private.apply_account_deletion() from public;

drop trigger if exists before_auth_user_deleted on auth.users;

create trigger before_auth_user_deleted
  before delete on auth.users
  for each row
  execute function private.apply_account_deletion();
