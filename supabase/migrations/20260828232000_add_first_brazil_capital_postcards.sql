-- First reviewed batch of Brazilian-capital postcards. City ownership remains
-- tied to the canonical GeoNames identity used by M58 routes.

insert into public.official_translation_keys(translation_key) values
  ('officialPostcards.cities.saoPaulo.name'),
  ('officialPostcards.cities.saoPaulo.description'),
  ('officialPostcards.cities.saoPaulo.alt'),
  ('officialPostcards.cities.rioDeJaneiro.name'),
  ('officialPostcards.cities.rioDeJaneiro.description'),
  ('officialPostcards.cities.rioDeJaneiro.alt'),
  ('officialPostcards.cities.beloHorizonte.name'),
  ('officialPostcards.cities.beloHorizonte.description'),
  ('officialPostcards.cities.beloHorizonte.alt'),
  ('officialPostcards.cities.salvador.name'),
  ('officialPostcards.cities.salvador.description'),
  ('officialPostcards.cities.salvador.alt'),
  ('officialPostcards.cities.fortaleza.name'),
  ('officialPostcards.cities.fortaleza.description'),
  ('officialPostcards.cities.fortaleza.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('postcard.city.3448439.front','postcardArtwork'),
  ('postcard.city.3451190.front','postcardArtwork'),
  ('postcard.city.3470127.front','postcardArtwork'),
  ('postcard.city.3450554.front','postcardArtwork'),
  ('postcard.city.3399415.front','postcardArtwork')
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
  ('postcard.city.3448439.front','/assets/postcards/cities/sao-paulo.webp',182030,'officialPostcards.cities.saoPaulo.alt',3448439::bigint),
  ('postcard.city.3451190.front','/assets/postcards/cities/rio-de-janeiro.webp',174382,'officialPostcards.cities.rioDeJaneiro.alt',3451190::bigint),
  ('postcard.city.3470127.front','/assets/postcards/cities/belo-horizonte.webp',183808,'officialPostcards.cities.beloHorizonte.alt',3470127::bigint),
  ('postcard.city.3450554.front','/assets/postcards/cities/salvador.webp',164154,'officialPostcards.cities.salvador.alt',3450554::bigint),
  ('postcard.city.3399415.front','/assets/postcards/cities/fortaleza.webp',170564,'officialPostcards.cities.fortaleza.alt',3399415::bigint)
) entry(asset_key,path,bytes,alt_key,geoname_id)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions version
  where version.asset_id=asset.id and version.version=1
);

insert into public.official_postcards(
  catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order
) values
  ('postcard-city-3448439','officialPostcards.cities.saoPaulo.name','officialPostcards.cities.saoPaulo.description','postcard.city.3448439.front','city','active',34),
  ('postcard-city-3451190','officialPostcards.cities.rioDeJaneiro.name','officialPostcards.cities.rioDeJaneiro.description','postcard.city.3451190.front','city','active',35),
  ('postcard-city-3470127','officialPostcards.cities.beloHorizonte.name','officialPostcards.cities.beloHorizonte.description','postcard.city.3470127.front','city','active',36),
  ('postcard-city-3450554','officialPostcards.cities.salvador.name','officialPostcards.cities.salvador.description','postcard.city.3450554.front','city','active',37),
  ('postcard-city-3399415','officialPostcards.cities.fortaleza.name','officialPostcards.cities.fortaleza.description','postcard.city.3399415.front','city','active',38)
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
  (3448439,'postcard-city-3448439','São Paulo','BR'),
  (3451190,'postcard-city-3451190','Rio de Janeiro','BR'),
  (3470127,'postcard-city-3470127','Belo Horizonte','BR'),
  (3450554,'postcard-city-3450554','Salvador','BR'),
  (3399415,'postcard-city-3399415','Fortaleza','BR')
on conflict(geoname_id) do update set
  postcard_catalog_key=excluded.postcard_catalog_key,
  city_name=excluded.city_name,
  country_code=excluded.country_code,
  active=true;

-- Reconcile trustworthy completed routes that predate this catalog batch.
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
  and catalog.geoname_id in (3448439,3451190,3470127,3450554,3399415)
  and catalog.active
on conflict(profile_id,postcard_catalog_key) do nothing;

-- A capital already chosen as a completed home nest grants the new card too.
do $$
declare selected_profile record;
begin
  for selected_profile in
    select profile.id
    from public.profiles profile
    join public.account_onboarding onboarding
      on onboarding.auth_user_id=profile.auth_user_id
     and onboarding.stage='completed'
    where profile.home_city_geoname_id in (3448439,3451190,3470127,3450554,3399415)
  loop
    perform public.grant_home_origin_collectibles(selected_profile.id,now());
  end loop;
end
$$;
