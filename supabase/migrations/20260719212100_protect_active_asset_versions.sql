create or replace function public.admin_archive_asset_version(actor_id uuid, version_id uuid)
returns public.official_asset_versions language plpgsql security definer set search_path=public,auth as $$
declare version_record public.official_asset_versions;
begin
  perform public.assert_asset_admin_actor(actor_id);
  select * into version_record from public.official_asset_versions where id=version_id for update;
  if version_record.id is null or version_record.status='archived' then
    raise exception 'Asset version cannot be archived' using errcode='22023';
  end if;
  if version_record.status='active' then
    raise exception 'Activate a replacement before archiving' using errcode='22023';
  end if;
  update public.official_asset_versions set status='archived' where id=version_record.id returning * into version_record;
  insert into public.official_asset_activity(asset_version_id,actor_user_id,action)
  values(version_record.id,actor_id,'archived');
  return version_record;
end $$;
