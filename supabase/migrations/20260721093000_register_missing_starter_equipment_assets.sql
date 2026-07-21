-- Register packaged art and backfill only the three starter-equipment records that lacked icons.
with entries(asset_key, asset_type) as (values
  ('equipment.icon.featherCharm', 'equipmentIcon'),
  ('equipment.icon.smallSatchel', 'equipmentIcon'),
  ('equipment.icon.travelCap', 'equipmentIcon')
)
insert into public.official_assets(asset_key, asset_type)
select asset_key, asset_type::public.official_asset_type from entries
on conflict (asset_key) do nothing;

with versions(asset_key, path, byte_size, alt_text_key) as (values
  ('equipment.icon.featherCharm', '/assets/equipment/icons/feather-charm.webp', 5684, 'equipment.featherCharm.name'),
  ('equipment.icon.smallSatchel', '/assets/equipment/icons/small-satchel.webp', 8020, 'equipment.smallSatchel.name'),
  ('equipment.icon.travelCap', '/assets/equipment/icons/travel-cap.webp', 7784, 'equipment.travelCap.name')
)
insert into public.official_asset_versions(
  asset_id, version, source, status, packaged_path, mime_type, width, height, byte_size,
  alt_text_key, is_decorative, author, metadata
)
select
  asset.id, 1, 'packaged', 'active', version.path, 'image/webp', 192, 192, version.byte_size,
  version.alt_text_key, false, 'DUIF', jsonb_build_object('kind', 'equipmentIcon')
from versions version
join public.official_assets asset on asset.asset_key = version.asset_key
on conflict (asset_id, version) do nothing;

with icon_assignments(equipment_id, asset_key) as (values
  ('equipment-trovao-travel-cap', 'equipment.icon.travelCap'),
  ('equipment-pipoca-feather-charm', 'equipment.icon.featherCharm'),
  ('equipment-pipoca-small-satchel', 'equipment.icon.smallSatchel')
)
update public.mascot_templates template
set equipment = (
  select jsonb_agg(
    case
      when assignment.asset_key is not null
        then item.value || jsonb_build_object('iconAssetKey', assignment.asset_key)
      else item.value
    end
    order by item.ordinality
  )
  from jsonb_array_elements(template.equipment) with ordinality as item(value, ordinality)
  left join icon_assignments assignment on assignment.equipment_id = item.value->>'id'
)
where template.catalog_key in ('mascot-trovao', 'mascot-pipoca');

with icon_assignments(equipment_id, asset_key) as (values
  ('equipment-trovao-travel-cap', 'equipment.icon.travelCap'),
  ('equipment-pipoca-feather-charm', 'equipment.icon.featherCharm'),
  ('equipment-pipoca-small-satchel', 'equipment.icon.smallSatchel')
)
update public.player_mascots mascot
set equipment = (
  select jsonb_agg(
    case
      when assignment.asset_key is not null
        then item.value || jsonb_build_object('iconAssetKey', assignment.asset_key)
      else item.value
    end
    order by item.ordinality
  )
  from jsonb_array_elements(mascot.equipment) with ordinality as item(value, ordinality)
  left join icon_assignments assignment on assignment.equipment_id = item.value->>'id'
)
where exists (
  select 1
  from jsonb_array_elements(mascot.equipment) item
  where item->>'id' in (
    'equipment-trovao-travel-cap',
    'equipment-pipoca-feather-charm',
    'equipment-pipoca-small-satchel'
  )
);
