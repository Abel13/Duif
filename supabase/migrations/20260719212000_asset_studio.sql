create table public.official_asset_activity (
  id uuid primary key default gen_random_uuid(),
  asset_version_id uuid references public.official_asset_versions(id) on delete restrict,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action in ('draftCreated','validated','activated','archived','restored')),
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index official_asset_activity_version_created_idx on public.official_asset_activity(asset_version_id, created_at desc);
alter table public.official_asset_activity enable row level security;
revoke all on public.official_asset_activity from anon, authenticated;

insert into storage.buckets(id, name, public, file_size_limit, allowed_mime_types)
values
  ('duif-asset-staging', 'duif-asset-staging', false, 1572864, array['image/webp','image/svg+xml']),
  ('duif-assets', 'duif-assets', true, 1572864, array['image/webp','image/svg+xml'])
on conflict (id) do update set public=excluded.public, file_size_limit=excluded.file_size_limit, allowed_mime_types=excluded.allowed_mime_types;

create or replace function public.is_asset_admin()
returns boolean language sql stable security definer set search_path=public,auth as $$
  select coalesce(auth.jwt()->'app_metadata'->>'duif_role' = 'admin', false)
$$;

create or replace function public.assert_asset_admin_actor(actor_id uuid)
returns void language plpgsql security definer set search_path=public,auth as $$
begin
  if actor_id is null or not exists (
    select 1 from auth.users where id=actor_id and raw_app_meta_data->>'duif_role'='admin'
  ) then raise exception 'Asset administration requires an admin role' using errcode='42501'; end if;
end $$;

create policy "Asset admins can stage uploads" on storage.objects
for insert to authenticated with check (bucket_id='duif-asset-staging' and public.is_asset_admin());
create policy "Asset admins can read staging" on storage.objects
for select to authenticated using (bucket_id='duif-asset-staging' and public.is_asset_admin());
create policy "Asset admins can update staging" on storage.objects
for update to authenticated using (bucket_id='duif-asset-staging' and public.is_asset_admin()) with check (bucket_id='duif-asset-staging' and public.is_asset_admin());
create policy "Asset admins can delete staging" on storage.objects
for delete to authenticated using (bucket_id='duif-asset-staging' and public.is_asset_admin());

create or replace function public.asset_version_usage(asset_key_value text)
returns jsonb language sql stable security definer set search_path=public as $$
  select jsonb_build_object(
    'rewardItems', (select count(*) from public.reward_items where thumbnail_asset_key=asset_key_value),
    'inventoryItems', (select count(*) from public.inventory_items where thumbnail_asset_key=asset_key_value),
    'mascotTemplates', (select count(*) from public.mascot_templates where appearance->>'portraitAssetKey'=asset_key_value),
    'playerMascots', (select count(*) from public.player_mascots where appearance->>'portraitAssetKey'=asset_key_value)
  )
$$;

create or replace function public.admin_list_official_assets()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
begin
  if not public.is_asset_admin() then raise exception 'Asset administration requires an admin role' using errcode='42501'; end if;
  return coalesce((
    select jsonb_agg(jsonb_build_object(
      'id',asset.id,'key',asset.asset_key,'type',asset.asset_type,'createdAt',asset.created_at,
      'versions',coalesce(versions.items,'[]'::jsonb),'usage',public.asset_version_usage(asset.asset_key)
    ) order by asset.asset_key)
    from public.official_assets asset
    left join lateral (
      select jsonb_agg(jsonb_build_object(
        'id',version.id,'version',version.version,'source',version.source,'status',version.status,
        'packagedPath',version.packaged_path,'storageBucket',version.storage_bucket,'storageObjectPath',version.storage_object_path,
        'mimeType',version.mime_type,'width',version.width,'height',version.height,'byteSize',version.byte_size,
        'altTextKey',version.alt_text_key,'isDecorative',version.is_decorative,'author',version.author,
        'metadata',version.metadata,'createdAt',version.created_at
      ) order by version.version desc) items
      from public.official_asset_versions version where version.asset_id=asset.id
    ) versions on true
  ),'[]'::jsonb);
