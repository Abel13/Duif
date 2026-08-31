with entries(asset_key, packaged_path, byte_size) as (
  values
    ('texture.mapAtmosphere.season.summer', '/assets/maps/atmosphere/summer.webp', 44656),
    ('texture.mapAtmosphere.season.autumn', '/assets/maps/atmosphere/autumn.webp', 39494),
    ('texture.mapAtmosphere.season.winter', '/assets/maps/atmosphere/winter.webp', 36984),
    ('texture.mapAtmosphere.season.spring', '/assets/maps/atmosphere/spring.webp', 35000),
    ('texture.mapAtmosphere.weather.drizzle', '/assets/maps/atmosphere/drizzle.webp', 34740),
    ('texture.mapAtmosphere.weather.rain', '/assets/maps/atmosphere/rain.webp', 41152),
    ('texture.mapAtmosphere.weather.snowIce', '/assets/maps/atmosphere/snow-ice.webp', 46634),
    ('texture.mapAtmosphere.weather.storm', '/assets/maps/atmosphere/storm.webp', 22848)
)
insert into public.official_asset_versions(
  asset_id, version, source, status, packaged_path, mime_type, width, height, byte_size,
  alt_text_key, is_decorative, author, metadata
)
select
  asset.id,
  coalesce((select max(existing.version) + 1 from public.official_asset_versions existing where existing.asset_id = asset.id), 1),
  'packaged',
  'active',
  entry.packaged_path,
  'image/webp',
  512,
  512,
  entry.byte_size,
  null,
  true,
  'DUIF · IA assistida (GPT Image)',
  jsonb_build_object(
    'kind', 'texture',
    'format', 'mapAtmosphere',
    'origin', 'Generated with IA assistance; final approval required from the project owner.'
  )
from entries entry
join public.official_assets asset on asset.asset_key = entry.asset_key
where not exists (
  select 1 from public.official_asset_versions version
  where version.asset_id = asset.id and version.status = 'active'
);
