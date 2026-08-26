-- Cities do not grant generic souvenirs or badges. Preserve discovery history while
-- retiring the catalogs and removing every previously granted inventory copy.

update public.route_reward_points
set status='archived'
where catalog_key in ('route-reward-cambe-souvenir','route-reward-rolandia-badge');

update public.reward_items
set status='archived'
where catalog_key in ('reward-cambe-souvenir','reward-rolandia-badge');

update public.delivery_route_discoveries discovery
set inventory_item_id=null
from public.inventory_items inventory
join public.reward_items reward on reward.id=inventory.reward_item_id
where discovery.inventory_item_id=inventory.id
  and reward.catalog_key in ('reward-cambe-souvenir','reward-rolandia-badge');

delete from public.inventory_items inventory
using public.reward_items reward
where reward.id=inventory.reward_item_id
  and reward.catalog_key in ('reward-cambe-souvenir','reward-rolandia-badge');

update public.official_asset_versions version
set status='archived'
from public.official_assets asset
where asset.id=version.asset_id
  and asset.asset_key='reward.thumbnail.atlanticBadge'
  and version.status='active';
