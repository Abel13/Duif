-- Official postcards for the first four cities with active nests. Unlocks use
-- the canonical M58 destination identity and never infer a city from labels.

insert into public.official_translation_keys(translation_key) values
  ('officialPostcards.cities.manhuacu.name'),
  ('officialPostcards.cities.manhuacu.description'),
  ('officialPostcards.cities.manhuacu.alt'),
  ('officialPostcards.cities.londrina.name'),
  ('officialPostcards.cities.londrina.description'),
  ('officialPostcards.cities.londrina.alt'),
  ('officialPostcards.cities.novaFriburgo.name'),
  ('officialPostcards.cities.novaFriburgo.description'),
  ('officialPostcards.cities.novaFriburgo.alt'),
  ('officialPostcards.cities.hongKong.name'),
  ('officialPostcards.cities.hongKong.description'),
  ('officialPostcards.cities.hongKong.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('postcard.city.3457952.front','postcardArtwork'),
  ('postcard.city.3458449.front','postcardArtwork'),
  ('postcard.city.3456166.front','postcardArtwork'),
  ('postcard.city.1819729.front','postcardArtwork')
on conflict(asset_key) do nothing;

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select asset.id,1,'packaged','active',entry.path,'image/webp',1200,800,entry.bytes,
  entry.alt_key,false,'DUIF',jsonb_build_object(
    'kind','postcardArtwork','cityGeonameId',entry.geoname_id,
    'artDirection','postalWatercolorCity'
  )
from (values
  ('postcard.city.3457952.front','/assets/postcards/cities/manhuacu.webp',150288,'officialPostcards.cities.manhuacu.alt',3457952::bigint),
  ('postcard.city.3458449.front','/assets/postcards/cities/londrina.webp',173742,'officialPostcards.cities.londrina.alt',3458449::bigint),
  ('postcard.city.3456166.front','/assets/postcards/cities/nova-friburgo.webp',173308,'officialPostcards.cities.novaFriburgo.alt',3456166::bigint),
  ('postcard.city.1819729.front','/assets/postcards/cities/hong-kong.webp',162442,'officialPostcards.cities.hongKong.alt',1819729::bigint)
) entry(asset_key,path,bytes,alt_key,geoname_id)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions version
  where version.asset_id=asset.id and version.version=1
);

insert into public.official_postcards(
  catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order
) values
  ('postcard-city-3457952','officialPostcards.cities.manhuacu.name','officialPostcards.cities.manhuacu.description','postcard.city.3457952.front','city','active',30),
  ('postcard-city-3458449','officialPostcards.cities.londrina.name','officialPostcards.cities.londrina.description','postcard.city.3458449.front','city','active',31),
  ('postcard-city-3456166','officialPostcards.cities.novaFriburgo.name','officialPostcards.cities.novaFriburgo.description','postcard.city.3456166.front','city','active',32),
  ('postcard-city-1819729','officialPostcards.cities.hongKong.name','officialPostcards.cities.hongKong.description','postcard.city.1819729.front','city','active',33)
on conflict(catalog_key) do update set
  name_key=excluded.name_key,
  description_key=excluded.description_key,
  artwork_asset_key=excluded.artwork_asset_key,
  availability=excluded.availability,
  status=excluded.status,
  sort_order=excluded.sort_order;

create table public.city_postcard_catalog(
  geoname_id bigint primary key check(geoname_id>0),
  postcard_catalog_key text not null unique references public.official_postcards(catalog_key),
  rules_version integer not null default 1 check(rules_version>0),
  city_name text not null,
  country_code text not null check(country_code~'^[A-Z]{2}$'),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.city_postcard_catalog(
  geoname_id,postcard_catalog_key,city_name,country_code
) values
  (3457952,'postcard-city-3457952','Manhuaçu','BR'),
  (3458449,'postcard-city-3458449','Londrina','BR'),
  (3456166,'postcard-city-3456166','Nova Friburgo','BR'),
  (1819729,'postcard-city-1819729','Hong Kong','HK');

alter table public.city_postcard_catalog enable row level security;
revoke all on public.city_postcard_catalog from public,anon,authenticated;

create or replace function public.grant_completed_city_postcard()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare destination_identity text; destination_geoname_id bigint; postcard_key text;
begin
  if new.status<>'completed' or old.status='completed' or new.is_tutorial then
    return new;
  end if;
  if coalesce((new.route_identity->>'version')::integer,0)<>3 then
    return new;
  end if;
  destination_identity:=new.route_identity->>'destination';
  if destination_identity is null or destination_identity!~'^city:[0-9]+$' then
    return new;
  end if;
  destination_geoname_id:=substring(destination_identity from 6)::bigint;
  select catalog.postcard_catalog_key into postcard_key
  from public.city_postcard_catalog catalog
  where catalog.geoname_id=destination_geoname_id and catalog.active;
  if postcard_key is null then return new; end if;
  insert into public.profile_postcard_unlocks(
    profile_id,postcard_catalog_key,source,unlocked_at
  ) values(new.sender_profile_id,postcard_key,'completed-city-visit',now())
  on conflict(profile_id,postcard_catalog_key) do nothing;
  return new;
end $$;

create trigger grant_completed_city_postcard_after_delivery
after update of status on public.deliveries for each row
execute function public.grant_completed_city_postcard();

-- Only canonical v3 histories are safe to backfill. Ambiguous labels and legacy
-- coordinate snapshots remain untouched.
insert into public.profile_postcard_unlocks(
  profile_id,postcard_catalog_key,source,unlocked_at
)
select delivery.sender_profile_id,catalog.postcard_catalog_key,
  'completed-city-visit-backfill',delivery.updated_at
from public.deliveries delivery
join public.city_postcard_catalog catalog
  on delivery.route_identity->>'destination'='city:'||catalog.geoname_id
where delivery.status='completed' and not delivery.is_tutorial
  and coalesce((delivery.route_identity->>'version')::integer,0)=3
  and catalog.active
on conflict(profile_id,postcard_catalog_key) do nothing;

revoke all on function public.grant_completed_city_postcard() from public,anon,authenticated;
