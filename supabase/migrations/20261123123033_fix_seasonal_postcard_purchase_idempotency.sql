create or replace function public.purchase_christmas_postcard_pack(request_id uuid)
returns jsonb language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  actor uuid := public.current_profile_id(); balance integer; zone text; local_date date; season integer; card_key text;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select public.postal_timezone_at(home_latitude, home_longitude) into zone from public.profiles where id = actor;
  local_date := (now() at time zone coalesce(zone, 'UTC'))::date;
  if extract(month from local_date) not in (12, 1) or (extract(month from local_date) = 1 and extract(day from local_date) > 6) then raise exception 'Christmas collection unavailable' using errcode = '22023'; end if;
  season := case when extract(month from local_date) = 12 then extract(year from local_date)::integer else extract(year from local_date)::integer - 1 end;
  if exists(select 1 from public.seasonal_postcard_pack_purchases purchase where purchase.profile_id = actor and purchase.request_id = purchase_christmas_postcard_pack.request_id) then return jsonb_build_object('idempotent', true); end if;
  if exists(select 1 from public.seasonal_postcard_pack_purchases purchase where purchase.profile_id = actor and purchase.season_year = season) then raise exception 'Christmas collection already purchased' using errcode = 'P0001'; end if;
  insert into public.profile_seed_balances(profile_id, quantity) values(actor, 0) on conflict do nothing;
  select quantity into balance from public.profile_seed_balances where profile_id = actor for update;
  if balance < 100 then raise exception 'Insufficient Seeds' using errcode = 'P0001'; end if;
  update public.profile_seed_balances set quantity = quantity - 100, updated_at = now() where profile_id = actor;
  foreach card_key in array array[
    'postcard-seasonal-christmas-tree', 'postcard-seasonal-christmas-feast', 'postcard-seasonal-christmas-gifts', 'postcard-seasonal-christmas-carols', 'postcard-seasonal-christmas-sleigh', 'postcard-seasonal-christmas-cottage', 'postcard-seasonal-christmas-table', 'postcard-seasonal-christmas-mailbox', 'postcard-seasonal-newyear-beach', 'postcard-seasonal-newyear-andes', 'postcard-seasonal-newyear-buenos-aires'
  ] loop
    insert into public.profile_postcard_unlocks(profile_id, postcard_catalog_key, source, unlocked_at) values(actor, card_key, 'shop', now()) on conflict do nothing;
    insert into public.profile_postcard_balances(profile_id, postcard_catalog_key, quantity, updated_at) values(actor, card_key, 1, now()) on conflict(profile_id, postcard_catalog_key) do update set quantity = profile_postcard_balances.quantity + 1, updated_at = now();
  end loop;
  insert into public.seasonal_postcard_pack_purchases(profile_id, season_year, request_id) values(actor, season, request_id);
  return jsonb_build_object('idempotent', false, 'seedBalance', balance - 100, 'seasonYear', season);
end;
$$;

create or replace function public.purchase_seasonal_postcard(target_catalog_key text, request_id uuid)
returns jsonb language plpgsql security definer set search_path = public, auth, pg_temp as $$
declare
  actor uuid := public.current_profile_id(); balance integer; zone text; local_date date;
  allowed_cards text[] := array[
    'postcard-seasonal-christmas-tree', 'postcard-seasonal-christmas-feast', 'postcard-seasonal-christmas-gifts', 'postcard-seasonal-christmas-carols', 'postcard-seasonal-christmas-sleigh', 'postcard-seasonal-christmas-cottage', 'postcard-seasonal-christmas-table', 'postcard-seasonal-christmas-mailbox', 'postcard-seasonal-newyear-beach', 'postcard-seasonal-newyear-andes', 'postcard-seasonal-newyear-buenos-aires'
  ];
begin
  if actor is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if exists(select 1 from public.seasonal_postcard_individual_purchases purchase where purchase.profile_id = actor and purchase.request_id = purchase_seasonal_postcard.request_id) then return jsonb_build_object('idempotent', true); end if;
  select public.postal_timezone_at(home_latitude, home_longitude) into zone from public.profiles where id = actor;
  local_date := (now() at time zone coalesce(zone, 'UTC'))::date;
  if extract(month from local_date) not in (12, 1) or (extract(month from local_date) = 1 and extract(day from local_date) > 6) then raise exception 'Christmas collection unavailable' using errcode = '22023'; end if;
  if not (target_catalog_key = any(allowed_cards)) or not exists(select 1 from public.official_postcards where catalog_key = target_catalog_key and availability = 'paid' and status = 'active') then raise exception 'Seasonal postcard unavailable' using errcode = '22023'; end if;
  insert into public.profile_seed_balances(profile_id, quantity) values(actor, 0) on conflict do nothing;
  select quantity into balance from public.profile_seed_balances where profile_id = actor for update;
  if balance < 10 then raise exception 'Insufficient Seeds' using errcode = 'P0001'; end if;
  update public.profile_seed_balances set quantity = quantity - 10, updated_at = now() where profile_id = actor;
  insert into public.profile_postcard_unlocks(profile_id, postcard_catalog_key, source, unlocked_at) values(actor, target_catalog_key, 'shop', now()) on conflict do nothing;
  insert into public.profile_postcard_balances(profile_id, postcard_catalog_key, quantity, updated_at) values(actor, target_catalog_key, 1, now()) on conflict(profile_id, postcard_catalog_key) do update set quantity = profile_postcard_balances.quantity + 1, updated_at = now();
  insert into public.seasonal_postcard_individual_purchases(profile_id, request_id, postcard_catalog_key) values(actor, request_id, target_catalog_key);
  return jsonb_build_object('idempotent', false, 'seedBalance', balance - 10, 'postcardCatalogKey', target_catalog_key);
end;
$$;
