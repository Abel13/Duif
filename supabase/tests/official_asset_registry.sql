begin;

do $$
begin
  if (select count(*) from public.official_assets where asset_key in (
    'equipment.icon.featherCharm',
    'equipment.icon.smallSatchel',
    'equipment.icon.travelCap'
  )) <> 3 then
    raise exception 'Expected three starter equipment asset identities';
  end if;
  if (select count(*) from public.official_asset_versions version
      join public.official_assets asset on asset.id = version.asset_id
      where asset.asset_key in (
        'equipment.icon.featherCharm',
        'equipment.icon.smallSatchel',
        'equipment.icon.travelCap'
      ) and version.status = 'active' and version.packaged_path like '/assets/equipment/icons/%') <> 3 then
    raise exception 'Expected three active packaged starter equipment versions';
  end if;
  if exists (
    select 1 from public.official_asset_versions v join public.official_assets a on a.id=v.asset_id
    where v.status='active' and v.source='packaged' and v.packaged_path not like '/assets/%'
  ) then raise exception 'Active packaged assets must use public asset paths'; end if;
  if has_table_privilege('anon','public.official_assets','INSERT')
    or has_table_privilege('authenticated','public.official_asset_versions','UPDATE') then
    raise exception 'Browser roles must not mutate the asset registry';
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from public.player_mascots mascot,
      lateral jsonb_array_elements(mascot.equipment) item
    where item->>'id' in (
      'equipment-trovao-travel-cap',
      'equipment-pipoca-feather-charm',
      'equipment-pipoca-small-satchel'
    ) and item->>'iconAssetKey' is null
  ) then
    raise exception 'Starter equipment asset backfill left a mascot without an icon key';
  end if;
end $$;

set local role anon;
do $$ begin
  if (select count(*) from public.official_assets where asset_key in (
    'equipment.icon.featherCharm',
    'equipment.icon.smallSatchel',
    'equipment.icon.travelCap'
  )) <> 3
    or (select count(*) from public.official_asset_versions version
        join public.official_assets asset on asset.id = version.asset_id
        where asset.asset_key in (
          'equipment.icon.featherCharm',
          'equipment.icon.smallSatchel',
          'equipment.icon.travelCap'
        )) <> 3 then
    raise exception 'Anonymous manifest must expose active starter equipment assets';
  end if;
end $$;

do $$
begin
  if (select count(*) from public.mascot_templates mt,
      lateral jsonb_array_elements(mt.equipment) item
      where item->>'id' in (
        'equipment-trovao-travel-cap',
        'equipment-pipoca-feather-charm',
        'equipment-pipoca-small-satchel'
      ) and item->>'iconAssetKey' is not null) <> 3 then
    raise exception 'Starter equipment assets were not persisted on archetypes';
  end if;
end $$;
reset role;

do $$ declare selected_asset uuid; begin
  select id into selected_asset from public.official_assets where asset_key='navigation.icon.nest';
  begin
    insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,is_decorative,author,metadata)
    values(selected_asset,2,'packaged','active','/assets/navigation/nest.webp','image/webp',160,160,7354,true,'test','{"kind":"navigationIcon"}');
    raise exception 'Second active version was accepted';
  exception when unique_violation then null; end;
  begin
    insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,is_decorative,author,metadata)
    values(selected_asset,3,'packaged','draft','/assets/navigation/nest.webp','image/png',160,160,7354,true,'test','{"kind":"navigationIcon"}');
    raise exception 'Invalid MIME was accepted';
  exception when check_violation then null; end;
  begin
    insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,is_decorative,author,metadata)
    values(selected_asset,4,'packaged','draft','/assets/navigation/nest.webp','image/webp',160,160,7354,true,'test','{"kind":"mapPin"}');
    raise exception 'Mismatched metadata was accepted';
  exception when check_violation then null; end;
end $$;

do $$ declare selected_version uuid; begin
  select v.id into selected_version from public.official_asset_versions v join public.official_assets a on a.id=v.asset_id
    where a.asset_key='mascot.portrait.nuvem' and v.status='active';
  begin
    update public.official_asset_versions set byte_size=1 where id=selected_version;
    raise exception 'Published asset content was mutable';
  exception when check_violation then null; end;
end $$;

rollback;
