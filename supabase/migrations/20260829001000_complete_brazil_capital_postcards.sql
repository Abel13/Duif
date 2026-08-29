-- Complete the reviewed postcard catalog for all Brazilian capitals. Unlocks
-- remain tied to canonical GeoNames identities and are idempotently reconciled.

insert into public.official_translation_keys(translation_key)
select format('officialPostcards.cities.%s.%s',city.slug,suffix.value)
from (values
  ('belem'),('portoAlegre'),('maceio'),('saoLuis'),('campoGrande'),('natal'),
  ('teresina'),('joaoPessoa'),('aracaju'),('cuiaba'),('portoVelho'),('macapa'),
  ('florianopolis'),('boaVista'),('rioBranco'),('vitoria'),('palmas')
) city(slug)
cross join (values ('name'),('description'),('alt')) suffix(value)
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('postcard.city.3405870.front','postcardArtwork'),
  ('postcard.city.3452925.front','postcardArtwork'),
  ('postcard.city.3395981.front','postcardArtwork'),
  ('postcard.city.3388368.front','postcardArtwork'),
  ('postcard.city.3467747.front','postcardArtwork'),
  ('postcard.city.3394023.front','postcardArtwork'),
  ('postcard.city.3386496.front','postcardArtwork'),
  ('postcard.city.3397277.front','postcardArtwork'),
  ('postcard.city.3471872.front','postcardArtwork'),
  ('postcard.city.3465038.front','postcardArtwork'),
  ('postcard.city.3662762.front','postcardArtwork'),
  ('postcard.city.3396016.front','postcardArtwork'),
  ('postcard.city.3463237.front','postcardArtwork'),
  ('postcard.city.3664980.front','postcardArtwork'),
  ('postcard.city.3662574.front','postcardArtwork'),
  ('postcard.city.3444924.front','postcardArtwork'),
  ('postcard.city.3474574.front','postcardArtwork')
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
  ('postcard.city.3405870.front','/assets/postcards/cities/belem.webp',181592,'officialPostcards.cities.belem.alt',3405870::bigint),
  ('postcard.city.3452925.front','/assets/postcards/cities/porto-alegre.webp',129584,'officialPostcards.cities.portoAlegre.alt',3452925::bigint),
  ('postcard.city.3395981.front','/assets/postcards/cities/maceio.webp',159870,'officialPostcards.cities.maceio.alt',3395981::bigint),
  ('postcard.city.3388368.front','/assets/postcards/cities/sao-luis.webp',168666,'officialPostcards.cities.saoLuis.alt',3388368::bigint),
  ('postcard.city.3467747.front','/assets/postcards/cities/campo-grande.webp',152126,'officialPostcards.cities.campoGrande.alt',3467747::bigint),
  ('postcard.city.3394023.front','/assets/postcards/cities/natal.webp',136538,'officialPostcards.cities.natal.alt',3394023::bigint),
  ('postcard.city.3386496.front','/assets/postcards/cities/teresina.webp',163864,'officialPostcards.cities.teresina.alt',3386496::bigint),
  ('postcard.city.3397277.front','/assets/postcards/cities/joao-pessoa.webp',152050,'officialPostcards.cities.joaoPessoa.alt',3397277::bigint),
  ('postcard.city.3471872.front','/assets/postcards/cities/aracaju.webp',145634,'officialPostcards.cities.aracaju.alt',3471872::bigint),
  ('postcard.city.3465038.front','/assets/postcards/cities/cuiaba.webp',163898,'officialPostcards.cities.cuiaba.alt',3465038::bigint),
  ('postcard.city.3662762.front','/assets/postcards/cities/porto-velho.webp',126622,'officialPostcards.cities.portoVelho.alt',3662762::bigint),
  ('postcard.city.3396016.front','/assets/postcards/cities/macapa.webp',120978,'officialPostcards.cities.macapa.alt',3396016::bigint),
  ('postcard.city.3463237.front','/assets/postcards/cities/florianopolis.webp',142422,'officialPostcards.cities.florianopolis.alt',3463237::bigint),
  ('postcard.city.3664980.front','/assets/postcards/cities/boa-vista.webp',182942,'officialPostcards.cities.boaVista.alt',3664980::bigint),
  ('postcard.city.3662574.front','/assets/postcards/cities/rio-branco.webp',164528,'officialPostcards.cities.rioBranco.alt',3662574::bigint),
  ('postcard.city.3444924.front','/assets/postcards/cities/vitoria.webp',136356,'officialPostcards.cities.vitoria.alt',3444924::bigint),
  ('postcard.city.3474574.front','/assets/postcards/cities/palmas.webp',182296,'officialPostcards.cities.palmas.alt',3474574::bigint)
) entry(asset_key,path,bytes,alt_key,geoname_id)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions version
  where version.asset_id=asset.id and version.version=1
);

