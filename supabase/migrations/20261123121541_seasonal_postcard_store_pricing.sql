-- The complete festive collection is a one-time seasonal purchase, while its cards
-- may also be replenished individually after they are sent.
insert into public.official_translation_keys(translation_key) values
  ('officialPostcards.christmasCottage.name'), ('officialPostcards.christmasCottage.description'), ('officialPostcards.christmasCottage.alt'),
  ('officialPostcards.christmasTable.name'), ('officialPostcards.christmasTable.description'), ('officialPostcards.christmasTable.alt'),
  ('officialPostcards.christmasMailbox.name'), ('officialPostcards.christmasMailbox.description'), ('officialPostcards.christmasMailbox.alt'),
  ('officialPostcards.newYearBeach.name'), ('officialPostcards.newYearBeach.description'), ('officialPostcards.newYearBeach.alt'),
  ('officialPostcards.newYearAndes.name'), ('officialPostcards.newYearAndes.description'), ('officialPostcards.newYearAndes.alt'),
  ('officialPostcards.newYearBuenosAires.name'), ('officialPostcards.newYearBuenosAires.description'), ('officialPostcards.newYearBuenosAires.alt')
on conflict do nothing;

update public.official_postcards
set name_key = case catalog_key
  when 'postcard-seasonal-christmas-cottage' then 'officialPostcards.christmasCottage.name'
  when 'postcard-seasonal-christmas-table' then 'officialPostcards.christmasTable.name'
  when 'postcard-seasonal-christmas-mailbox' then 'officialPostcards.christmasMailbox.name'
  when 'postcard-seasonal-newyear-beach' then 'officialPostcards.newYearBeach.name'
  when 'postcard-seasonal-newyear-andes' then 'officialPostcards.newYearAndes.name'
  when 'postcard-seasonal-newyear-buenos-aires' then 'officialPostcards.newYearBuenosAires.name'
end,
description_key = case catalog_key
  when 'postcard-seasonal-christmas-cottage' then 'officialPostcards.christmasCottage.description'
  when 'postcard-seasonal-christmas-table' then 'officialPostcards.christmasTable.description'
  when 'postcard-seasonal-christmas-mailbox' then 'officialPostcards.christmasMailbox.description'
  when 'postcard-seasonal-newyear-beach' then 'officialPostcards.newYearBeach.description'
  when 'postcard-seasonal-newyear-andes' then 'officialPostcards.newYearAndes.description'
  when 'postcard-seasonal-newyear-buenos-aires' then 'officialPostcards.newYearBuenosAires.description'
end
where catalog_key in (
  'postcard-seasonal-christmas-cottage', 'postcard-seasonal-christmas-table', 'postcard-seasonal-christmas-mailbox',
  'postcard-seasonal-newyear-beach', 'postcard-seasonal-newyear-andes', 'postcard-seasonal-newyear-buenos-aires'
);

update public.official_asset_versions version_row
set status = 'archived'
from public.official_assets asset
where version_row.asset_id = asset.id
  and version_row.status = 'active'
  and asset.asset_key in (
    'postcard.seasonal.christmasCottage.front', 'postcard.seasonal.christmasTable.front', 'postcard.seasonal.christmasMailbox.front',
    'postcard.seasonal.newYearBeach.front', 'postcard.seasonal.newYearAndes.front', 'postcard.seasonal.newYearBuenosAires.front'
  );

insert into public.official_asset_versions(
  asset_id, version, source, status, packaged_path, storage_bucket, storage_object_path,
  mime_type, width, height, byte_size, alt_text_key, is_decorative, author, metadata
)
select version_row.asset_id, 2, version_row.source, 'active', version_row.packaged_path, version_row.storage_bucket, version_row.storage_object_path,
  version_row.mime_type, version_row.width, version_row.height, version_row.byte_size,
  case asset.asset_key
    when 'postcard.seasonal.christmasCottage.front' then 'officialPostcards.christmasCottage.alt'
    when 'postcard.seasonal.christmasTable.front' then 'officialPostcards.christmasTable.alt'
    when 'postcard.seasonal.christmasMailbox.front' then 'officialPostcards.christmasMailbox.alt'
    when 'postcard.seasonal.newYearBeach.front' then 'officialPostcards.newYearBeach.alt'
    when 'postcard.seasonal.newYearAndes.front' then 'officialPostcards.newYearAndes.alt'
    when 'postcard.seasonal.newYearBuenosAires.front' then 'officialPostcards.newYearBuenosAires.alt'
  end,
  version_row.is_decorative, version_row.author, version_row.metadata
from public.official_asset_versions version_row
join public.official_assets asset on asset.id = version_row.asset_id
where version_row.version = 1
  and asset.asset_key in (
    'postcard.seasonal.christmasCottage.front', 'postcard.seasonal.christmasTable.front', 'postcard.seasonal.christmasMailbox.front',
    'postcard.seasonal.newYearBeach.front', 'postcard.seasonal.newYearAndes.front', 'postcard.seasonal.newYearBuenosAires.front'
  )
  and not exists(select 1 from public.official_asset_versions replacement where replacement.asset_id = version_row.asset_id and replacement.version = 2);

create table public.seasonal_postcard_individual_purchases (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null,
  postcard_catalog_key text not null references public.official_postcards(catalog_key),
  purchased_at timestamptz not null default now(),
  primary key (profile_id, request_id)
);
alter table public.seasonal_postcard_individual_purchases enable row level security;
revoke all on public.seasonal_postcard_individual_purchases from public, anon, authenticated;

