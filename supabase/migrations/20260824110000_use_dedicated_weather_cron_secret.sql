-- Authenticate the weather cron with a narrow, independently rotatable secret.
create or replace function public.invoke_weather_travel_edge_function() returns bigint
language plpgsql security definer set search_path=public,extensions,vault,pg_temp as $$
declare project_url text; cron_secret text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name='duif_project_url' limit 1;
  select decrypted_secret into cron_secret from vault.decrypted_secrets where name='duif_weather_resolver_cron_secret' limit 1;
  if project_url is null or cron_secret is null then return null; end if;
  return net.http_post(
    url=>rtrim(project_url,'/')||'/functions/v1/weather-travel-resolver',
    headers=>jsonb_build_object('Content-Type','application/json','X-Duif-Cron-Secret',cron_secret),
    body=>'{}'::jsonb,
    timeout_milliseconds=>10000
  );
end $$;

revoke all on function public.invoke_weather_travel_edge_function() from public,anon,authenticated;
