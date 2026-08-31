-- Publish landmark-led postcard replacements at the canonical packaged paths without
-- rewriting the asset versions already applied by previous migrations.

update public.official_asset_versions as version
set status = 'archived'
from public.official_assets as asset
where version.asset_id = asset.id
  and version.status = 'active'
  and version.version <> 2
  and asset.asset_key in (
    'postcard.city.3470127.front',
    'postcard.city.3664980.front',
    'postcard.city.3463237.front',
    'postcard.city.3462377.front',
    'postcard.city.3474574.front',
    'postcard.city.3662762.front',
    'postcard.city.3662574.front',
    'postcard.city.3448439.front',
    'postcard.city.3444924.front',
    'postcard.city.3399415.front',
    'postcard.city.3458449.front',
    'postcard.city.3395981.front',
    'postcard.city.3457952.front',
    'postcard.city.3394023.front',
    'postcard.city.3456166.front',
    'postcard.city.3452925.front'
  );

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select asset.id,2,'packaged','active',entry.path,'image/webp',1200,800,entry.bytes,
  entry.alt_key,false,'DUIF',jsonb_build_object(
    'kind','postcardArtwork',
    'cityGeonameId',entry.geoname_id,
    'artDirection','postalWatercolorLandmark',
    'landmark',entry.landmark,
    'replacesPackagedArtwork',true
  )
from (values
  ('postcard.city.3470127.front','/assets/postcards/cities/belo-horizonte.webp',129218,'officialPostcards.cities.beloHorizonte.alt',3470127::bigint,'Igreja São Francisco de Assis da Pampulha'),
  ('postcard.city.3664980.front','/assets/postcards/cities/boa-vista.webp',160346,'officialPostcards.cities.boaVista.alt',3664980::bigint,'Orla Taumanan'),
  ('postcard.city.3463237.front','/assets/postcards/cities/florianopolis.webp',152416,'officialPostcards.cities.florianopolis.alt',3463237::bigint,'Ponte Hercílio Luz'),
  ('postcard.city.3462377.front','/assets/postcards/cities/goiania.webp',127430,'officialPostcards.cities.goiania.alt',3462377::bigint,'Monumento às Três Raças'),
  ('postcard.city.3474574.front','/assets/postcards/cities/palmas.webp',128648,'officialPostcards.cities.palmas.alt',3474574::bigint,'Praça dos Girassóis e Palácio Araguaia'),
  ('postcard.city.3662762.front','/assets/postcards/cities/porto-velho.webp',159422,'officialPostcards.cities.portoVelho.alt',3662762::bigint,'Três Caixas d''Água'),
  ('postcard.city.3662574.front','/assets/postcards/cities/rio-branco.webp',146024,'officialPostcards.cities.rioBranco.alt',3662574::bigint,'Palácio Rio Branco'),
  ('postcard.city.3448439.front','/assets/postcards/cities/sao-paulo.webp',143468,'officialPostcards.cities.saoPaulo.alt',3448439::bigint,'Estação da Luz'),
  ('postcard.city.3444924.front','/assets/postcards/cities/vitoria.webp',148726,'officialPostcards.cities.vitoria.alt',3444924::bigint,'Terceira Ponte'),
  ('postcard.city.3399415.front','/assets/postcards/cities/fortaleza.webp',145068,'officialPostcards.cities.fortaleza.alt',3399415::bigint,'Ponte dos Ingleses'),
  ('postcard.city.3458449.front','/assets/postcards/cities/londrina.webp',136238,'officialPostcards.cities.londrina.alt',3458449::bigint,'Catedral Metropolitana de Londrina'),
  ('postcard.city.3395981.front','/assets/postcards/cities/maceio.webp',114360,'officialPostcards.cities.maceio.alt',3395981::bigint,'Farol da Ponta Verde'),
  ('postcard.city.3457952.front','/assets/postcards/cities/manhuacu.webp',136172,'officialPostcards.cities.manhuacu.alt',3457952::bigint,'Igreja Matriz de São Lourenço'),
  ('postcard.city.3394023.front','/assets/postcards/cities/natal.webp',140632,'officialPostcards.cities.natal.alt',3394023::bigint,'Forte dos Reis Magos'),
  ('postcard.city.3456166.front','/assets/postcards/cities/nova-friburgo.webp',160080,'officialPostcards.cities.novaFriburgo.alt',3456166::bigint,'Praça do Suspiro'),
  ('postcard.city.3452925.front','/assets/postcards/cities/porto-alegre.webp',95908,'officialPostcards.cities.portoAlegre.alt',3452925::bigint,'Usina do Gasômetro')
) entry(asset_key,path,bytes,alt_key,geoname_id,landmark)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions version
  where version.asset_id=asset.id and version.version=2
);