create or replace function public.purchase_christmas_postcard_pack(request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor uuid := public.current_profile_id();
  balance integer;
  zone text;
  local_date date;
  season integer;
  card_key text;
begin
  if actor is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select public.postal_timezone_at(home_latitude, home_longitude) into zone from public.profiles where id = actor;
  local_date := (now() at time zone coalesce(zone, 'UTC'))::date;
  if extract(month from local_date) not in (12, 1) or (extract(month from local_date) = 1 and extract(day from local_date) > 6) then
    raise exception 'Christmas collection unavailable' using errcode = '22023';
  end if;
  season := case when extract(month from local_date) = 12 then extract(year from local_date)::integer else extract(year from local_date)::integer - 1 end;
  if exists(select 1 from public.seasonal_postcard_pack_purchases where profile_id = actor and request_id = purchase_christmas_postcard_pack.request_id) then
    return jsonb_build_object('idempotent', true);
  end if;
  if exists(select 1 from public.seasonal_postcard_pack_purchases where profile_id = actor and season_year = season) then
    raise exception 'Christmas collection already purchased' using errcode = 'P0001';
  end if;
  insert into public.profile_seed_balances(profile_id, quantity) values(actor, 0) on conflict do nothing;
  select quantity into balance from public.profile_seed_balances where profile_id = actor for update;
  if balance < 100 then raise exception 'Insufficient Seeds' using errcode = 'P0001'; end if;
  update public.profile_seed_balances set quantity = quantity - 100, updated_at = now() where profile_id = actor;
  foreach card_key in array array[
    'postcard-seasonal-christmas-tree', 'postcard-seasonal-christmas-feast', 'postcard-seasonal-christmas-gifts',
    'postcard-seasonal-christmas-carols', 'postcard-seasonal-christmas-sleigh', 'postcard-seasonal-christmas-cottage',
    'postcard-seasonal-christmas-table', 'postcard-seasonal-christmas-mailbox', 'postcard-seasonal-newyear-beach',
    'postcard-seasonal-newyear-andes', 'postcard-seasonal-newyear-buenos-aires'
  ] loop
    insert into public.profile_postcard_unlocks(profile_id, postcard_catalog_key, source, unlocked_at) values(actor, card_key, 'shop', now()) on conflict do nothing;
    insert into public.profile_postcard_balances(profile_id, postcard_catalog_key, quantity, updated_at) values(actor, card_key, 1, now())
      on conflict(profile_id, postcard_catalog_key) do update set quantity = profile_postcard_balances.quantity + 1, updated_at = now();
  end loop;
  insert into public.seasonal_postcard_pack_purchases(profile_id, season_year, request_id) values(actor, season, request_id);
  return jsonb_build_object('idempotent', false, 'seedBalance', balance - 100, 'seasonYear', season);
end;
$$;

create or replace function public.purchase_seasonal_postcard(target_catalog_key text, request_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor uuid := public.current_profile_id();
  balance integer;
  zone text;
  local_date date;
  allowed_cards text[] := array[
    'postcard-seasonal-christmas-tree', 'postcard-seasonal-christmas-feast', 'postcard-seasonal-christmas-gifts',
    'postcard-seasonal-christmas-carols', 'postcard-seasonal-christmas-sleigh', 'postcard-seasonal-christmas-cottage',
    'postcard-seasonal-christmas-table', 'postcard-seasonal-christmas-mailbox', 'postcard-seasonal-newyear-beach',
    'postcard-seasonal-newyear-andes', 'postcard-seasonal-newyear-buenos-aires'
  ];
begin
  if actor is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if exists(select 1 from public.seasonal_postcard_individual_purchases where profile_id = actor and request_id = purchase_seasonal_postcard.request_id) then
    return jsonb_build_object('idempotent', true);
  end if;
  select public.postal_timezone_at(home_latitude, home_longitude) into zone from public.profiles where id = actor;
  local_date := (now() at time zone coalesce(zone, 'UTC'))::date;
  if extract(month from local_date) not in (12, 1) or (extract(month from local_date) = 1 and extract(day from local_date) > 6) then
    raise exception 'Christmas collection unavailable' using errcode = '22023';
  end if;
  if not (target_catalog_key = any(allowed_cards)) or not exists(
    select 1 from public.official_postcards where catalog_key = target_catalog_key and availability = 'paid' and status = 'active'
  ) then
    raise exception 'Seasonal postcard unavailable' using errcode = '22023';
  end if;
  insert into public.profile_seed_balances(profile_id, quantity) values(actor, 0) on conflict do nothing;
  select quantity into balance from public.profile_seed_balances where profile_id = actor for update;
  if balance < 10 then raise exception 'Insufficient Seeds' using errcode = 'P0001'; end if;
  update public.profile_seed_balances set quantity = quantity - 10, updated_at = now() where profile_id = actor;
  insert into public.profile_postcard_unlocks(profile_id, postcard_catalog_key, source, unlocked_at) values(actor, target_catalog_key, 'shop', now()) on conflict do nothing;
  insert into public.profile_postcard_balances(profile_id, postcard_catalog_key, quantity, updated_at) values(actor, target_catalog_key, 1, now())
    on conflict(profile_id, postcard_catalog_key) do update set quantity = profile_postcard_balances.quantity + 1, updated_at = now();
  insert into public.seasonal_postcard_individual_purchases(profile_id, request_id, postcard_catalog_key) values(actor, request_id, target_catalog_key);
  return jsonb_build_object('idempotent', false, 'seedBalance', balance - 10, 'postcardCatalogKey', target_catalog_key);
end;
$$;

revoke all on function public.purchase_christmas_postcard_pack(uuid) from public, anon;
revoke all on function public.purchase_seasonal_postcard(text, uuid) from public, anon;
grant execute on function public.purchase_christmas_postcard_pack(uuid), public.purchase_seasonal_postcard(text, uuid) to authenticated;
