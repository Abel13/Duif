begin;

insert into auth.users (id, email, aud, role, created_at, updated_at) values
  ('00000000-0000-4000-8000-000000009613', 'admin1-region@example.test', 'authenticated', 'authenticated', now(), now());

insert into public.geonames_import_runs (
  id, source, dataset, source_date, source_sha256, source_row_count, operator_label, completed_at
) values (
  '00000000-0000-4000-8000-000000009611', 'geonames', 'cities15000', current_date,
  repeat('a', 64), 2, 'Admin1 SQL test', now()
);

insert into public.geonames_admin1_regions (
  country_code, admin1_code, name, ascii_name, geoname_id, import_run_id
) values (
  'BR', '18', 'Paraná', 'Parana', 3455070, '00000000-0000-4000-8000-000000009611'
);

insert into public.geonames_cities (
  geoname_id, name, ascii_name, alternate_names, country_code, admin1_code,
  latitude, longitude, population, search_text, import_run_id
) values (
  3458072, 'Londrina', 'Londrina', '', 'BR', '18', -23.3045, -51.1696, 588000,
  'londrina', '00000000-0000-4000-8000-000000009611'
);

insert into public.profiles (
  id, auth_user_id, display_name, home_latitude, home_longitude, home_label_key,
  postal_base_street, postal_base_neighborhood, postal_base_city, postal_base_state, postal_base_country
) values (
  '00000000-0000-4000-8000-000000009612', '00000000-0000-4000-8000-000000009613', 'Region tester', 0, 0,
  'onboarding.privateNestLabel', '', '', '', '', ''
);

insert into public.account_onboarding (
  auth_user_id, stage, stage_version, display_name, tutorial_collected_at
) values (
  '00000000-0000-4000-8000-000000009613', 'nestSetup', 1, 'Region tester', now()
);

select set_config('request.jwt.claim.sub', '00000000-0000-4000-8000-000000009613', true);

do $$
declare
  search_result record;
  result jsonb;
begin
  select * into search_result from public.search_nest_cities('Londrina');
  if search_result.label <> 'Londrina, Paraná • BR' then
    raise exception 'City search did not resolve its admin1 label: %', search_result.label;
  end if;

  result := public.complete_nest_setup(-23.3045, -51.1696, 3458072);
  if result->'profile'->>'postal_base_city' <> 'Londrina'
    or result->'profile'->>'postal_base_state' <> 'Paraná'
    or result->'profile'->>'postal_base_country' <> 'BR' then
    raise exception 'Nest setup did not save the resolved GeoNames region: %', result;
  end if;
end;
$$;

rollback;
