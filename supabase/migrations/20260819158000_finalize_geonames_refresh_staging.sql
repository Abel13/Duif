-- Makes installations that applied the first 46A migration before its staging flow was added safe.
create table if not exists public.geonames_refresh_city_staging (
  job_id uuid not null references public.geonames_refresh_jobs(id) on delete cascade, geoname_id bigint not null,
  name text not null, ascii_name text not null, alternate_names text not null default '', country_code text not null,
  admin1_code text, latitude double precision not null, longitude double precision not null, population bigint not null,
  search_text text not null, primary key (job_id, geoname_id)
);
create table if not exists public.geonames_refresh_region_staging (
  job_id uuid not null references public.geonames_refresh_jobs(id) on delete cascade, country_code text not null,
  admin1_code text not null, name text not null, ascii_name text not null, geoname_id bigint,
  primary key (job_id, country_code, admin1_code)
);
alter table public.geonames_refresh_city_staging enable row level security;
alter table public.geonames_refresh_region_staging enable row level security;
revoke all on public.geonames_refresh_city_staging, public.geonames_refresh_region_staging from anon, authenticated;

create or replace function public.admin_finalize_geonames_refresh(refresh_job_id uuid, actor_id uuid, imported_source_date date, imported_source_sha256 text, imported_admin1_sha256 text)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare job public.geonames_refresh_jobs; run_id uuid; staged_city_count integer; staged_region_count integer; updated_count integer; archived_count integer; archived_region_count integer;
begin
  perform public.assert_asset_admin_actor(actor_id);
  select * into job from public.geonames_refresh_jobs where id=refresh_job_id for update;
  if job.id is null or job.requested_by <> actor_id or job.status <> 'running' then raise exception 'GeoNames refresh is unavailable' using errcode='22023'; end if;
  if imported_source_date is null or imported_source_sha256 !~ '^[0-9a-f]{64}$' or imported_admin1_sha256 !~ '^[0-9a-f]{64}$' then raise exception 'Invalid GeoNames source metadata' using errcode='22023'; end if;
  select count(*) into staged_city_count from public.geonames_refresh_city_staging where job_id=refresh_job_id;
  select count(*) into staged_region_count from public.geonames_refresh_region_staging where job_id=refresh_job_id;
  if staged_city_count < 1000 or staged_region_count < 100 then raise exception 'Invalid staged GeoNames dataset' using errcode='22023'; end if;
  select count(*) into updated_count from public.geonames_cities city join public.geonames_refresh_city_staging staged on staged.job_id=refresh_job_id and staged.geoname_id=city.geoname_id;
  select count(*) into archived_count from public.geonames_cities city where city.is_active and not exists (select 1 from public.geonames_refresh_city_staging staged where staged.job_id=refresh_job_id and staged.geoname_id=city.geoname_id);
  select count(*) into archived_region_count from public.geonames_admin1_regions region where region.is_active and not exists (select 1 from public.geonames_refresh_region_staging staged where staged.job_id=refresh_job_id and staged.country_code=region.country_code and staged.admin1_code=region.admin1_code);
  insert into public.geonames_import_runs(source,dataset,source_date,source_sha256,admin1_source_sha256,source_row_count,imported_city_count,imported_region_count,archived_city_count,archived_region_count,operator_label,completed_at)
  values ('geonames','cities15000',imported_source_date,imported_source_sha256,imported_admin1_sha256,staged_city_count,staged_city_count,staged_region_count,archived_count,archived_region_count,'admin:' || actor_id::text,now()) returning id into run_id;
  insert into public.geonames_admin1_regions(country_code,admin1_code,name,ascii_name,geoname_id,import_run_id,is_active,archived_at,updated_at)
  select country_code,admin1_code,name,ascii_name,geoname_id,run_id,true,null,now() from public.geonames_refresh_region_staging where job_id=refresh_job_id on conflict (country_code,admin1_code) do update set name=excluded.name,ascii_name=excluded.ascii_name,geoname_id=excluded.geoname_id,import_run_id=excluded.import_run_id,is_active=true,archived_at=null,updated_at=excluded.updated_at;
  insert into public.geonames_cities(geoname_id,name,ascii_name,alternate_names,country_code,admin1_code,latitude,longitude,population,search_text,import_run_id,is_active,archived_at,updated_at)
  select geoname_id,name,ascii_name,alternate_names,country_code,admin1_code,latitude,longitude,population,search_text,run_id,true,null,now() from public.geonames_refresh_city_staging where job_id=refresh_job_id on conflict (geoname_id) do update set name=excluded.name,ascii_name=excluded.ascii_name,alternate_names=excluded.alternate_names,country_code=excluded.country_code,admin1_code=excluded.admin1_code,latitude=excluded.latitude,longitude=excluded.longitude,population=excluded.population,search_text=excluded.search_text,import_run_id=excluded.import_run_id,is_active=true,archived_at=null,updated_at=excluded.updated_at;
  update public.geonames_cities city set is_active=false,archived_at=now(),updated_at=now() where city.is_active and city.import_run_id <> run_id;
  update public.geonames_admin1_regions region set is_active=false,archived_at=now(),updated_at=now() where region.is_active and region.import_run_id <> run_id;
  update public.geonames_refresh_jobs set status='succeeded',source_date=imported_source_date,source_sha256=imported_source_sha256,admin1_source_sha256=imported_admin1_sha256,processed_city_count=staged_city_count,imported_city_count=staged_city_count,updated_city_count=updated_count,archived_city_count=archived_count,completed_at=now() where id=refresh_job_id;
  delete from public.geonames_refresh_city_staging where job_id=refresh_job_id;
  return jsonb_build_object('importedCityCount',staged_city_count,'updatedCityCount',updated_count,'archivedCityCount',archived_count);
end $$;
revoke all on function public.admin_finalize_geonames_refresh(uuid,uuid,date,text,text) from public;
grant execute on function public.admin_finalize_geonames_refresh(uuid,uuid,date,text,text) to authenticated;
