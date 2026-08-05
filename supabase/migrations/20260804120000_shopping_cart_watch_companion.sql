create table public.shopping_cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  pantry_id uuid not null references public.pantries(id) on delete cascade,
  item_id uuid not null references public.items(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint shopping_cart_items_user_pantry_item_key unique (user_id, pantry_id, item_id)
);

create index shopping_cart_items_user_pantry_idx
  on public.shopping_cart_items (user_id, pantry_id, created_at);

alter table public.shopping_cart_items enable row level security;
revoke all on public.shopping_cart_items from anon, authenticated;
grant select on public.shopping_cart_items to authenticated;

create policy "Shopping cart entries are visible to pantry members"
  on public.shopping_cart_items
  for select
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.pantry_members membership
      where membership.pantry_id = shopping_cart_items.pantry_id
        and membership.user_id = (select auth.uid())
    )
  );

create or replace function private.shopping_cart_add_item(
  p_pantry_id uuid,
  p_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  item_row record;
  entry_id uuid;
begin
  if caller_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.pantry_members membership
    where membership.pantry_id = p_pantry_id
      and membership.user_id = caller_user_id
  ) then
    raise exception 'Pantry membership is required';
  end if;

  select id, pantry_id, is_in_cart
    into item_row
  from public.items
  where id = p_item_id;

  if not found then
    raise exception 'Item no longer exists';
  end if;

  if item_row.pantry_id <> p_pantry_id then
    raise exception 'Item belongs to another pantry';
  end if;

  if not item_row.is_in_cart then
    raise exception 'Item is no longer in the Pantros cart';
  end if;

  insert into public.shopping_cart_items (user_id, pantry_id, item_id)
  values (caller_user_id, p_pantry_id, p_item_id)
  on conflict (user_id, pantry_id, item_id) do update
    set updated_at = now()
  returning id into entry_id;

  return jsonb_build_object('shopping_cart_item_id', entry_id, 'item_id', p_item_id);
end;
$$;

create or replace function private.shopping_cart_remove_item(
  p_pantry_id uuid,
  p_item_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  deleted_count integer;
begin
  if caller_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.pantry_members membership
    where membership.pantry_id = p_pantry_id
      and membership.user_id = caller_user_id
  ) then
    raise exception 'Pantry membership is required';
  end if;

  delete from public.shopping_cart_items
  where user_id = caller_user_id
    and pantry_id = p_pantry_id
    and item_id = p_item_id;

  get diagnostics deleted_count = row_count;
  return jsonb_build_object('item_id', p_item_id, 'removed', deleted_count > 0);
end;
$$;

