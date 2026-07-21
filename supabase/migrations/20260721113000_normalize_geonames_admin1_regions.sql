alter table public.geonames_import_runs
  add column if not exists admin1_source_sha256 text,
  add column if not exists imported_region_count integer not null default 0 check (imported_region_count >= 0),
  add column if not exists archived_region_count integer not null default 0 check (archived_region_count >= 0);

create table public.geonames_admin1_regions (
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  admin1_code text not null check (char_length(btrim(admin1_code)) > 0),
  name text not null check (char_length(btrim(name)) > 0),
  ascii_name text not null check (char_length(btrim(ascii_name)) > 0),
  geoname_id bigint,
  import_run_id uuid not null references public.geonames_import_runs(id),
  is_active boolean not null default true,
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (country_code, admin1_code),
  check ((is_active and archived_at is null) or (not is_active and archived_at is not null))
);

create index geonames_admin1_regions_active_idx
  on public.geonames_admin1_regions (country_code, admin1_code)
  where is_active;

alter table public.geonames_admin1_regions enable row level security;
revoke all on public.geonames_admin1_regions from anon, authenticated;

create or replace function public.search_nest_cities(search_query text)
returns table(id text, label text, latitude double precision, longitude double precision)
language plpgsql security definer set search_path=public,auth,extensions as $$
declare
  current_user_id uuid := auth.uid(); onboarding_record public.account_onboarding;
  limit_record public.nest_search_rate_limits; normalized_query text; now_at timestamptz := now();
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  normalized_query := lower(extensions.unaccent(btrim(coalesce(search_query, ''))));
  if char_length(normalized_query) < 2 or char_length(normalized_query) > 120 then raise exception 'Invalid nest search query' using errcode = '22023'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id = current_user_id;
  if onboarding_record.auth_user_id is null or onboarding_record.stage <> 'nestSetup' then raise exception 'Nest search is unavailable' using errcode = '22023'; end if;
  insert into public.nest_search_rate_limits(auth_user_id, window_started_at, request_count, updated_at)
  values (current_user_id, now_at, 1, now_at)
  on conflict (auth_user_id) do update
  set window_started_at = case when public.nest_search_rate_limits.window_started_at <= now_at - interval '1 minute' then now_at else public.nest_search_rate_limits.window_started_at end,
      request_count = case when public.nest_search_rate_limits.window_started_at <= now_at - interval '1 minute' then 1 else public.nest_search_rate_limits.request_count + 1 end,
      updated_at = now_at
  returning * into limit_record;
  if limit_record.request_count > 10 then raise exception 'Nest search rate limit exceeded' using errcode = '22023'; end if;
  return query
  select city.geoname_id::text,
    concat_ws(' • ', nullif(concat_ws(', ', city.name, region.name), ''), city.country_code),
    city.latitude, city.longitude
  from public.geonames_cities city
  left join public.geonames_admin1_regions region
    on region.country_code = city.country_code and region.admin1_code = city.admin1_code and region.is_active
  where city.is_active and city.search_text like '%' || normalized_query || '%'
  order by case when city.search_text like normalized_query || '%' then 0 else 1 end, city.population desc, city.geoname_id asc
  limit 5;
end;
$$;

create or replace function public.complete_nest_setup(
  selected_latitude double precision, selected_longitude double precision, selected_city_geoname_id bigint
)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare
  current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding; profile_record public.profiles;
  city_record public.geonames_cities; region_name text;
  lat_step double precision:=2.0/111.32; lon_step double precision; normalized_lat double precision; normalized_lon double precision;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if selected_latitude is null or selected_longitude is null or selected_latitude<-90 or selected_latitude>90 or selected_longitude<-180 or selected_longitude>180 then raise exception 'Invalid nest coordinate' using errcode='22023'; end if;
  if selected_city_geoname_id is null then raise exception 'A nest city is required' using errcode='22023'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
  if onboarding_record.auth_user_id is null then raise exception 'Onboarding not found' using errcode='22023'; end if;
  select * into strict profile_record from public.profiles where auth_user_id=current_user_id for update;
  if onboarding_record.stage='completed' and onboarding_record.completed_at is not null then return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record)); end if;
  if onboarding_record.stage<>'nestSetup' or onboarding_record.tutorial_collected_at is null then raise exception 'Nest setup is unavailable' using errcode='22023'; end if;
  select * into city_record from public.geonames_cities where geoname_id=selected_city_geoname_id and is_active;
  if city_record.geoname_id is null then raise exception 'Selected nest city is unavailable' using errcode='22023'; end if;
  select region.name into region_name from public.geonames_admin1_regions region
  where region.country_code=city_record.country_code and region.admin1_code=city_record.admin1_code and region.is_active;
  normalized_lat:=round(selected_latitude/lat_step)*lat_step;
  lon_step:=2.0/(111.32*greatest(cos(radians(selected_latitude)),.05));
  normalized_lon:=round(selected_longitude/lon_step)*lon_step;
  update public.profiles set home_latitude=normalized_lat,home_longitude=normalized_lon,home_label_key='onboarding.privateNestLabel',home_city_geoname_id=city_record.geoname_id,postal_base_street='',postal_base_neighborhood='',postal_base_city=city_record.name,postal_base_state=coalesce(region_name,''),postal_base_country=city_record.country_code,updated_at=now() where id=profile_record.id returning * into profile_record;
  update public.account_onboarding set stage='completed',completed_at=coalesce(completed_at,now()),updated_at=now() where auth_user_id=current_user_id returning * into onboarding_record;
  return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record));
end;
$$;
revoke all on function public.complete_nest_setup(double precision,double precision,bigint) from public;
grant execute on function public.complete_nest_setup(double precision,double precision,bigint) to authenticated;
