\set ON_ERROR_STOP on

begin;

create temporary table geonames_city_staging (
  geoname_id bigint,
  name text,
  ascii_name text,
  alternate_names text,
  latitude double precision,
  longitude double precision,
  feature_class text,
  feature_code text,
  country_code text,
  cc2 text,
  admin1_code text,
  admin2_code text,
  admin3_code text,
  admin4_code text,
  population bigint,
  elevation text,
  dem text,
  timezone text,
  modification_date date
) on commit drop;

\copy geonames_city_staging from '__CITIES_FILE__' with (format text, delimiter E'\t', null '')

do $$
begin
  if (select count(*) from geonames_city_staging) < 1000 then
    raise exception 'GeoNames input is unexpectedly small';
  end if;
end;
$$;

insert into public.geonames_import_runs (
  source, dataset, source_date, source_sha256, source_row_count, operator_label
) values (
  'geonames', 'cities15000', :'source_date'::date, :'source_sha256',
  (select count(*) from geonames_city_staging), :'operator_label'
) returning id \gset

insert into public.geonames_cities (
  geoname_id, name, ascii_name, alternate_names, country_code, admin1_code,
  latitude, longitude, population, search_text, import_run_id, is_active, archived_at, updated_at
)
select
  source.geoname_id, source.name, coalesce(nullif(source.ascii_name, ''), source.name),
  coalesce(source.alternate_names, ''), source.country_code, nullif(source.admin1_code, ''),
  source.latitude, source.longitude, greatest(coalesce(source.population, 0), 0),
  lower(extensions.unaccent(concat_ws(' ', source.name, source.ascii_name, source.alternate_names))),
  :'id'::uuid, true, null, now()
from geonames_city_staging source
where source.feature_class = 'P'
  and source.geoname_id is not null
  and nullif(btrim(source.name), '') is not null
  and source.country_code ~ '^[A-Z]{2}$'
on conflict (geoname_id) do update set
  name = excluded.name,
  ascii_name = excluded.ascii_name,
  alternate_names = excluded.alternate_names,
  country_code = excluded.country_code,
  admin1_code = excluded.admin1_code,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  population = excluded.population,
  search_text = excluded.search_text,
  import_run_id = excluded.import_run_id,
  is_active = true,
  archived_at = null,
  updated_at = now();

with archived as (
  update public.geonames_cities
  set is_active = false, archived_at = now(), updated_at = now()
  where is_active
    and import_run_id <> :'id'::uuid
  returning geoname_id
)
update public.geonames_import_runs run
set imported_city_count = (select count(*) from public.geonames_cities where import_run_id = run.id),
    archived_city_count = (select count(*) from archived),
    completed_at = now()
where run.id = :'id'::uuid;

commit;
