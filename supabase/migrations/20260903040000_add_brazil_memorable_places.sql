insert into public.official_translation_keys(translation_key) values
  ('landmarks.teatroAmazonas.name'),('landmarks.teatroAmazonas.description'),('landmarks.teatroAmazonas.alt'),
  ('officialPostcards.teatroAmazonas.name'),('officialPostcards.teatroAmazonas.description'),('officialPostcards.teatroAmazonas.alt'),
  ('landmarks.elevadorLacerda.name'),('landmarks.elevadorLacerda.description'),('landmarks.elevadorLacerda.alt'),
  ('officialPostcards.elevadorLacerda.name'),('officialPostcards.elevadorLacerda.description'),('officialPostcards.elevadorLacerda.alt'),
  ('landmarks.congressoNacional.name'),('landmarks.congressoNacional.description'),('landmarks.congressoNacional.alt'),
  ('officialPostcards.congressoNacional.name'),('officialPostcards.congressoNacional.description'),('officialPostcards.congressoNacional.alt'),
  ('landmarks.jardimBotanicoCuritiba.name'),('landmarks.jardimBotanicoCuritiba.description'),('landmarks.jardimBotanicoCuritiba.alt'),
  ('officialPostcards.jardimBotanicoCuritiba.name'),('officialPostcards.jardimBotanicoCuritiba.description'),('officialPostcards.jardimBotanicoCuritiba.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type) values
  ('landmark.teatroAmazonas.artwork','landmarkArtwork'),
  ('postcard.landmark.teatroAmazonas.front','postcardArtwork'),
  ('landmark.elevadorLacerda.artwork','landmarkArtwork'),
  ('postcard.landmark.elevadorLacerda.front','postcardArtwork'),
  ('landmark.congressoNacional.artwork','landmarkArtwork'),
  ('postcard.landmark.congressoNacional.front','postcardArtwork'),
  ('landmark.jardimBotanicoCuritiba.artwork','landmarkArtwork'),
  ('postcard.landmark.jardimBotanicoCuritiba.front','postcardArtwork')
on conflict do nothing;

insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select a.id,1,'packaged','active',v.path,'image/webp',v.w,v.h,v.bytes,v.alt,false,'DUIF · OpenAI ImageGen',
  jsonb_build_object('kind',v.kind,'catalogKey',v.catalog,'provenance',jsonb_build_object('tool','OpenAI ImageGen','origin','AI-assisted original illustration'))
from (values
  ('landmark.teatroAmazonas.artwork','/assets/landmarks/teatro-amazonas.webp',256,256,15752,'landmarks.teatroAmazonas.alt','landmarkArtwork','landmark.teatro-amazonas'),
  ('postcard.landmark.teatroAmazonas.front','/assets/postcards/landmarks/teatro-amazonas.webp',1200,800,167356,'officialPostcards.teatroAmazonas.alt','postcardArtwork','landmark.teatro-amazonas'),
  ('landmark.elevadorLacerda.artwork','/assets/landmarks/elevador-lacerda.webp',256,256,11190,'landmarks.elevadorLacerda.alt','landmarkArtwork','landmark.elevador-lacerda'),
  ('postcard.landmark.elevadorLacerda.front','/assets/postcards/landmarks/elevador-lacerda.webp',1200,800,152218,'officialPostcards.elevadorLacerda.alt','postcardArtwork','landmark.elevador-lacerda'),
  ('landmark.congressoNacional.artwork','/assets/landmarks/congresso-nacional.webp',256,256,10006,'landmarks.congressoNacional.alt','landmarkArtwork','landmark.congresso-nacional'),
  ('postcard.landmark.congressoNacional.front','/assets/postcards/landmarks/congresso-nacional.webp',1200,800,142684,'officialPostcards.congressoNacional.alt','postcardArtwork','landmark.congresso-nacional'),
  ('landmark.jardimBotanicoCuritiba.artwork','/assets/landmarks/jardim-botanico-curitiba.webp',256,256,16386,'landmarks.jardimBotanicoCuritiba.alt','landmarkArtwork','landmark.jardim-botanico-curitiba'),
  ('postcard.landmark.jardimBotanicoCuritiba.front','/assets/postcards/landmarks/jardim-botanico-curitiba.webp',1200,800,166502,'officialPostcards.jardimBotanicoCuritiba.alt','postcardArtwork','landmark.jardim-botanico-curitiba')
) v(key,path,w,h,bytes,alt,kind,catalog)
join public.official_assets a on a.asset_key=v.key
where not exists(select 1 from public.official_asset_versions e where e.asset_id=a.id);

insert into public.official_postcards(catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order) values
  ('postcard-landmark-teatro-amazonas','officialPostcards.teatroAmazonas.name','officialPostcards.teatroAmazonas.description','postcard.landmark.teatroAmazonas.front','city','active',70),
  ('postcard-landmark-elevador-lacerda','officialPostcards.elevadorLacerda.name','officialPostcards.elevadorLacerda.description','postcard.landmark.elevadorLacerda.front','city','active',71),
  ('postcard-landmark-congresso-nacional','officialPostcards.congressoNacional.name','officialPostcards.congressoNacional.description','postcard.landmark.congressoNacional.front','city','active',72),
  ('postcard-landmark-jardim-botanico-curitiba','officialPostcards.jardimBotanicoCuritiba.name','officialPostcards.jardimBotanicoCuritiba.description','postcard.landmark.jardimBotanicoCuritiba.front','city','active',73)
on conflict do nothing;

insert into public.world_landmark_catalog(catalog_key,rules_version,name_key,description_key,asset_key,latitude,longitude,eligibility_radius_km,category,city,region,country_code,minimum_zoom,icon_size_px,active,sort_order,postcard_catalog_key) values
  ('landmark.teatro-amazonas',1,'landmarks.teatroAmazonas.name','landmarks.teatroAmazonas.description','landmark.teatroAmazonas.artwork',-3.13028,-60.02333,25,'cultural','Manaus','Amazonas','BR',8,56,true,51,'postcard-landmark-teatro-amazonas'),
  ('landmark.elevador-lacerda',1,'landmarks.elevadorLacerda.name','landmarks.elevadorLacerda.description','landmark.elevadorLacerda.artwork',-12.97417,-38.51333,25,'architectural','Salvador','Bahia','BR',8,56,true,52,'postcard-landmark-elevador-lacerda'),
  ('landmark.congresso-nacional',1,'landmarks.congressoNacional.name','landmarks.congressoNacional.description','landmark.congressoNacional.artwork',-15.79972,-47.86417,25,'architectural','Brasília','Distrito Federal','BR',8,56,true,53,'postcard-landmark-congresso-nacional'),
  ('landmark.jardim-botanico-curitiba',1,'landmarks.jardimBotanicoCuritiba.name','landmarks.jardimBotanicoCuritiba.description','landmark.jardimBotanicoCuritiba.artwork',-25.44278,-49.23944,25,'architectural','Curitiba','Paraná','BR',8,56,true,54,'postcard-landmark-jardim-botanico-curitiba')
on conflict do nothing;
