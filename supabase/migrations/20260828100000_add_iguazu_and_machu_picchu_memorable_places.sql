-- Publish two approved memorable-place pairs for future non-tutorial journeys.

insert into public.official_translation_keys(translation_key) values
  ('landmarks.iguazuDevilsThroat.name'),
  ('landmarks.iguazuDevilsThroat.description'),
  ('landmarks.iguazuDevilsThroat.alt'),
  ('landmarks.machuPicchu.name'),
  ('landmarks.machuPicchu.description'),
  ('landmarks.machuPicchu.alt'),
  ('officialPostcards.iguazuDevilsThroat.name'),
  ('officialPostcards.iguazuDevilsThroat.description'),
  ('officialPostcards.iguazuDevilsThroat.alt'),
  ('officialPostcards.machuPicchu.name'),
  ('officialPostcards.machuPicchu.description'),
  ('officialPostcards.machuPicchu.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('landmark.iguazuDevilsThroat.artwork','landmarkArtwork'),
  ('landmark.machuPicchu.artwork','landmarkArtwork'),
  ('postcard.landmark.iguazuDevilsThroat.front','postcardArtwork'),
  ('postcard.landmark.machuPicchu.front','postcardArtwork')
on conflict(asset_key) do nothing;

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select asset.id,1,'packaged','active',entry.path,'image/webp',entry.width,entry.height,
  entry.bytes,entry.alt_key,false,'DUIF',entry.metadata
from (values
  ('landmark.iguazuDevilsThroat.artwork','/assets/landmarks/iguazu-devils-throat.webp',256,256,23510,
    'landmarks.iguazuDevilsThroat.alt',jsonb_build_object('kind','landmarkArtwork','catalogKey','landmark.iguazu-devils-throat','artDirection','postalWatercolorSticker')),
  ('landmark.machuPicchu.artwork','/assets/landmarks/machu-picchu.webp',256,256,20344,
    'landmarks.machuPicchu.alt',jsonb_build_object('kind','landmarkArtwork','catalogKey','landmark.machu-picchu','artDirection','postalWatercolorSticker')),
  ('postcard.landmark.iguazuDevilsThroat.front','/assets/postcards/landmarks/iguazu-devils-throat.webp',1200,800,173220,
    'officialPostcards.iguazuDevilsThroat.alt',jsonb_build_object('kind','postcardArtwork','landmarkCatalogKey','landmark.iguazu-devils-throat')),
  ('postcard.landmark.machuPicchu.front','/assets/postcards/landmarks/machu-picchu.webp',1200,800,183606,
    'officialPostcards.machuPicchu.alt',jsonb_build_object('kind','postcardArtwork','landmarkCatalogKey','landmark.machu-picchu'))
) entry(asset_key,path,width,height,bytes,alt_key,metadata)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions existing
  where existing.asset_id=asset.id and existing.version=1
);

insert into public.official_postcards(
  catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order
) values
  ('postcard-landmark-iguazu-devils-throat','officialPostcards.iguazuDevilsThroat.name',
    'officialPostcards.iguazuDevilsThroat.description','postcard.landmark.iguazuDevilsThroat.front','city','active',22),
  ('postcard-landmark-machu-picchu','officialPostcards.machuPicchu.name',
    'officialPostcards.machuPicchu.description','postcard.landmark.machuPicchu.front','city','active',23)
on conflict(catalog_key) do update set
  name_key=excluded.name_key,
  description_key=excluded.description_key,
  artwork_asset_key=excluded.artwork_asset_key,
  availability=excluded.availability,
  status=excluded.status,
  sort_order=excluded.sort_order;

insert into public.world_landmark_catalog(
  catalog_key,rules_version,name_key,description_key,asset_key,latitude,longitude,
  eligibility_radius_km,category,city,region,country_code,minimum_zoom,icon_size_px,
  active,sort_order,postcard_catalog_key
) values
  ('landmark.iguazu-devils-throat',1,'landmarks.iguazuDevilsThroat.name',
    'landmarks.iguazuDevilsThroat.description','landmark.iguazuDevilsThroat.artwork',
    -25.69526,-54.43667,25,'natural','Foz do Iguaçu','Paraná','BR',8,56,true,3,
    'postcard-landmark-iguazu-devils-throat'),
  ('landmark.machu-picchu',1,'landmarks.machuPicchu.name',
    'landmarks.machuPicchu.description','landmark.machuPicchu.artwork',
    -13.16314,-72.54496,25,'cultural','Machu Picchu','Cusco','PE',8,56,true,4,
    'postcard-landmark-machu-picchu')
on conflict(catalog_key) do update set
  rules_version=excluded.rules_version,
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
