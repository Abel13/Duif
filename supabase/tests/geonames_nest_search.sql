begin;

insert into auth.users (id, email, aud, role, created_at, updated_at) values
  ('10000000-0000-4000-8000-000000009501', 'nest-search@example.test', 'authenticated', 'authenticated', now(), now()),
  ('10000000-0000-4000-8000-000000009502', 'nest-search-blocked@example.test', 'authenticated', 'authenticated', now(), now());

insert into public.account_onboarding(auth_user_id, stage, display_name)
values
  ('10000000-0000-4000-8000-000000009501', 'nestSetup', 'Nest Search'),
  ('10000000-0000-4000-8000-000000009502', 'welcome', null);

insert into public.geonames_import_runs(
  id, source, dataset, source_date, source_sha256, source_row_count, imported_city_count, operator_label, completed_at
) values (
  '00000000-0000-4000-8000-000000009501', 'geonames', 'cities15000', current_date,
  repeat('a', 64), 3, 3, 'SQL test', now()
);

insert into public.geonames_cities(
  geoname_id, name, ascii_name, alternate_names, country_code, admin1_code,
  latitude, longitude, population, search_text, import_run_id
) values
  (990000001, 'São Paulo Test', 'Sao Paulo Test', 'Sampa Test', 'BR', '27', -23.5505, -46.6333, 12325232, 'sao paulo test sao paulo test sampa test', '00000000-0000-4000-8000-000000009501'),
  (990000002, 'São Carlos Test', 'Sao Carlos Test', '', 'BR', '27', -22.0174, -47.8909, 254857, 'sao carlos test sao carlos test', '00000000-0000-4000-8000-000000009501'),
  (990000003, 'Munich Test', 'Munich Test', 'Muenchen Test,München Test', 'DE', '02', 48.1374, 11.5755, 1487708, 'munich test munich test muenchen test munchen test', '00000000-0000-4000-8000-000000009501');

insert into public.geonames_admin1_regions(
  country_code, admin1_code, name, ascii_name, import_run_id
) values
  ('BR', '27', 'São Paulo', 'Sao Paulo', '00000000-0000-4000-8000-000000009501'),
  ('DE', '02', 'Bavaria', 'Bavaria', '00000000-0000-4000-8000-000000009501');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000009501', true);

do $$
declare
  search_result record;
  request_number integer;
begin
  select * into strict search_result from public.search_nest_cities('Sao Paulo Test') limit 1;
  if search_result.id <> '990000001' or search_result.label <> 'São Paulo Test, São Paulo • BR' then
    raise exception 'GeoNames search did not normalize accents or rank population';
  end if;

  select * into strict search_result from public.search_nest_cities('München Test') limit 1;
  if search_result.id <> '990000003' then
    raise exception 'GeoNames search did not search alternate names';
  end if;

  begin
    perform * from public.geonames_cities;
    raise exception 'Direct city catalog read was accepted';
  exception when insufficient_privilege then null;
  end;

  for request_number in 1..8 loop
    perform * from public.search_nest_cities('Sao Paulo Test');
  end loop;
  begin
    perform * from public.search_nest_cities('Sao Paulo Test');
    raise exception 'Eleventh city search in a minute was accepted';
  exception when invalid_parameter_value then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000009502', true);
do $$
begin
  begin
    perform * from public.search_nest_cities('Sao Paulo Test');
    raise exception 'Search outside nest setup was accepted';
  exception when invalid_parameter_value then null;
  end;
end;
$$;

reset role;

insert into public.geonames_import_runs(
  id, source, dataset, source_date, source_sha256, source_row_count, imported_city_count, operator_label, completed_at
) values (
  '00000000-0000-4000-8000-000000009502', 'geonames', 'cities15000', current_date + 1,
  repeat('b', 64), 1, 0, 'SQL test refresh', now()
);

insert into public.geonames_cities(
  geoname_id, name, ascii_name, alternate_names, country_code, admin1_code,
  latitude, longitude, population, search_text, import_run_id
) values (
  990000001, 'São Paulo Test', 'Sao Paulo Test', 'Sampa Test', 'BR', '27', -23.5505, -46.6333,
  12325233, 'sao paulo test sao paulo test sampa test', '00000000-0000-4000-8000-000000009502'
)
on conflict (geoname_id) do update set
  population = excluded.population,
  import_run_id = excluded.import_run_id,
  is_active = true,
  archived_at = null,
  updated_at = now();

update public.geonames_cities
set is_active = false, archived_at = now(), updated_at = now()
where is_active and import_run_id <> '00000000-0000-4000-8000-000000009502';

do $$
begin
  if (select population from public.geonames_cities where geoname_id = 990000001) <> 12325233 then
    raise exception 'Repeated GeoNames import did not upsert deterministically';
  end if;
  if (select count(*) from public.geonames_cities where geoname_id between 990000001 and 990000003 and is_active) <> 1
    or (select count(*) from public.geonames_cities where geoname_id between 990000001 and 990000003 and archived_at is not null) <> 2 then
    raise exception 'GeoNames refresh did not archive absent cities';
  end if;
end;
$$;

rollback;
