begin;

insert into auth.users(id,email,aud,role,raw_app_meta_data,created_at,updated_at) values
  ('10000000-0000-4000-8000-000000009601','asset-admin@example.test','authenticated','authenticated','{"duif_role":"admin"}',now(),now()),
  ('10000000-0000-4000-8000-000000009602','asset-player@example.test','authenticated','authenticated','{}',now(),now());

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000009601","role":"authenticated","app_metadata":{"duif_role":"admin"}}',true);

do $$
begin
  if not public.is_asset_admin() then raise exception 'Admin JWT role was not recognized'; end if;
  if jsonb_typeof(public.admin_list_official_assets()) <> 'array' then raise exception 'Admin asset listing failed'; end if;
end $$;

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000009602","role":"authenticated","app_metadata":{}}',true);
do $$
begin
  begin perform public.admin_list_official_assets(); raise exception 'Player accessed asset studio';
  exception when insufficient_privilege then null; end;
end $$;
reset role;

do $$
declare asset_id uuid; draft_id uuid; active_id uuid;
begin
  insert into public.official_assets(asset_key,asset_type) values('studio.testAsset','shopArtwork') returning id into asset_id;
  insert into public.official_asset_versions(asset_id,version,source,status,storage_bucket,storage_object_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
  values(asset_id,1,'storage','draft','duif-asset-staging','draft/test/1/file.webp','image/webp',256,256,1000,'shop.items.crimsonCourierScarf.name',false,'SQL test','{"kind":"shopArtwork"}') returning id into draft_id;
  begin
    insert into public.official_asset_versions(asset_id,version,source,status,storage_bucket,storage_object_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
    values(asset_id,2,'storage','draft','duif-asset-staging','draft/test/2/file.svg','image/svg+xml',256,256,1000,'shop.items.crimsonCourierScarf.name',false,'SQL test','{"kind":"shopArtwork"}');
    raise exception 'Invalid raster MIME was accepted';
  exception when check_violation then null; end;
  perform public.admin_validate_asset_draft('10000000-0000-4000-8000-000000009601',draft_id,'image/webp',256,256,1000);
  select id into active_id from public.admin_activate_asset_version('10000000-0000-4000-8000-000000009601',draft_id,'assets/studio/test/v1.webp');
  if (select status from public.official_asset_versions where id=active_id) <> 'active' then raise exception 'Draft activation failed'; end if;
  if not exists(select 1 from public.official_asset_activity where asset_version_id=active_id and action='activated') then raise exception 'Asset activity was not recorded'; end if;
  begin
    perform public.admin_archive_asset_version('10000000-0000-4000-8000-000000009601',active_id);
    raise exception 'Active version was archived without a replacement';
  exception when invalid_parameter_value then null; end;
  begin delete from public.official_asset_versions where id=active_id; raise exception 'Referenced version deletion was accepted';
  exception when foreign_key_violation then null; end;
end $$;

do $$
begin
  if (select public from storage.buckets where id='duif-asset-staging') then raise exception 'Staging bucket is public'; end if;
  if not (select public from storage.buckets where id='duif-assets') then raise exception 'Published asset bucket is private'; end if;
end $$;

rollback;
