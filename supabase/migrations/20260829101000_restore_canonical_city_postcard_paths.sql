-- Keep the corrective asset history while restoring the canonical packaged paths.
-- The files at these paths now contain the redesigned landmark-led artwork.

update public.official_asset_versions as version
set status = 'archived'
from public.official_assets as asset
where version.asset_id = asset.id
  and version.status = 'active'
  and version.version <> 3
  and asset.asset_key in (
    'postcard.city.3386496.front',
    'postcard.city.3471872.front',
    'postcard.city.3467747.front',
    'postcard.city.3465038.front',
    'postcard.city.3464975.front',
    'postcard.city.3397277.front',
    'postcard.city.3396016.front'
  );

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select asset.id,3,'packaged','active',entry.path,'image/webp',1200,800,entry.bytes,
  entry.alt_key,false,'DUIF',jsonb_build_object(
    'kind','postcardArtwork',
    'cityGeonameId',entry.geoname_id,
    'artDirection','postalWatercolorLandmark',
    'landmark',entry.landmark,
    'replacesPackagedArtwork',true
  )
from (values
  ('postcard.city.3386496.front','/assets/postcards/cities/teresina.webp',153896,'officialPostcards.cities.teresina.alt',3386496::bigint,'Ponte Estaiada João Isidoro França'),
  ('postcard.city.3471872.front','/assets/postcards/cities/aracaju.webp',126422,'officialPostcards.cities.aracaju.alt',3471872::bigint,'Arcos da Orla de Atalaia'),
  ('postcard.city.3467747.front','/assets/postcards/cities/campo-grande.webp',174022,'officialPostcards.cities.campoGrande.alt',3467747::bigint,'Bioparque Pantanal'),
  ('postcard.city.3465038.front','/assets/postcards/cities/cuiaba.webp',122504,'officialPostcards.cities.cuiaba.alt',3465038::bigint,'Igreja de Nossa Senhora do Bom Despacho'),
  ('postcard.city.3464975.front','/assets/postcards/cities/curitiba.webp',157668,'officialPostcards.cities.curitiba.alt',3464975::bigint,'Jardim Botânico de Curitiba'),
  ('postcard.city.3397277.front','/assets/postcards/cities/joao-pessoa.webp',105796,'officialPostcards.cities.joaoPessoa.alt',3397277::bigint,'Farol do Cabo Branco'),
  ('postcard.city.3396016.front','/assets/postcards/cities/macapa.webp',159222,'officialPostcards.cities.macapa.alt',3396016::bigint,'Fortaleza de São José de Macapá')
) entry(asset_key,path,bytes,alt_key,geoname_id,landmark)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions version
  where version.asset_id=asset.id and version.version=3
);
