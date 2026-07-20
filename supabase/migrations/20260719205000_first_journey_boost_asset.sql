insert into public.official_translation_keys (translation_key)
values ('tutorial.boost.badge')
on conflict (translation_key) do nothing;

insert into public.official_assets (asset_key, asset_type)
values ('activeItem.firstJourneyBoost', 'equipmentIcon')
on conflict (asset_key) do nothing;

insert into public.official_asset_versions (
  asset_id, version, source, status, packaged_path, mime_type, width, height,
  byte_size, alt_text_key, is_decorative, author, metadata
)
select
  asset.id, 1, 'packaged', 'active',
  '/assets/items/active/first-journey-boost.webp', 'image/webp', 192, 192,
  9360, 'tutorial.boost.badge', false, 'OpenAI image generation',
  jsonb_build_object('kind', 'equipmentIcon')
from public.official_assets asset
where asset.asset_key = 'activeItem.firstJourneyBoost'
on conflict (asset_id, version) do nothing;
