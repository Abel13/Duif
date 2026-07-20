create extension if not exists unaccent with schema extensions;
create extension if not exists pg_trgm with schema extensions;

create table public.geonames_import_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source = 'geonames'),
  dataset text not null check (dataset = 'cities15000'),
  source_date date not null,
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  source_row_count integer not null check (source_row_count > 0),
  imported_city_count integer not null default 0 check (imported_city_count >= 0),
  archived_city_count integer not null default 0 check (archived_city_count >= 0),
  operator_label text not null check (char_length(btrim(operator_label)) between 2 and 120),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.geonames_cities (
  geoname_id bigint primary key,
  name text not null check (char_length(btrim(name)) > 0),
  ascii_name text not null,
  alternate_names text not null default '',
  country_code text not null check (country_code ~ '^[A-Z]{2}$'),
  admin1_code text,
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  population bigint not null default 0 check (population >= 0),
  search_text text not null,
  import_run_id uuid not null references public.geonames_import_runs(id),
  is_active boolean not null default true,
  archived_at timestamptz,
  updated_at timestamptz not null default now(),
  check ((is_active and archived_at is null) or (not is_active and archived_at is not null))
);

create index geonames_cities_search_text_idx on public.geonames_cities using gin (search_text gin_trgm_ops);
create index geonames_cities_active_population_idx on public.geonames_cities (population desc, geoname_id asc) where is_active;

alter table public.geonames_import_runs enable row level security;
alter table public.geonames_cities enable row level security;
revoke all on public.geonames_import_runs, public.geonames_cities from anon, authenticated;

create or replace function public.search_nest_cities(search_query text)
returns table(id text, label text, latitude double precision, longitude double precision)
language plpgsql security definer set search_path=public,auth,extensions as $$
declare
  current_user_id uuid := auth.uid();
  onboarding_record public.account_onboarding;
  limit_record public.nest_search_rate_limits;
  normalized_query text;
  now_at timestamptz := now();
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  normalized_query := lower(extensions.unaccent(btrim(coalesce(search_query, ''))));
  if char_length(normalized_query) < 2 or char_length(normalized_query) > 120 then
    raise exception 'Invalid nest search query' using errcode = '22023';
  end if;

  select * into onboarding_record
  from public.account_onboarding
  where auth_user_id = current_user_id;
  if onboarding_record.auth_user_id is null or onboarding_record.stage <> 'nestSetup' then
    raise exception 'Nest search is unavailable' using errcode = '22023';
  end if;

  insert into public.nest_search_rate_limits(auth_user_id, window_started_at, request_count, updated_at)
  values (current_user_id, now_at, 1, now_at)
  on conflict (auth_user_id) do update
  set window_started_at = case when public.nest_search_rate_limits.window_started_at <= now_at - interval '1 minute' then now_at else public.nest_search_rate_limits.window_started_at end,
      request_count = case when public.nest_search_rate_limits.window_started_at <= now_at - interval '1 minute' then 1 else public.nest_search_rate_limits.request_count + 1 end,
      updated_at = now_at
  returning * into limit_record;

  if limit_record.request_count > 10 then
    raise exception 'Nest search rate limit exceeded' using errcode = '22023';
  end if;

  return query
  select city.geoname_id::text,
    city.name || ' · ' || city.country_code,
    city.latitude,
    city.longitude
  from public.geonames_cities city
  where city.is_active
    and city.search_text like '%' || normalized_query || '%'
  order by
    case when city.search_text like normalized_query || '%' then 0 else 1 end,
    city.population desc,
    city.geoname_id asc
  limit 5;
end;
$$;

revoke all on function public.search_nest_cities(text) from public;
grant execute on function public.search_nest_cities(text) to authenticated;
