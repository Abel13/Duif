-- The common currency is Seeds. Postal stamps remain collectible and finishing items.
insert into public.official_assets (asset_key, asset_type)
values ('currency.icon.seed', 'currencyIcon')
on conflict (asset_key) do nothing;

update public.official_asset_versions as version
set status = 'archived'
from public.official_assets as asset
where version.asset_id = asset.id
  and asset.asset_key = 'currency.icon.stamp'
  and version.status = 'active';

insert into public.official_asset_versions (
  asset_id, version, source, status, packaged_path, mime_type, width, height,
  byte_size, alt_text_key, is_decorative, author, metadata
)
select
  asset.id, 1, 'packaged', 'active', '/assets/currency/seed.svg', 'image/svg+xml',
  64, 64, 727, null, true, 'DUIF', jsonb_build_object('kind', 'currencyIcon')
from public.official_assets as asset
where asset.asset_key = 'currency.icon.seed'
  and not exists (
    select 1 from public.official_asset_versions as version
    where version.asset_id = asset.id and version.version = 1
  );
