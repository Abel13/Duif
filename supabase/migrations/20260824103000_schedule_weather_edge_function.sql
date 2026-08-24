create extension if not exists pg_net with schema extensions;

create or replace function public.invoke_weather_travel_edge_function() returns bigint
language plpgsql security definer set search_path=public,extensions,vault,pg_temp as $$
declare project_url text; service_key text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name='duif_project_url' limit 1;
  select decrypted_secret into service_key from vault.decrypted_secrets where name='duif_service_role_key' limit 1;
  if project_url is null or service_key is null then return null; end if;
  return net.http_post(url=>rtrim(project_url,'/')||'/functions/v1/weather-travel-resolver',headers=>jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||service_key),body=>'{}'::jsonb,timeout_milliseconds=>10000);
end $$;
revoke all on function public.invoke_weather_travel_edge_function() from public,anon,authenticated;

do $$ begin
  if exists(select 1 from cron.job where jobname='duif-weather-edge-resolver') then perform cron.unschedule('duif-weather-edge-resolver'); end if;
  perform cron.schedule('duif-weather-edge-resolver','5 */3 * * *',$job$select public.invoke_weather_travel_edge_function()$job$);
end $$;
