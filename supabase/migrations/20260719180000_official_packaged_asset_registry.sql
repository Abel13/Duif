create type public.official_asset_type as enum (
  'mascotPortrait', 'equipmentIcon', 'rewardThumbnail', 'collectibleThumbnail',
  'navigationIcon', 'mapControl', 'mapPin', 'currencyIcon', 'shopArtwork',
  'texture', 'postalMark'
);
create type public.official_asset_source as enum ('packaged', 'storage');

create table public.official_assets (
  id uuid primary key default gen_random_uuid(),
  asset_key text not null unique check (asset_key ~ '^[a-z][a-zA-Z0-9]*(\.[a-zA-Z0-9]+)+$'),
  asset_type public.official_asset_type not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.official_asset_versions (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.official_assets(id) on delete restrict,
  version integer not null check (version > 0),
  source public.official_asset_source not null,
  status public.catalog_status not null default 'draft',
  packaged_path text,
  storage_bucket text,
  storage_object_path text,
  mime_type text not null,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  byte_size integer not null check (byte_size > 0),
  alt_text_key text references public.official_translation_keys(translation_key),
  is_decorative boolean not null default false,
  author text not null check (length(trim(author)) > 0),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  unique (asset_id, version),
  constraint official_asset_location_check check (
    (source = 'packaged' and packaged_path ~ '^/assets/[a-z0-9/.-]+$'
      and storage_bucket is null and storage_object_path is null)
    or
    (source = 'storage' and packaged_path is null
      and length(trim(storage_bucket)) > 0 and length(trim(storage_object_path)) > 0)
  ),
  constraint official_asset_alt_check check (
    (is_decorative and alt_text_key is null) or (not is_decorative and alt_text_key is not null)
  )
);

create unique index official_asset_one_active_version_idx
  on public.official_asset_versions(asset_id) where status = 'active';

create or replace function public.protect_published_asset_version()
returns trigger language plpgsql set search_path = public as $$
begin
  if old.status <> 'draft' and (
    new.asset_id, new.version, new.source, new.packaged_path, new.storage_bucket,
    new.storage_object_path, new.mime_type, new.width, new.height, new.byte_size,
    new.alt_text_key, new.is_decorative, new.author, new.metadata
  ) is distinct from (
    old.asset_id, old.version, old.source, old.packaged_path, old.storage_bucket,
    old.storage_object_path, old.mime_type, old.width, old.height, old.byte_size,
    old.alt_text_key, old.is_decorative, old.author, old.metadata
  ) then raise exception 'Published asset versions are immutable' using errcode = '23514'; end if;
  return new;
end;
$$;

create trigger protect_published_asset_version_before_update
before update on public.official_asset_versions
for each row execute function public.protect_published_asset_version();

create or replace function public.validate_official_asset_version()
returns trigger language plpgsql set search_path = public as $$
declare
  selected_type public.official_asset_type;
  max_bytes integer;
  max_dimension integer;
begin
  select asset_type into selected_type from public.official_assets where id = new.asset_id;
  if selected_type is null then raise exception 'Unknown official asset' using errcode = '23503'; end if;
  if jsonb_typeof(new.metadata) <> 'object' or new.metadata ->> 'kind' <> selected_type::text then
    raise exception 'Asset metadata does not match its type' using errcode = '23514';
  end if;
  if new.source = 'packaged' and (
    (selected_type = 'currencyIcon' and new.mime_type <> 'image/svg+xml') or
    (selected_type <> 'currencyIcon' and new.mime_type <> 'image/webp')
  ) then raise exception 'Asset MIME type does not match its type' using errcode = '23514'; end if;

  max_bytes := case selected_type
    when 'mascotPortrait' then 153600 when 'navigationIcon' then 30720
    when 'currencyIcon' then 15360 when 'texture' then 81920 else 61440 end;
  max_dimension := case selected_type
    when 'mascotPortrait' then 640 when 'texture' then 512
    when 'navigationIcon' then 160 when 'currencyIcon' then 128
    when 'equipmentIcon' then 192 else 256 end;
  if new.byte_size > max_bytes or new.width > max_dimension or new.height > max_dimension then
    raise exception 'Asset exceeds its runtime budget' using errcode = '23514';
  end if;
  if not new.is_decorative and not public.translation_key_is_official(new.alt_text_key) then
    raise exception 'Asset alt text is not fully translated' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger validate_official_asset_version_before_write
before insert or update on public.official_asset_versions
for each row execute function public.validate_official_asset_version();

alter table public.official_assets enable row level security;
alter table public.official_asset_versions enable row level security;
create policy "Official asset identities are publicly readable" on public.official_assets
  for select using (exists (
    select 1 from public.official_asset_versions v
    where v.asset_id = official_assets.id and v.status = 'active'
  ));
create policy "Active official asset versions are publicly readable" on public.official_asset_versions
  for select using (status = 'active');
revoke insert, update, delete on public.official_assets from anon, authenticated;
revoke insert, update, delete on public.official_asset_versions from anon, authenticated;

insert into public.official_translation_keys (translation_key) values
  ('shop.items.crimsonCourierScarf.name'), ('shop.items.meadowPostCap.name'),
  ('shop.items.sunnyRouteSticker.name'), ('shop.items.blueEnvelopeSticker.name'),
  ('shop.items.coastalTownPostcard.name'), ('shop.items.lanternFestivalPostcard.name'),
  ('shop.items.brassNestPlaque.name'), ('shop.items.airmailProfileRibbon.name')
on conflict (translation_key) do nothing;

with entries(asset_key, asset_type) as (values
  ('mascot.portrait.nuvem','mascotPortrait'),('mascot.portrait.trovao','mascotPortrait'),('mascot.portrait.pipoca','mascotPortrait'),
  ('mascot.portrait.aurora','mascotPortrait'),('mascot.portrait.maple','mascotPortrait'),('mascot.portrait.bento','mascotPortrait'),('mascot.portrait.oliva','mascotPortrait'),
  ('equipment.icon.canvasPostalBag','equipmentIcon'),('equipment.icon.blueRouteScarf','equipmentIcon'),('equipment.icon.flightGoggles','equipmentIcon'),('equipment.icon.urgentBadge','equipmentIcon'),
  ('reward.thumbnail.wornRouteStamp','rewardThumbnail'),('reward.thumbnail.blueAirmailLabel','rewardThumbnail'),('reward.thumbnail.goldenCompassPin','rewardThumbnail'),('reward.thumbnail.atlanticBadge','rewardThumbnail'),
  ('navigation.icon.nest','navigationIcon'),('navigation.icon.collection','navigationIcon'),('navigation.icon.map','navigationIcon'),('navigation.icon.friends','navigationIcon'),('navigation.icon.shop','navigationIcon'),
  ('currency.icon.stamp','currencyIcon'),('currency.icon.crystal','currencyIcon'),
  ('map.control.overview','mapControl'),('map.control.mascot','mapControl'),('map.control.origin','mapControl'),('map.control.destination','mapControl'),
  ('map.pin.nest','mapPin'),('map.pin.destination','mapPin'),
  ('shop.thumbnail.crimsonCourierScarf','shopArtwork'),('shop.thumbnail.meadowPostCap','shopArtwork'),('shop.thumbnail.sunnyRouteSticker','shopArtwork'),('shop.thumbnail.blueEnvelopeSticker','shopArtwork'),
  ('shop.thumbnail.coastalTownPostcard','shopArtwork'),('shop.thumbnail.lanternFestivalPostcard','shopArtwork'),('shop.thumbnail.brassNestPlaque','shopArtwork'),('shop.thumbnail.airmailProfileRibbon','shopArtwork'),
  ('texture.postalPaperWash','texture'),('postalMark.postalCancel','postalMark'),('postalMark.routeDoodle','postalMark')
)
insert into public.official_assets(asset_key, asset_type)
select asset_key, asset_type::public.official_asset_type from entries;

with versions(asset_key,path,mime,width,height,bytes,alt_key,decorative,status) as (values
  ('mascot.portrait.nuvem','/assets/mascots/portraits/nuvem.webp','image/webp',640,640,60810,'appearance.nuvemPortrait',false,'active'),
  ('mascot.portrait.trovao','/assets/mascots/portraits/trovao.webp','image/webp',640,640,69298,'appearance.trovaoPortrait',false,'active'),
  ('mascot.portrait.pipoca','/assets/mascots/portraits/pipoca.webp','image/webp',640,640,65336,'appearance.pipocaPortrait',false,'active'),
  ('mascot.portrait.aurora','/assets/friends/mascots/aurora.webp','image/webp',512,512,58288,'species.carrierPigeon',false,'active'),
  ('mascot.portrait.maple','/assets/friends/mascots/maple.webp','image/webp',256,256,5836,'species.carrierPigeon',false,'active'),
  ('mascot.portrait.bento','/assets/mascots/public/bento.webp','image/webp',256,256,7536,'species.messengerFalcon',false,'active'),
  ('mascot.portrait.oliva','/assets/mascots/public/oliva.webp','image/webp',256,256,5292,'species.mailDuck',false,'active'),
  ('equipment.icon.canvasPostalBag','/assets/equipment/icons/canvas-postal-bag.webp','image/webp',192,192,9622,'equipment.canvasPostalBag.name',false,'active'),
  ('equipment.icon.blueRouteScarf','/assets/equipment/icons/blue-route-scarf.webp','image/webp',192,192,8076,'equipment.blueRouteScarf.name',false,'active'),
  ('equipment.icon.flightGoggles','/assets/equipment/icons/flight-goggles.webp','image/webp',192,192,8538,'equipment.flightGoggles.name',false,'active'),
  ('equipment.icon.urgentBadge','/assets/equipment/icons/urgent-badge.webp','image/webp',192,192,8458,'equipment.urgentBadge.name',false,'active'),
  ('reward.thumbnail.wornRouteStamp','/assets/items/thumbnails/worn-route-stamp.webp','image/webp',256,256,16492,'rewards.items.wornRouteStamp.name',false,'active'),
  ('reward.thumbnail.blueAirmailLabel','/assets/items/thumbnails/blue-airmail-label.webp','image/webp',256,256,16398,'rewards.items.blueAirmailLabel.name',false,'active'),
  ('reward.thumbnail.goldenCompassPin','/assets/items/thumbnails/golden-compass-pin.webp','image/webp',256,256,15022,'rewards.items.goldenCompassPin.name',false,'active'),
  ('reward.thumbnail.atlanticBadge','/assets/items/thumbnails/atlantic-badge.webp','image/webp',256,256,16882,'map.rewards.rolandiaBadge.name',false,'active'),
  ('navigation.icon.nest','/assets/navigation/nest.webp','image/webp',160,160,7354,null,true,'active'),
  ('navigation.icon.collection','/assets/navigation/collection.webp','image/webp',160,160,8338,null,true,'active'),
  ('navigation.icon.map','/assets/navigation/map.webp','image/webp',160,160,6330,null,true,'active'),
  ('navigation.icon.friends','/assets/navigation/friends.webp','image/webp',160,160,6964,null,true,'active'),
  ('navigation.icon.shop','/assets/navigation/shop.webp','image/webp',160,160,6834,null,true,'active'),
  ('currency.icon.stamp','/assets/currency/stamp.svg','image/svg+xml',64,64,704,null,true,'active'),
  ('currency.icon.crystal','/assets/currency/crystal.svg','image/svg+xml',64,64,641,null,true,'active'),
  ('map.control.overview','/assets/map/controls/overview.webp','image/webp',256,256,11768,null,true,'active'),
  ('map.control.mascot','/assets/map/controls/mascot.webp','image/webp',256,256,8516,null,true,'active'),
  ('map.control.origin','/assets/map/controls/origin.webp','image/webp',256,256,11218,null,true,'active'),
  ('map.control.destination','/assets/map/controls/destination.webp','image/webp',256,256,8110,null,true,'active'),
  ('map.pin.nest','/assets/map/pins/nest.webp','image/webp',256,256,12398,null,true,'active'),
  ('map.pin.destination','/assets/map/pins/destination.webp','image/webp',256,256,10284,null,true,'active'),
  ('shop.thumbnail.crimsonCourierScarf','/assets/shop/thumbnails/crimson-courier-scarf.webp','image/webp',256,256,6152,'shop.items.crimsonCourierScarf.name',false,'active'),
  ('shop.thumbnail.meadowPostCap','/assets/shop/thumbnails/meadow-post-cap.webp','image/webp',256,256,5724,'shop.items.meadowPostCap.name',false,'active'),
  ('shop.thumbnail.sunnyRouteSticker','/assets/shop/thumbnails/sunny-route-sticker.webp','image/webp',256,256,4266,'shop.items.sunnyRouteSticker.name',false,'active'),
  ('shop.thumbnail.blueEnvelopeSticker','/assets/shop/thumbnails/blue-envelope-sticker.webp','image/webp',256,256,6188,'shop.items.blueEnvelopeSticker.name',false,'active'),
  ('shop.thumbnail.coastalTownPostcard','/assets/shop/thumbnails/coastal-town-postcard.webp','image/webp',256,256,7556,'shop.items.coastalTownPostcard.name',false,'active'),
  ('shop.thumbnail.lanternFestivalPostcard','/assets/shop/thumbnails/lantern-festival-postcard.webp','image/webp',256,256,10478,'shop.items.lanternFestivalPostcard.name',false,'active'),
  ('shop.thumbnail.brassNestPlaque','/assets/shop/thumbnails/brass-nest-plaque.webp','image/webp',256,256,6918,'shop.items.brassNestPlaque.name',false,'active'),
  ('shop.thumbnail.airmailProfileRibbon','/assets/shop/thumbnails/airmail-profile-ribbon.webp','image/webp',256,256,7142,'shop.items.airmailProfileRibbon.name',false,'active'),
  ('texture.postalPaperWash','/assets/textures/postal-paper-wash.webp','image/webp',512,512,20784,null,true,'active'),
  ('postalMark.postalCancel','/assets/textures/postal-cancel-mark.webp','image/webp',256,256,6672,null,true,'active'),
  ('postalMark.routeDoodle','/assets/textures/route-doodle-mark.webp','image/webp',256,256,3762,null,true,'archived')
)
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select a.id,1,'packaged',v.status::public.catalog_status,v.path,v.mime,v.width,v.height,v.bytes,v.alt_key,v.decorative,'DUIF',jsonb_build_object('kind',a.asset_type::text)
from versions v join public.official_assets a using(asset_key);

alter table public.reward_items rename column thumbnail_asset_path to thumbnail_asset_key;
alter table public.inventory_items rename column thumbnail_asset_path to thumbnail_asset_key;
update public.reward_items set thumbnail_asset_key = case catalog_key
  when 'reward-worn-route-stamp' then 'reward.thumbnail.wornRouteStamp'
  when 'reward-blue-airmail-label' then 'reward.thumbnail.blueAirmailLabel'
  when 'reward-golden-compass-pin' then 'reward.thumbnail.goldenCompassPin'
  else null end;
update public.inventory_items i set thumbnail_asset_key = r.thumbnail_asset_key
from public.reward_items r where r.id = i.reward_item_id;
update public.mascot_templates set
  appearance = (appearance - 'portraitAssetPath') || jsonb_build_object('portraitAssetKey', case catalog_key
    when 'mascot-nuvem' then 'mascot.portrait.nuvem' when 'mascot-trovao' then 'mascot.portrait.trovao'
    when 'mascot-pipoca' then 'mascot.portrait.pipoca' end),
  equipment = (select jsonb_agg(case item->>'iconAssetPath'
    when '/assets/equipment/icons/canvas-postal-bag.webp' then (item - 'iconAssetPath') || '{"iconAssetKey":"equipment.icon.canvasPostalBag"}'::jsonb
    when '/assets/equipment/icons/blue-route-scarf.webp' then (item - 'iconAssetPath') || '{"iconAssetKey":"equipment.icon.blueRouteScarf"}'::jsonb
    when '/assets/equipment/icons/flight-goggles.webp' then (item - 'iconAssetPath') || '{"iconAssetKey":"equipment.icon.flightGoggles"}'::jsonb
    when '/assets/equipment/icons/urgent-badge.webp' then (item - 'iconAssetPath') || '{"iconAssetKey":"equipment.icon.urgentBadge"}'::jsonb
    else item - 'iconAssetPath' end) from jsonb_array_elements(equipment) item);
update public.player_mascots pm set
  appearance = mt.appearance,
  equipment = mt.equipment
from public.mascot_templates mt where mt.id = pm.template_id;

do $$ declare fn record; definition text; begin
  definition := pg_get_functiondef(
    'public.get_nearby_postal_traffic(double precision,double precision,double precision,double precision,double precision,double precision)'::regprocedure
  );
  execute 'drop function public.get_nearby_postal_traffic(double precision,double precision,double precision,double precision,double precision,double precision)';
  definition := replace(replace(definition,'portrait_asset_path','portrait_asset_key'),'portraitAssetPath','portraitAssetKey');
  execute definition;
  execute 'revoke all on function public.get_nearby_postal_traffic(double precision,double precision,double precision,double precision,double precision,double precision) from public';
  execute 'grant execute on function public.get_nearby_postal_traffic(double precision,double precision,double precision,double precision,double precision,double precision) to authenticated';
  for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prokind in ('f','p') and pg_get_functiondef(p.oid) like '%thumbnail_asset_path%'
  loop
    definition := replace(pg_get_functiondef(fn.oid),'thumbnail_asset_path','thumbnail_asset_key');
    execute definition;
  end loop;
  for fn in select p.oid from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.prokind in ('f','p') and pg_get_functiondef(p.oid) like '%portraitAssetPath%'
  loop
    definition := replace(pg_get_functiondef(fn.oid),'portraitAssetPath','portraitAssetKey');
    execute definition;
  end loop;
end $$;

comment on table public.official_assets is 'Stable identities for official DUIF visual assets.';
comment on table public.official_asset_versions is 'Immutable official asset versions; activation is migration-only until Milestone 46.';
