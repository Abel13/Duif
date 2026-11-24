insert into public.official_translation_keys(translation_key)
values ('shop.announcements.yearEnd.alt')
on conflict do nothing;

insert into public.official_assets(asset_key, asset_type)
values ('shop.announcement.yearEndPostcardPack', 'postcardArtwork')
on conflict(asset_key) do nothing;

insert into public.official_asset_versions(
  asset_id, version, source, status, packaged_path, mime_type, width, height, byte_size,
  alt_text_key, is_decorative, author, metadata
)
select asset.id, 1, 'packaged', 'active', '/assets/shop/seasonal-postcard-pack-announcement.webp', 'image/webp', 960, 640, 58730,
  'shop.announcements.yearEnd.alt', false, 'DUIF · OpenAI ImageGen',
  jsonb_build_object('kind', 'postcardArtwork', 'surface', 'shopAnnouncement', 'season', 'yearEnd', 'provenance', jsonb_build_object('tool', 'OpenAI ImageGen', 'origin', 'AI-assisted original illustration'))
from public.official_assets asset
where asset.asset_key = 'shop.announcement.yearEndPostcardPack'
  and not exists(select 1 from public.official_asset_versions version_row where version_row.asset_id = asset.id and version_row.version = 1);
