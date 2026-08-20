-- Publish the clearer faceted Crystal currency icon without mutating its original version.
update public.official_asset_versions as version
set status = 'archived'
from public.official_assets as asset
where version.asset_id = asset.id
  and asset.asset_key = 'currency.icon.crystal'
  and version.status = 'active';

insert into public.official_asset_versions (
  asset_id, version, source, status, packaged_path, mime_type, width, height,
  byte_size, alt_text_key, is_decorative, author, metadata
)
select
  asset.id, 2, 'packaged', 'active', '/assets/currency/crystal.svg', 'image/svg+xml',
  64, 64, 818, null, true, 'DUIF', jsonb_build_object('kind', 'currencyIcon')
from public.official_assets as asset
where asset.asset_key = 'currency.icon.crystal';