end $$;
revoke all on function public.admin_list_official_assets() from public;
grant execute on function public.admin_list_official_assets() to authenticated;

create or replace function public.admin_create_asset_draft(
  actor_id uuid, requested_key text, requested_type public.official_asset_type,
  requested_mime text, requested_width integer, requested_height integer, requested_bytes integer,
  requested_alt_key text, requested_decorative boolean, requested_author text, requested_metadata jsonb,
  staging_object_path text
) returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare asset_record public.official_assets; version_record public.official_asset_versions; next_version integer;
begin
  perform public.assert_asset_admin_actor(actor_id);
  if staging_object_path !~ '^draft/[0-9a-f-]+/[0-9]+/[a-zA-Z0-9._-]+$' then raise exception 'Invalid staging object path' using errcode='22023'; end if;
  insert into public.official_assets(asset_key,asset_type) values(requested_key,requested_type)
  on conflict(asset_key) do update set updated_at=now()
  returning * into asset_record;
  if asset_record.asset_type<>requested_type then raise exception 'Asset type cannot change' using errcode='22023'; end if;
  select coalesce(max(version),0)+1 into next_version from public.official_asset_versions where asset_id=asset_record.id;
  insert into public.official_asset_versions(asset_id,version,source,status,storage_bucket,storage_object_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
  values(asset_record.id,next_version,'storage','draft','duif-asset-staging',staging_object_path,requested_mime,requested_width,requested_height,requested_bytes,requested_alt_key,requested_decorative,requested_author,requested_metadata)
  returning * into version_record;
  insert into public.official_asset_activity(asset_version_id,actor_user_id,action,details)
  values(version_record.id,actor_id,'draftCreated',jsonb_build_object('assetKey',asset_record.asset_key));
  return jsonb_build_object('assetId',asset_record.id,'assetKey',asset_record.asset_key,'versionId',version_record.id,'version',version_record.version,'stagingObjectPath',version_record.storage_object_path);
end $$;

create or replace function public.admin_validate_asset_draft(
  actor_id uuid, version_id uuid, observed_mime text, observed_width integer, observed_height integer, observed_bytes integer
) returns public.official_asset_versions language plpgsql security definer set search_path=public,auth as $$
declare version_record public.official_asset_versions;
begin
  perform public.assert_asset_admin_actor(actor_id);
  select * into version_record from public.official_asset_versions where id=version_id for update;
  if version_record.id is null or version_record.status<>'draft' or version_record.source<>'storage' then raise exception 'Draft asset version not found' using errcode='22023'; end if;
  update public.official_asset_versions set mime_type=observed_mime,width=observed_width,height=observed_height,byte_size=observed_bytes
  where id=version_record.id returning * into version_record;
  insert into public.official_asset_activity(asset_version_id,actor_user_id,action,details)
  values(version_record.id,actor_id,'validated',jsonb_build_object('mimeType',observed_mime,'width',observed_width,'height',observed_height,'byteSize',observed_bytes));
  return version_record;
end $$;

create or replace function public.admin_activate_asset_version(actor_id uuid, version_id uuid, public_object_path text)
returns public.official_asset_versions language plpgsql security definer set search_path=public,auth as $$
declare version_record public.official_asset_versions;
begin
  perform public.assert_asset_admin_actor(actor_id);
  select * into version_record from public.official_asset_versions where id=version_id for update;
  if version_record.id is null or version_record.status not in ('draft','archived') then raise exception 'Asset version cannot be activated' using errcode='22023'; end if;
  if version_record.source='storage' and public_object_path !~ '^assets/[a-zA-Z0-9._/-]+$' then raise exception 'Invalid public asset path' using errcode='22023'; end if;
  update public.official_asset_versions set status='archived' where asset_id=version_record.asset_id and status='active';
  update public.official_asset_versions set status='active',storage_bucket=case when source='storage' then 'duif-assets' else storage_bucket end,storage_object_path=case when source='storage' then public_object_path else storage_object_path end
  where id=version_record.id returning * into version_record;
  insert into public.official_asset_activity(asset_version_id,actor_user_id,action,details)
  values(version_record.id,actor_id,case when version_record.version=1 then 'activated' else 'restored' end,jsonb_build_object('publicObjectPath',public_object_path));
  return version_record;
end $$;

create or replace function public.admin_archive_asset_version(actor_id uuid, version_id uuid)
returns public.official_asset_versions language plpgsql security definer set search_path=public,auth as $$
declare version_record public.official_asset_versions;
begin
  perform public.assert_asset_admin_actor(actor_id);
  select * into version_record from public.official_asset_versions where id=version_id for update;
  if version_record.id is null or version_record.status='archived' then raise exception 'Asset version cannot be archived' using errcode='22023'; end if;
  if version_record.status='active' and exists(select 1 from public.official_asset_versions where asset_id=version_record.asset_id and status='active' and id<>version_record.id) then raise exception 'Activate a replacement before archiving' using errcode='22023'; end if;
  update public.official_asset_versions set status='archived' where id=version_record.id returning * into version_record;
  insert into public.official_asset_activity(asset_version_id,actor_user_id,action) values(version_record.id,actor_id,'archived');
  return version_record;
end $$;

revoke all on function public.admin_create_asset_draft(uuid,text,public.official_asset_type,text,integer,integer,integer,text,boolean,text,jsonb,text) from public;
revoke all on function public.admin_validate_asset_draft(uuid,uuid,text,integer,integer,integer) from public;
revoke all on function public.admin_activate_asset_version(uuid,uuid,text) from public;
revoke all on function public.admin_archive_asset_version(uuid,uuid) from public;
grant execute on function public.admin_create_asset_draft(uuid,text,public.official_asset_type,text,integer,integer,integer,text,boolean,text,jsonb,text) to service_role;
grant execute on function public.admin_validate_asset_draft(uuid,uuid,text,integer,integer,integer) to service_role;
grant execute on function public.admin_activate_asset_version(uuid,uuid,text) to service_role;
grant execute on function public.admin_archive_asset_version(uuid,uuid) to service_role;

create or replace function public.validate_official_asset_version()
returns trigger language plpgsql set search_path = public as $$
declare selected_type public.official_asset_type; max_bytes integer; max_dimension integer;
begin
  select asset_type into selected_type from public.official_assets where id = new.asset_id;
  if selected_type is null then raise exception 'Unknown official asset' using errcode = '23503'; end if;
  if jsonb_typeof(new.metadata) <> 'object' or new.metadata ->> 'kind' <> selected_type::text then raise exception 'Asset metadata does not match its type' using errcode = '23514'; end if;
  if (selected_type='currencyIcon' and new.mime_type<>'image/svg+xml') or (selected_type<>'currencyIcon' and new.mime_type<>'image/webp') then raise exception 'Asset MIME type does not match its type' using errcode='23514'; end if;
  max_bytes := case selected_type when 'mascotPortrait' then 153600 when 'postcardArtwork' then 262144 when 'navigationIcon' then 30720 when 'currencyIcon' then 15360 when 'texture' then 81920 else 61440 end;
  max_dimension := case selected_type when 'mascotPortrait' then 640 when 'postcardArtwork' then 1600 when 'texture' then 512 when 'navigationIcon' then 160 when 'currencyIcon' then 128 when 'equipmentIcon' then 192 else 256 end;
  if new.byte_size>max_bytes or new.width>max_dimension or new.height>max_dimension then raise exception 'Asset exceeds its runtime budget' using errcode='23514'; end if;
  if selected_type='postcardArtwork' and new.width*2<>new.height*3 then raise exception 'Postcard artwork must use a 3:2 ratio' using errcode='23514'; end if;
  if not new.is_decorative and not public.translation_key_is_official(new.alt_text_key) then raise exception 'Asset alt text is not fully translated' using errcode='23514'; end if;
  return new;
end $$;
