-- Publish the approved Angel Falls memorable-place pair.

insert into public.official_translation_keys(translation_key) values
  ('landmarks.angelFalls.name'),('landmarks.angelFalls.description'),('landmarks.angelFalls.alt'),
  ('officialPostcards.angelFalls.name'),('officialPostcards.angelFalls.description'),('officialPostcards.angelFalls.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('landmark.angelFalls.artwork','landmarkArtwork'),('postcard.landmark.angelFalls.front','postcardArtwork')
on conflict(asset_key) do nothing;

insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select asset.id,1,'packaged','active',entry.path,'image/webp',entry.width,entry.height,entry.bytes,entry.alt_key,false,'DUIF · OpenAI ImageGen',entry.metadata
from (values
  ('landmark.angelFalls.artwork','/assets/landmarks/angel-falls.webp',256,256,19172,'landmarks.angelFalls.alt',jsonb_build_object('kind','landmarkArtwork','catalogKey','landmark.angel-falls','artDirection','postalWatercolorSticker','provenance',jsonb_build_object('tool','OpenAI ImageGen','origin','AI-assisted original illustration','referencePolicy','editorial description and compatible open or licensed factual sources only'))),
  ('postcard.landmark.angelFalls.front','/assets/postcards/landmarks/angel-falls.webp',1200,800,180886,'officialPostcards.angelFalls.alt',jsonb_build_object('kind','postcardArtwork','landmarkCatalogKey','landmark.angel-falls','provenance',jsonb_build_object('tool','OpenAI ImageGen','origin','AI-assisted original illustration','referencePolicy','editorial description and compatible open or licensed factual sources only')))
) entry(asset_key,path,width,height,bytes,alt_key,metadata)
join public.official_assets asset on asset.asset_key=entry.asset_key
where not exists(select 1 from public.official_asset_versions existing where existing.asset_id=asset.id and existing.version=1);

insert into public.official_postcards(catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order) values
  ('postcard-landmark-angel-falls','officialPostcards.angelFalls.name','officialPostcards.angelFalls.description','postcard.landmark.angelFalls.front','city','active',27)
on conflict(catalog_key) do update set name_key=excluded.name_key,description_key=excluded.description_key,artwork_asset_key=excluded.artwork_asset_key,availability=excluded.availability,status=excluded.status,sort_order=excluded.sort_order;

insert into public.world_landmark_catalog(catalog_key,rules_version,name_key,description_key,asset_key,latitude,longitude,eligibility_radius_km,category,city,region,country_code,minimum_zoom,icon_size_px,active,sort_order,postcard_catalog_key) values
  ('landmark.angel-falls',1,'landmarks.angelFalls.name','landmarks.angelFalls.description','landmark.angelFalls.artwork',5.96749,-62.53511,25,'natural','Salto Ángel','Bolívar','VE',8,56,true,8,'postcard-landmark-angel-falls')
on conflict(catalog_key) do update set rules_version=excluded.rules_version,name_key=excluded.name_key,description_key=excluded.description_key,asset_key=excluded.asset_key,latitude=excluded.latitude,longitude=excluded.longitude,eligibility_radius_km=excluded.eligibility_radius_km,category=excluded.category,city=excluded.city,region=excluded.region,country_code=excluded.country_code,minimum_zoom=excluded.minimum_zoom,icon_size_px=excluded.icon_size_px,active=excluded.active,sort_order=excluded.sort_order,postcard_catalog_key=excluded.postcard_catalog_key;
