-- Keep automatic segment completion independent from provider availability.
create extension if not exists pg_cron with schema pg_catalog;

do $$ begin
  if exists(select 1 from cron.job where jobname='duif-segmented-travel-resolver') then
    perform cron.unschedule('duif-segmented-travel-resolver');
  end if;
  perform cron.schedule('duif-segmented-travel-resolver','0 */3 * * *',$job$select public.resolve_due_delivery_route_segments(now())$job$);
end $$;

create or replace function public.resolve_due_delivery_route_segments(reference_time timestamptz default now()) returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare item record; total integer:=0;
begin
  if current_user not in ('postgres','service_role') and coalesce(auth.role(),'')<>'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
  for item in select distinct delivery_id from public.delivery_route_segments where state<>'completed' and estimated_start_at<=reference_time loop
    perform public.resolve_delivery_route_segments(item.delivery_id,reference_time); total:=total+1;
  end loop;
  delete from public.weather_forecast_cache where queried_at<reference_time-interval '30 days'; return total;
end $$;
revoke all on function public.resolve_due_delivery_route_segments(timestamptz) from public,anon,authenticated;
grant execute on function public.resolve_due_delivery_route_segments(timestamptz) to service_role;
