begin;

do $$
declare
  invalid_count integer;
begin
  select count(*) into invalid_count
  from public.official_assets asset
  join public.official_asset_versions version on version.asset_id=asset.id
  where version.status='active'
    and asset.asset_key in ('currency.icon.seed','currency.icon.crystal');
  if invalid_count <> 0 then
    raise exception 'Retired currency SVGs must not remain active';
  end if;

  select count(*) into invalid_count
  from public.official_assets asset
  join public.official_asset_versions version on version.asset_id=asset.id
  where version.status='active'
    and asset.asset_key in (
      'shop.thumbnail.sunnyRouteSticker','shop.thumbnail.lanternFestivalPostcard',
      'shop.thumbnail.coastalTownPostcard','shop.thumbnail.brassNestPlaque',
      'shop.thumbnail.blueEnvelopeSticker','shop.thumbnail.airmailProfileRibbon',
      'reward.thumbnail.wornRouteStamp','reward.thumbnail.goldenCompassPin',
      'reward.thumbnail.blueAirmailLabel',
      'mascot.portrait.aurora','mascot.portrait.maple','mascot.portrait.bento',
      'mascot.portrait.oliva','nest.artwork.availableJobs'
    )
    and (
      version.mime_type <> 'image/webp'
      or version.packaged_path is null
      or version.metadata->>'kind' <> asset.asset_type::text
    );
  if invalid_count <> 0 then
    raise exception 'Refactored assets do not match the active Registry contract';
  end if;

  select count(*) into invalid_count
  from public.official_assets asset
  join public.official_asset_versions version on version.asset_id=asset.id
  where asset.asset_key in (
    'mascot.portrait.aurora','mascot.portrait.maple',
    'mascot.portrait.bento','mascot.portrait.oliva'
  )
    and version.status='active'
    and version.packaged_path not like '/assets/mascots/portraits/%';
  if invalid_count <> 0 then
    raise exception 'Official mascot portraits must use the central portrait directory';
  end if;

  select count(*) into invalid_count
  from public.reward_items
  where catalog_key in ('reward-blue-airmail-label','reward-golden-compass-pin')
    and rarity <> 'rare';
  if invalid_count <> 0 then
    raise exception 'Rare stamp rewards lost their rarity';
  end if;

  select count(*) into invalid_count
  from public.route_reward_points point
  join public.reward_items reward on reward.id=point.reward_item_id
  where reward.catalog_key in ('reward-blue-airmail-label','reward-golden-compass-pin')
    and point.inventory_category <> 'stamps';
  if invalid_count <> 0 then
    raise exception 'Stamp rewards must enter the stamp inventory category';
  end if;

  if exists(
    select 1 from public.route_reward_points
    where catalog_key in ('route-reward-cambe-souvenir','route-reward-rolandia-badge') and status<>'archived'
  ) then
    raise exception 'Cambe and Rolandia route rewards must remain retired';
  end if;
  if exists(
    select 1 from public.reward_items
    where catalog_key in ('reward-cambe-souvenir','reward-rolandia-badge') and status<>'archived'
  ) then
    raise exception 'Cambe and Rolandia catalog items must remain archived';
  end if;
  if exists(
    select 1 from public.inventory_items inventory
    join public.reward_items reward on reward.id=inventory.reward_item_id
    where reward.catalog_key in ('reward-cambe-souvenir','reward-rolandia-badge')
  ) then
    raise exception 'Retired city rewards must be removed from every inventory';
  end if;
  if exists(
    select 1 from public.official_asset_versions version
    join public.official_assets asset on asset.id=version.asset_id
    where asset.asset_key='reward.thumbnail.atlanticBadge' and version.status='active'
  ) then
    raise exception 'Retired Atlantic badge asset must not remain active';
  end if;
end
$$;

rollback;
