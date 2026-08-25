-- Repair environments where the active prestige versions point at unpublished generated paths.
-- Existing versions remain immutable historical records; a corrected version is activated only
-- when the desired packaged path is not already active.
create or replace function public.validate_official_asset_version()
returns trigger language plpgsql set search_path = public as $$
declare selected_type public.official_asset_type; max_bytes integer; max_dimension integer;
begin
  -- Archiving changes only catalog visibility. Allow legacy published metadata to be retired
  -- without making it valid for reactivation.
  if tg_op = 'UPDATE' and new.status = 'archived' and old.status <> 'archived' and (
    new.asset_id, new.version, new.source, new.packaged_path, new.storage_bucket,
    new.storage_object_path, new.mime_type, new.width, new.height, new.byte_size,
    new.alt_text_key, new.is_decorative, new.author, new.metadata
  ) is not distinct from (
    old.asset_id, old.version, old.source, old.packaged_path, old.storage_bucket,
    old.storage_object_path, old.mime_type, old.width, old.height, old.byte_size,
    old.alt_text_key, old.is_decorative, old.author, old.metadata
  ) then return new; end if;

  select asset_type into selected_type from public.official_assets where id = new.asset_id;
  if selected_type is null then raise exception 'Unknown official asset' using errcode = '23503'; end if;
  if jsonb_typeof(new.metadata) <> 'object' or new.metadata ->> 'kind' <> selected_type::text then raise exception 'Asset metadata does not match its type' using errcode = '23514'; end if;
  if (selected_type='currencyIcon' and new.mime_type<>'image/svg+xml') or (selected_type<>'currencyIcon' and new.mime_type<>'image/webp') then raise exception 'Asset MIME type does not match its type' using errcode='23514'; end if;
  max_bytes := case selected_type when 'mascotPortrait' then 153600 when 'postcardArtwork' then 262144 when 'nestArtwork' then 81920 when 'prestigeBorder' then 81920 when 'navigationIcon' then 30720 when 'currencyIcon' then 15360 when 'texture' then 81920 else 61440 end;
  max_dimension := case selected_type when 'mascotPortrait' then 640 when 'postcardArtwork' then 1600 when 'nestArtwork' then 640 when 'prestigeBorder' then 512 when 'texture' then 512 when 'navigationIcon' then 160 when 'currencyIcon' then 128 when 'equipmentIcon' then 192 else 256 end;
  if new.byte_size>max_bytes or new.width>max_dimension or new.height>max_dimension then raise exception 'Asset exceeds its runtime budget' using errcode='23514'; end if;
  if selected_type='postcardArtwork' and new.width*2<>new.height*3 then raise exception 'Postcard artwork must use a 3:2 ratio' using errcode='23514'; end if;
  if not new.is_decorative and not public.translation_key_is_official(new.alt_text_key) then raise exception 'Asset alt text is not fully translated' using errcode='23514'; end if;
  return new;
end $$;

with desired(asset_key, packaged_path, alt_text_key, byte_size) as (values
  ('prestige.border.firstHorizon', '/assets/prestige/first-horizon.webp', 'prestige.firstHorizon.name', 49320),
  ('prestige.border.routeAtlas', '/assets/prestige/route-atlas.webp', 'prestige.routeAtlas.name', 55948),
  ('prestige.border.letterSky', '/assets/prestige/letter-sky.webp', 'prestige.letterSky.name', 56372),
  ('prestige.border.nestAmongStars', '/assets/prestige/nest-among-stars.webp', 'prestige.nestAmongStars.name', 59408)
)
update public.official_asset_versions version
set status = 'archived'
from public.official_assets asset
join desired on desired.asset_key = asset.asset_key
where version.asset_id = asset.id
  and version.status = 'active'
  and (version.source <> 'packaged' or version.packaged_path is distinct from desired.packaged_path);

with desired(asset_key, packaged_path, alt_text_key, byte_size) as (values
  ('prestige.border.firstHorizon', '/assets/prestige/first-horizon.webp', 'prestige.firstHorizon.name', 49320),
  ('prestige.border.routeAtlas', '/assets/prestige/route-atlas.webp', 'prestige.routeAtlas.name', 55948),
  ('prestige.border.letterSky', '/assets/prestige/letter-sky.webp', 'prestige.letterSky.name', 56372),
  ('prestige.border.nestAmongStars', '/assets/prestige/nest-among-stars.webp', 'prestige.nestAmongStars.name', 59408)
), missing as (
  select
    asset.id as asset_id,
    desired.*,
    coalesce(max(version.version), 0) + 1 as next_version
  from desired
  join public.official_assets asset on asset.asset_key = desired.asset_key
  left join public.official_asset_versions version on version.asset_id = asset.id
  group by asset.id, desired.asset_key, desired.packaged_path, desired.alt_text_key, desired.byte_size
  having not bool_or(
    version.status = 'active'
    and version.source = 'packaged'
    and version.packaged_path = desired.packaged_path
  )
)
insert into public.official_asset_versions(
  asset_id,
  version,
  source,
  status,
  packaged_path,
  mime_type,
  width,
  height,
  byte_size,
  alt_text_key,
  is_decorative,
  author,
  metadata
)
select
  asset_id,
  next_version,
  'packaged',
  'active',
  packaged_path,
  'image/webp',
  512,
  512,
  byte_size,
  alt_text_key,
  false,
  'DUIF',
  jsonb_build_object(
    'kind', 'prestigeBorder',
    'milestone', 58,
    'artDirection', 'illustratedCircularPrestigeFrame',
    'transparentCenter', true,
    'pathCorrection', '20260825145000'
  )
from missing;
