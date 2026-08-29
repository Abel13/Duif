-- Second reviewed batch of Brazilian-capital postcards. Ownership is tied to
-- canonical GeoNames city identities and reconciled idempotently.

insert into public.official_translation_keys(translation_key) values
  ('officialPostcards.cities.manaus.name'),
  ('officialPostcards.cities.manaus.description'),
  ('officialPostcards.cities.manaus.alt'),
  ('officialPostcards.cities.brasilia.name'),
  ('officialPostcards.cities.brasilia.description'),
  ('officialPostcards.cities.brasilia.alt'),
  ('officialPostcards.cities.curitiba.name'),
  ('officialPostcards.cities.curitiba.description'),
  ('officialPostcards.cities.curitiba.alt'),
  ('officialPostcards.cities.recife.name'),
  ('officialPostcards.cities.recife.description'),
  ('officialPostcards.cities.recife.alt'),
  ('officialPostcards.cities.goiania.name'),
  ('officialPostcards.cities.goiania.description'),
  ('officialPostcards.cities.goiania.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('postcard.city.3663517.front','postcardArtwork'),
  ('postcard.city.3469058.front','postcardArtwork'),
  ('postcard.city.3464975.front','postcardArtwork'),
  ('postcard.city.3390760.front','postcardArtwork'),
  ('postcard.city.3462377.front','postcardArtwork')
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
  ('postcard.city.3663517.front','/assets/postcards/cities/manaus.webp',149618,'officialPostcards.cities.manaus.alt',3663517::bigint),
  ('postcard.city.3469058.front','/assets/postcards/cities/brasilia.webp',160318,'officialPostcards.cities.brasilia.alt',3469058::bigint),
  ('postcard.city.3464975.front','/assets/postcards/cities/curitiba.webp',177604,'officialPostcards.cities.curitiba.alt',3464975::bigint),
  ('postcard.city.3390760.front','/assets/postcards/cities/recife.webp',166552,'officialPostcards.cities.recife.alt',3390760::bigint),
  ('postcard.city.3462377.front','/assets/postcards/cities/goiania.webp',175348,'officialPostcards.cities.goiania.alt',3462377::bigint)
) entry(asset_key,path,bytes,alt_key,geoname_id)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions version
  where version.asset_id=asset.id and version.version=1
);

insert into public.official_postcards(
  catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order
) values
  ('postcard-city-3663517','officialPostcards.cities.manaus.name','officialPostcards.cities.manaus.description','postcard.city.3663517.front','city','active',39),
  ('postcard-city-3469058','officialPostcards.cities.brasilia.name','officialPostcards.cities.brasilia.description','postcard.city.3469058.front','city','active',40),
  ('postcard-city-3464975','officialPostcards.cities.curitiba.name','officialPostcards.cities.curitiba.description','postcard.city.3464975.front','city','active',41),
  ('postcard-city-3390760','officialPostcards.cities.recife.name','officialPostcards.cities.recife.description','postcard.city.3390760.front','city','active',42),
  ('postcard-city-3462377','officialPostcards.cities.goiania.name','officialPostcards.cities.goiania.description','postcard.city.3462377.front','city','active',43)
on conflict(catalog_key) do update set
  name_key=excluded.name_key,
  description_key=excluded.description_key,
  artwork_asset_key=excluded.artwork_asset_key,
  availability=excluded.availability,
  status=excluded.status,
  sort_order=excluded.sort_order;

insert into public.city_postcard_catalog(
  geoname_id,postcard_catalog_key,city_name,country_code
) values
  (3663517,'postcard-city-3663517','Manaus','BR'),
  (3469058,'postcard-city-3469058','Brasília','BR'),
  (3464975,'postcard-city-3464975','Curitiba','BR'),
  (3390760,'postcard-city-3390760','Recife','BR'),
  (3462377,'postcard-city-3462377','Goiânia','BR')
on conflict(geoname_id) do update set
  postcard_catalog_key=excluded.postcard_catalog_key,
  city_name=excluded.city_name,
  country_code=excluded.country_code,
  active=true;

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
  and catalog.geoname_id in (3663517,3469058,3464975,3390760,3462377)
  and catalog.active
on conflict(profile_id,postcard_catalog_key) do nothing;

do $$
declare selected_profile record;
begin
  for selected_profile in
    select profile.id
    from public.profiles profile
    join public.account_onboarding onboarding
      on onboarding.auth_user_id=profile.auth_user_id
     and onboarding.stage='completed'
    where profile.home_city_geoname_id in (3663517,3469058,3464975,3390760,3462377)
  loop
    perform public.grant_home_origin_collectibles(selected_profile.id,now());
  end loop;
end
$$;
