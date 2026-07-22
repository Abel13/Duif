insert into public.official_translation_keys(translation_key)
values ('nestHub.defaultAvatar')
on conflict (translation_key) do nothing;

insert into public.official_assets(asset_key, asset_type)
values ('profile.avatar.defaultSilhouette', 'nestArtwork')
on conflict (asset_key) do nothing;

insert into public.official_asset_versions(
  asset_id, version, source, status, packaged_path, mime_type, width, height, byte_size,
  alt_text_key, is_decorative, author, metadata
)
select asset.id, 1, 'packaged', 'active', '/assets/profile/default-silhouette.webp',
  'image/webp', 256, 256, 6546, 'nestHub.defaultAvatar', false, 'DUIF',
  jsonb_build_object('kind', 'nestArtwork')
from public.official_assets asset
where asset.asset_key = 'profile.avatar.defaultSilhouette'
  and not exists (
    select 1 from public.official_asset_versions version
    where version.asset_id = asset.id and version.version = 1
  );