insert into public.official_postcards(
  catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order
) values
  ('postcard-city-3405870','officialPostcards.cities.belem.name','officialPostcards.cities.belem.description','postcard.city.3405870.front','city','active',44),
  ('postcard-city-3452925','officialPostcards.cities.portoAlegre.name','officialPostcards.cities.portoAlegre.description','postcard.city.3452925.front','city','active',45),
  ('postcard-city-3395981','officialPostcards.cities.maceio.name','officialPostcards.cities.maceio.description','postcard.city.3395981.front','city','active',46),
  ('postcard-city-3388368','officialPostcards.cities.saoLuis.name','officialPostcards.cities.saoLuis.description','postcard.city.3388368.front','city','active',47),
  ('postcard-city-3467747','officialPostcards.cities.campoGrande.name','officialPostcards.cities.campoGrande.description','postcard.city.3467747.front','city','active',48),
  ('postcard-city-3394023','officialPostcards.cities.natal.name','officialPostcards.cities.natal.description','postcard.city.3394023.front','city','active',49),
  ('postcard-city-3386496','officialPostcards.cities.teresina.name','officialPostcards.cities.teresina.description','postcard.city.3386496.front','city','active',50),
  ('postcard-city-3397277','officialPostcards.cities.joaoPessoa.name','officialPostcards.cities.joaoPessoa.description','postcard.city.3397277.front','city','active',51),
  ('postcard-city-3471872','officialPostcards.cities.aracaju.name','officialPostcards.cities.aracaju.description','postcard.city.3471872.front','city','active',52),
  ('postcard-city-3465038','officialPostcards.cities.cuiaba.name','officialPostcards.cities.cuiaba.description','postcard.city.3465038.front','city','active',53),
  ('postcard-city-3662762','officialPostcards.cities.portoVelho.name','officialPostcards.cities.portoVelho.description','postcard.city.3662762.front','city','active',54),
  ('postcard-city-3396016','officialPostcards.cities.macapa.name','officialPostcards.cities.macapa.description','postcard.city.3396016.front','city','active',55),
  ('postcard-city-3463237','officialPostcards.cities.florianopolis.name','officialPostcards.cities.florianopolis.description','postcard.city.3463237.front','city','active',56),
  ('postcard-city-3664980','officialPostcards.cities.boaVista.name','officialPostcards.cities.boaVista.description','postcard.city.3664980.front','city','active',57),
  ('postcard-city-3662574','officialPostcards.cities.rioBranco.name','officialPostcards.cities.rioBranco.description','postcard.city.3662574.front','city','active',58),
  ('postcard-city-3444924','officialPostcards.cities.vitoria.name','officialPostcards.cities.vitoria.description','postcard.city.3444924.front','city','active',59),
  ('postcard-city-3474574','officialPostcards.cities.palmas.name','officialPostcards.cities.palmas.description','postcard.city.3474574.front','city','active',60)
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
  (3405870,'postcard-city-3405870','Belém','BR'),
  (3452925,'postcard-city-3452925','Porto Alegre','BR'),
  (3395981,'postcard-city-3395981','Maceió','BR'),
  (3388368,'postcard-city-3388368','São Luís','BR'),
  (3467747,'postcard-city-3467747','Campo Grande','BR'),
  (3394023,'postcard-city-3394023','Natal','BR'),
  (3386496,'postcard-city-3386496','Teresina','BR'),
  (3397277,'postcard-city-3397277','João Pessoa','BR'),
  (3471872,'postcard-city-3471872','Aracaju','BR'),
  (3465038,'postcard-city-3465038','Cuiabá','BR'),
  (3662762,'postcard-city-3662762','Porto Velho','BR'),
  (3396016,'postcard-city-3396016','Macapá','BR'),
  (3463237,'postcard-city-3463237','Florianópolis','BR'),
  (3664980,'postcard-city-3664980','Boa Vista','BR'),
  (3662574,'postcard-city-3662574','Rio Branco','BR'),
  (3444924,'postcard-city-3444924','Vitória','BR'),
  (3474574,'postcard-city-3474574','Palmas','BR')
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
  and catalog.geoname_id in (
    3405870,3452925,3395981,3388368,3467747,3394023,3386496,3397277,3471872,
    3465038,3662762,3396016,3463237,3664980,3662574,3444924,3474574
  ) and catalog.active
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
    where profile.home_city_geoname_id in (
      3405870,3452925,3395981,3388368,3467747,3394023,3386496,3397277,3471872,
      3465038,3662762,3396016,3463237,3664980,3662574,3444924,3474574
    )
  loop
    perform public.grant_home_origin_collectibles(selected_profile.id,now());
  end loop;
end
$$;
