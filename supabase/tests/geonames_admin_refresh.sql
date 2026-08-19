begin;

insert into auth.users(id,email,aud,role,raw_app_meta_data,created_at,updated_at) values
  ('10000000-0000-4000-8000-000000009603','geonames-admin@example.test','authenticated','authenticated','{"duif_role":"admin"}',now(),now());

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000009603","role":"authenticated","app_metadata":{"duif_role":"admin"}}',true);
create temp table geonames_test_job as select id from public.admin_begin_geonames_refresh('10000000-0000-4000-8000-000000009603');
do $$ begin
  begin perform public.admin_begin_geonames_refresh('10000000-0000-4000-8000-000000009603'); raise exception 'Concurrent refresh was accepted';
  exception when lock_not_available then null; end;
end $$;
reset role;

update public.geonames_refresh_jobs set status='running',started_at=now() where id=(select id from geonames_test_job);
insert into public.geonames_refresh_city_staging(job_id,geoname_id,name,ascii_name,country_code,latitude,longitude,population,search_text)
select (select id from geonames_test_job), 900000000 + value, 'Test city ' || value, 'Test city ' || value, 'BR', -20, -40, value, 'test city ' || value
from generate_series(1,1000) value;
insert into public.geonames_refresh_region_staging(job_id,country_code,admin1_code,name,ascii_name)
select (select id from geonames_test_job), 'BR', 'T' || value, 'Test region ' || value, 'Test region ' || value from generate_series(1,100) value;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000009603","role":"authenticated","app_metadata":{"duif_role":"admin"}}',true);
create temp table geonames_test_result as select public.admin_finalize_geonames_refresh((select id from geonames_test_job),'10000000-0000-4000-8000-000000009603','2026-08-19',repeat('a',64),repeat('b',64)) as result;
reset role;
do $$ begin
  if ((select result->>'importedCityCount' from geonames_test_result)::integer) <> 1000 then raise exception 'Staged catalog was not finalized'; end if;
  if (select status from public.geonames_refresh_jobs where id=(select id from geonames_test_job)) <> 'succeeded' then raise exception 'Refresh job was not completed'; end if;
  if exists(select 1 from public.geonames_refresh_city_staging where job_id=(select id from geonames_test_job)) then raise exception 'City staging rows were retained'; end if;
end $$;

rollback;
