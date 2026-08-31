with entries(asset_key, packaged_path, byte_size) as (
  values
    ('texture.mapWeatherParticle.season.summerMote', '/assets/maps/weather-particles/summer-mote.webp', 9788),
    ('texture.mapWeatherParticle.season.autumnLeaf', '/assets/maps/weather-particles/autumn-leaf.webp', 7058),
    ('texture.mapWeatherParticle.season.winterCrystal', '/assets/maps/weather-particles/winter-crystal.webp', 15504),
    ('texture.mapWeatherParticle.season.springPetal', '/assets/maps/weather-particles/spring-petal.webp', 7594),
    ('texture.mapWeatherParticle.weather.drizzleDrop', '/assets/maps/weather-particles/drizzle-drop.webp', 3186),
    ('texture.mapWeatherParticle.weather.fogWisp', '/assets/maps/weather-particles/fog-wisp.webp', 6838),
    ('texture.mapWeatherParticle.weather.rainStreak', '/assets/maps/weather-particles/rain-streak.webp', 4798),
    ('texture.mapWeatherParticle.weather.snowflake', '/assets/maps/weather-particles/snowflake.webp', 14880),
    ('texture.mapWeatherParticle.weather.icePellet', '/assets/maps/weather-particles/ice-pellet.webp', 7730),
    ('texture.mapWeatherParticle.weather.stormCloud', '/assets/maps/weather-particles/storm-cloud.webp', 8286)
)
insert into public.official_assets(asset_key, asset_type)
select asset_key, 'texture'::public.official_asset_type from entries
on conflict (asset_key) do nothing;

with entries(asset_key, packaged_path, byte_size) as (
  values
    ('texture.mapWeatherParticle.season.summerMote', '/assets/maps/weather-particles/summer-mote.webp', 9788),
    ('texture.mapWeatherParticle.season.autumnLeaf', '/assets/maps/weather-particles/autumn-leaf.webp', 7058),
    ('texture.mapWeatherParticle.season.winterCrystal', '/assets/maps/weather-particles/winter-crystal.webp', 15504),
    ('texture.mapWeatherParticle.season.springPetal', '/assets/maps/weather-particles/spring-petal.webp', 7594),
    ('texture.mapWeatherParticle.weather.drizzleDrop', '/assets/maps/weather-particles/drizzle-drop.webp', 3186),
    ('texture.mapWeatherParticle.weather.fogWisp', '/assets/maps/weather-particles/fog-wisp.webp', 6838),
    ('texture.mapWeatherParticle.weather.rainStreak', '/assets/maps/weather-particles/rain-streak.webp', 4798),
    ('texture.mapWeatherParticle.weather.snowflake', '/assets/maps/weather-particles/snowflake.webp', 14880),
    ('texture.mapWeatherParticle.weather.icePellet', '/assets/maps/weather-particles/ice-pellet.webp', 7730),
    ('texture.mapWeatherParticle.weather.stormCloud', '/assets/maps/weather-particles/storm-cloud.webp', 8286)
)
insert into public.official_asset_versions(
  asset_id, version, source, status, packaged_path, mime_type, width, height, byte_size,
  alt_text_key, is_decorative, author, metadata
)
select
  asset.id,
  coalesce((select max(existing.version) + 1 from public.official_asset_versions existing where existing.asset_id = asset.id), 1),
  'packaged', 'active', entry.packaged_path, 'image/webp', 256, 256, entry.byte_size,
  null, true, 'DUIF · IA assistida (GPT Image)',
  jsonb_build_object(
    'kind', 'texture',
    'format', 'mapWeatherParticle',
    'origin', 'Generated with IA assistance; final approval required from the project owner.'
  )
from entries entry
join public.official_assets asset on asset.asset_key = entry.asset_key
where not exists (
  select 1 from public.official_asset_versions version
  where version.asset_id = asset.id and version.status = 'active'
);
