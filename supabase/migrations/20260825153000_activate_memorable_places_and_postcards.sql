-- Replace the local memorable-place preview with authoritative catalog entries and
-- grant each place's permanent postcard in the same transaction as the unlock.

insert into public.official_translation_keys(translation_key) values
  ('landmarks.masp.name'),
  ('landmarks.masp.description'),
  ('landmarks.masp.alt'),
  ('officialPostcards.christTheRedeemer.name'),
  ('officialPostcards.christTheRedeemer.description'),
  ('officialPostcards.christTheRedeemer.alt'),
  ('officialPostcards.masp.name'),
  ('officialPostcards.masp.description'),
  ('officialPostcards.masp.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('landmark.masp.artwork','landmarkArtwork'),
  ('postcard.landmark.christTheRedeemer.front','postcardArtwork'),
  ('postcard.landmark.masp.front','postcardArtwork')
on conflict(asset_key) do nothing;

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select a.id,v.version,'packaged','active',v.path,'image/webp',v.width,v.height,v.bytes,
  v.alt_key,false,'DUIF',v.metadata
from (values
  ('landmark.masp.artwork',1,'/assets/landmarks/masp.webp',256,256,15720,
    'landmarks.masp.alt',jsonb_build_object('kind','landmarkArtwork','catalogKey','landmark.masp','artDirection','postalWatercolorSticker')),
  ('postcard.landmark.christTheRedeemer.front',1,'/assets/postcards/landmarks/christ-the-redeemer.webp',1200,800,138302,
    'officialPostcards.christTheRedeemer.alt',jsonb_build_object('kind','postcardArtwork','landmarkCatalogKey','landmark.christ-the-redeemer')),
  ('postcard.landmark.masp.front',1,'/assets/postcards/landmarks/masp.webp',1200,800,202524,
    'officialPostcards.masp.alt',jsonb_build_object('kind','postcardArtwork','landmarkCatalogKey','landmark.masp'))
) as v(asset_key,version,path,width,height,bytes,alt_key,metadata)
join public.official_assets a on a.asset_key=v.asset_key
where not exists(
  select 1 from public.official_asset_versions existing
  where existing.asset_id=a.id and existing.version=v.version
);

insert into public.official_postcards(
  catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order
) values
  ('postcard-landmark-christ-the-redeemer','officialPostcards.christTheRedeemer.name',
    'officialPostcards.christTheRedeemer.description','postcard.landmark.christTheRedeemer.front','city','active',20),
  ('postcard-landmark-masp','officialPostcards.masp.name',
    'officialPostcards.masp.description','postcard.landmark.masp.front','city','active',21)
on conflict(catalog_key) do update set
  name_key=excluded.name_key,
  description_key=excluded.description_key,
  artwork_asset_key=excluded.artwork_asset_key,
  availability=excluded.availability,
  status=excluded.status,
  sort_order=excluded.sort_order;

alter table public.world_landmark_catalog
  add column postcard_catalog_key text references public.official_postcards(catalog_key);

update public.world_landmark_catalog
set postcard_catalog_key='postcard-landmark-christ-the-redeemer'
where catalog_key='landmark.christ-the-redeemer';

insert into public.world_landmark_catalog(
  catalog_key,rules_version,name_key,description_key,asset_key,latitude,longitude,
  eligibility_radius_km,category,city,region,country_code,minimum_zoom,icon_size_px,
  active,sort_order,postcard_catalog_key
) values (
  'landmark.masp',1,'landmarks.masp.name','landmarks.masp.description','landmark.masp.artwork',
  -23.56142,-46.65588,25,'architectural','São Paulo','São Paulo','BR',8,56,true,2,
  'postcard-landmark-masp'
)
on conflict(catalog_key) do update set
  name_key=excluded.name_key,
  description_key=excluded.description_key,
  asset_key=excluded.asset_key,
  latitude=excluded.latitude,
  longitude=excluded.longitude,
  eligibility_radius_km=excluded.eligibility_radius_km,
  category=excluded.category,
  city=excluded.city,
  region=excluded.region,
  country_code=excluded.country_code,
  minimum_zoom=excluded.minimum_zoom,
  icon_size_px=excluded.icon_size_px,
  active=excluded.active,
  sort_order=excluded.sort_order,
  postcard_catalog_key=excluded.postcard_catalog_key;

alter table public.world_landmark_catalog
  alter column postcard_catalog_key set not null;

create or replace function public.grant_landmark_postcard()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare postcard_key text;
begin
  select postcard_catalog_key into strict postcard_key
  from public.world_landmark_catalog where id=new.landmark_id;

  insert into public.profile_postcard_unlocks(
    profile_id,postcard_catalog_key,source,unlocked_at
  ) values (
    new.profile_id,postcard_key,'memorable-place',new.unlocked_at
  ) on conflict(profile_id,postcard_catalog_key) do nothing;
  return new;
end $$;

create trigger grant_landmark_postcard_after_unlock
after insert on public.profile_landmark_unlocks
for each row execute function public.grant_landmark_postcard();

-- Players who encountered the Cristo before this rule was published receive its
-- paired postcard without changing the original encounter or acknowledgement.
insert into public.profile_postcard_unlocks(
  profile_id,postcard_catalog_key,source,unlocked_at
)
select u.profile_id,l.postcard_catalog_key,'memorable-place',u.unlocked_at
from public.profile_landmark_unlocks u
join public.world_landmark_catalog l on l.id=u.landmark_id
on conflict(profile_id,postcard_catalog_key) do nothing;

create or replace function public.reconcile_my_world_landmarks()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid; result jsonb;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  if me is null then raise exception 'Profile not found' using errcode='42501'; end if;
  perform public.resolve_due_landmark_encounters(now(),me);
  select jsonb_build_object(
    'landmarks',coalesce(jsonb_agg(jsonb_build_object(
      'catalogKey',l.catalog_key,'nameKey',l.name_key,'descriptionKey',l.description_key,
      'assetKey',l.asset_key,'postcardCatalogKey',l.postcard_catalog_key,
      'category',l.category,'city',l.city,'region',l.region,
      'countryCode',l.country_code,'latitude',l.latitude,'longitude',l.longitude,
      'minimumZoom',l.minimum_zoom,'iconSizePx',l.icon_size_px,'unlockedAt',u.unlocked_at,
      'announcementPending',u.acknowledged_at is null
    ) order by u.unlocked_at),'[]'::jsonb)
  ) into result
  from public.profile_landmark_unlocks u
  join public.world_landmark_catalog l on l.id=u.landmark_id
  where u.profile_id=me and l.active;
  return result;
end $$;

revoke all on function public.grant_landmark_postcard() from public,anon,authenticated;