create or replace function private.shopping_cart_complete_items(
  p_pantry_id uuid,
  p_item_ids uuid[]
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  requested_item_id uuid;
  updated_item_id uuid;
  succeeded jsonb := '[]'::jsonb;
  failed jsonb := '[]'::jsonb;
begin
  if caller_user_id is null then
    raise exception 'Authentication is required';
  end if;

  if not exists (
    select 1
    from public.pantry_members membership
    where membership.pantry_id = p_pantry_id
      and membership.user_id = caller_user_id
  ) then
    raise exception 'Pantry membership is required';
  end if;

  for requested_item_id in
    select distinct item_id
    from unnest(coalesce(p_item_ids, '{}'::uuid[])) as requested(item_id)
  loop
    updated_item_id := null;

    update public.items item
    set is_in_cart = false,
        cart_id = null
    where item.id = requested_item_id
      and item.pantry_id = p_pantry_id
      and item.is_in_cart = true
    returning item.id into updated_item_id;

    if updated_item_id is null then
      failed := failed || jsonb_build_array(jsonb_build_object(
        'itemId', requested_item_id,
        'reason', 'Item is stale, missing, unauthorized, or no longer in the Pantros cart'
      ));
      delete from public.shopping_cart_items
      where user_id = caller_user_id
        and pantry_id = p_pantry_id
        and item_id = requested_item_id;
    else
      delete from public.shopping_cart_items
      where user_id = caller_user_id
        and pantry_id = p_pantry_id
        and item_id = requested_item_id;
      succeeded := succeeded || jsonb_build_array(updated_item_id);
    end if;
  end loop;

  return jsonb_build_object('succeeded', succeeded, 'failed', failed);
end;
$$;

create or replace function private.shopping_cart_watch_snapshot(p_pantry_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  caller_user_id uuid := (select auth.uid());
  pantry_name text;
  revision timestamptz;
  snapshot_items jsonb;
  selected_ids jsonb;
begin
  if caller_user_id is null then
    raise exception 'Authentication is required';
  end if;

  select pantry.name
    into pantry_name
  from public.pantries pantry
  join public.pantry_members membership on membership.pantry_id = pantry.id
  where pantry.id = p_pantry_id
    and membership.user_id = caller_user_id;

  if pantry_name is null then
    raise exception 'Pantry membership is required';
  end if;

  delete from public.shopping_cart_items selected
  where selected.user_id = caller_user_id
    and selected.pantry_id = p_pantry_id
    and not exists (
      select 1
      from public.items item
      where item.id = selected.item_id
        and item.pantry_id = p_pantry_id
        and item.is_in_cart = true
    );

  select coalesce(max(greatest(item.updated_at, selected.updated_at)), now())
    into revision
  from public.items item
  left join public.shopping_cart_items selected
    on selected.item_id = item.id
   and selected.user_id = caller_user_id
   and selected.pantry_id = p_pantry_id
  where item.pantry_id = p_pantry_id
    and item.is_in_cart = true;

  select coalesce(jsonb_agg(jsonb_build_object(
    'id', item.id,
    'name', item.name,
    'quantity', item.quantity,
    'cartId', item.cart_id,
    'isSelected', selected.id is not null
  ) order by item.name), '[]'::jsonb)
    into snapshot_items
  from public.items item
  left join public.shopping_cart_items selected
    on selected.item_id = item.id
   and selected.user_id = caller_user_id
   and selected.pantry_id = p_pantry_id
  where item.pantry_id = p_pantry_id
    and item.is_in_cart = true;

  select coalesce(jsonb_agg(selected.item_id order by selected.created_at), '[]'::jsonb)
    into selected_ids
  from public.shopping_cart_items selected
  where selected.user_id = caller_user_id
    and selected.pantry_id = p_pantry_id;

  return jsonb_build_object(
    'version', 1,
    'pantryId', p_pantry_id,
    'pantryName', pantry_name,
    'revision', to_char(revision at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'items', snapshot_items,
    'selectedItemIds', selected_ids
  );
end;
$$;

revoke all on function private.shopping_cart_add_item(uuid, uuid) from public;
revoke all on function private.shopping_cart_remove_item(uuid, uuid) from public;
revoke all on function private.shopping_cart_complete_items(uuid, uuid[]) from public;
revoke all on function private.shopping_cart_watch_snapshot(uuid) from public;
grant usage on schema private to authenticated;
grant execute on function private.shopping_cart_add_item(uuid, uuid) to authenticated;
grant execute on function private.shopping_cart_remove_item(uuid, uuid) to authenticated;
grant execute on function private.shopping_cart_complete_items(uuid, uuid[]) to authenticated;
grant execute on function private.shopping_cart_watch_snapshot(uuid) to authenticated;

create or replace function public.shopping_cart_add_item(p_pantry_id uuid, p_item_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.shopping_cart_add_item(p_pantry_id, p_item_id);
$$;

create or replace function public.shopping_cart_remove_item(p_pantry_id uuid, p_item_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.shopping_cart_remove_item(p_pantry_id, p_item_id);
$$;

create or replace function public.shopping_cart_complete_items(p_pantry_id uuid, p_item_ids uuid[])
returns jsonb language sql security invoker set search_path = '' as $$
  select private.shopping_cart_complete_items(p_pantry_id, p_item_ids);
$$;

create or replace function public.shopping_cart_watch_snapshot(p_pantry_id uuid)
returns jsonb language sql security invoker set search_path = '' as $$
  select private.shopping_cart_watch_snapshot(p_pantry_id);
$$;

revoke all on function public.shopping_cart_add_item(uuid, uuid) from public, anon;
revoke all on function public.shopping_cart_remove_item(uuid, uuid) from public, anon;
revoke all on function public.shopping_cart_complete_items(uuid, uuid[]) from public, anon;
revoke all on function public.shopping_cart_watch_snapshot(uuid) from public, anon;
grant execute on function public.shopping_cart_add_item(uuid, uuid) to authenticated;
grant execute on function public.shopping_cart_remove_item(uuid, uuid) to authenticated;
grant execute on function public.shopping_cart_complete_items(uuid, uuid[]) to authenticated;
grant execute on function public.shopping_cart_watch_snapshot(uuid) to authenticated;
