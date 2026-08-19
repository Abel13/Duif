create type public.geonames_refresh_status as enum ('queued', 'running', 'succeeded', 'failed');

create table public.geonames_refresh_jobs (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references auth.users(id),
  status public.geonames_refresh_status not null default 'queued',
  source_date date,
  source_sha256 text,
  admin1_source_sha256 text,
  processed_city_count integer not null default 0 check (processed_city_count >= 0),
  imported_city_count integer not null default 0 check (imported_city_count >= 0),
  updated_city_count integer not null default 0 check (updated_city_count >= 0),
  archived_city_count integer not null default 0 check (archived_city_count >= 0),
  safe_error_code text,
  started_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint geonames_refresh_error_safe check (safe_error_code is null or safe_error_code ~ '^[a-z0-9_]{1,80}$')
);
create unique index geonames_refresh_one_active_idx on public.geonames_refresh_jobs ((1)) where status in ('queued', 'running');

alter table public.geonames_refresh_jobs enable row level security;
revoke all on public.geonames_refresh_jobs from anon, authenticated;

create or replace function public.admin_begin_geonames_refresh(actor_id uuid)
returns public.geonames_refresh_jobs language plpgsql security definer set search_path=public,auth as $$
declare job public.geonames_refresh_jobs;
begin
 perform public.assert_asset_admin_actor(actor_id);
 insert into public.geonames_refresh_jobs(requested_by) values(actor_id) returning * into job;
 return job;
exception when unique_violation then
 raise exception 'A GeoNames refresh is already running' using errcode='55P03';
end $$;

create or replace function public.admin_list_geonames_refreshes()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
begin
 if not public.is_asset_admin() then raise exception 'GeoNames administration requires an admin role' using errcode='42501'; end if;
 return jsonb_build_object(
  'activeCityCount',(select count(*) from public.geonames_cities where is_active),
  'latestSuccess',(select to_jsonb(job) from public.geonames_refresh_jobs job where status='succeeded' order by completed_at desc limit 1),
  'jobs',coalesce((select jsonb_agg(to_jsonb(job) order by job.created_at desc) from (select * from public.geonames_refresh_jobs order by created_at desc limit 12) job),'[]'::jsonb)
 );
end $$;
revoke all on function public.admin_begin_geonames_refresh(uuid), public.admin_list_geonames_refreshes() from public;
grant execute on function public.admin_begin_geonames_refresh(uuid), public.admin_list_geonames_refreshes() to authenticated;
