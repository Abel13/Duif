-- Publish the approved Salar de Uyuni memorable-place pair.

insert into public.official_translation_keys(translation_key) values
  ('landmarks.salarDeUyuni.name'),
  ('landmarks.salarDeUyuni.description'),
  ('landmarks.salarDeUyuni.alt'),
  ('officialPostcards.salarDeUyuni.name'),
  ('officialPostcards.salarDeUyuni.description'),
  ('officialPostcards.salarDeUyuni.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('landmark.salarDeUyuni.artwork','landmarkArtwork'),
  ('postcard.landmark.salarDeUyuni.front','postcardArtwork')
on conflict(asset_key) do nothing;

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select asset.id,1,'packaged','active',entry.path,'image/webp',entry.width,entry.height,
  entry.bytes,entry.alt_key,false,'DUIF · OpenAI ImageGen',entry.metadata
from (values
  ('landmark.salarDeUyuni.artwork','/assets/landmarks/salar-de-uyuni.webp',256,256,17724,
    'landmarks.salarDeUyuni.alt',jsonb_build_object(
      'kind','landmarkArtwork','catalogKey','landmark.salar-de-uyuni',
      'artDirection','postalWatercolorSticker','provenance',jsonb_build_object(
        'tool','OpenAI ImageGen','origin','AI-assisted original illustration',
        'referencePolicy','editorial description and compatible open or licensed factual sources only'))),
  ('postcard.landmark.salarDeUyuni.front','/assets/postcards/landmarks/salar-de-uyuni.webp',1200,800,97748,
    'officialPostcards.salarDeUyuni.alt',jsonb_build_object(
      'kind','postcardArtwork','landmarkCatalogKey','landmark.salar-de-uyuni',
      'provenance',jsonb_build_object(
        'tool','OpenAI ImageGen','origin','AI-assisted original illustration',
        'referencePolicy','editorial description and compatible open or licensed factual sources only')))
) entry(asset_key,path,width,height,bytes,alt_key,metadata)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(
  select 1 from public.official_asset_versions existing
  where existing.asset_id=asset.id and existing.version=1
);

insert into public.official_postcards(
  catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order
) values (
  'postcard-landmark-salar-de-uyuni','officialPostcards.salarDeUyuni.name',
  'officialPostcards.salarDeUyuni.description','postcard.landmark.salarDeUyuni.front','city','active',24
)
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
) values (
  'landmark.salar-de-uyuni',1,'landmarks.salarDeUyuni.name',
  'landmarks.salarDeUyuni.description','landmark.salarDeUyuni.artwork',
  -20.13378,-67.48913,25,'natural','Salar de Uyuni','Potosí','BO',8,56,true,5,
  'postcard-landmark-salar-de-uyuni'
)
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
