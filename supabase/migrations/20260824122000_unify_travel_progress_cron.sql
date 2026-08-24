-- A minute-level, network-free authority for completion and daylight.
create or replace function public.resolve_travel_progress(reference_time timestamptz default now()) returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare item record; segment record; total integer:=0; day_now boolean; old_day boolean; fraction numeric; lat numeric; lon numeric; multiplier numeric; remaining numeric;
begin
  for item in select d.id,d.travel_rules_snapshot,d.animal_speed_kmh,d.origin_latitude,d.origin_longitude,d.destination_latitude,d.destination_longitude from public.deliveries d where exists(select 1 from public.delivery_route_segments s where s.delivery_id=d.id and s.state<>'completed' and s.estimated_start_at<=reference_time) loop
    if coalesce(item.travel_rules_snapshot->>'version','1')<>'2' then perform public.resolve_delivery_route_segments(item.id,reference_time); total:=total+1; continue; end if;
    perform pg_advisory_xact_lock(hashtextextended(item.id::text,55));
    update public.delivery_route_segments set state='completed',completed_at=coalesce(completed_at,estimated_end_at),updated_at=reference_time where delivery_id=item.id and state<>'completed' and estimated_end_at<=reference_time;
    select * into segment from public.delivery_route_segments where delivery_id=item.id and state<>'completed' and estimated_start_at<=reference_time and estimated_end_at>reference_time order by estimated_start_at limit 1 for update;
    if segment.id is null then total:=total+1; continue; end if;
    update public.delivery_route_segments set state='active',updated_at=reference_time where id=segment.id;
    fraction:=least(1,greatest(0,extract(epoch from reference_time-segment.estimated_start_at)/nullif(extract(epoch from segment.estimated_end_at-segment.estimated_start_at),0)));
    if segment.leg='outbound' then lat:=item.origin_latitude+(item.destination_latitude-item.origin_latitude)*(segment.route_fraction_start+(segment.route_fraction_end-segment.route_fraction_start)*fraction); lon:=item.origin_longitude+(item.destination_longitude-item.origin_longitude)*(segment.route_fraction_start+(segment.route_fraction_end-segment.route_fraction_start)*fraction); else lat:=item.destination_latitude+(item.origin_latitude-item.destination_latitude)*(segment.route_fraction_start+(segment.route_fraction_end-segment.route_fraction_start)*fraction); lon:=item.destination_longitude+(item.origin_longitude-item.destination_longitude)*(segment.route_fraction_start+(segment.route_fraction_end-segment.route_fraction_start)*fraction); end if;
    day_now:=public.astronomical_is_day(reference_time,lat,lon); select is_day into old_day from public.delivery_route_daylight_windows where segment_id=segment.id and ended_at is null;
    if old_day is distinct from day_now then
      update public.delivery_route_daylight_windows set ended_at=reference_time where segment_id=segment.id and ended_at is null; insert into public.delivery_route_daylight_windows(delivery_id,segment_id,is_day,started_at) values(item.id,segment.id,day_now,reference_time);
      multiplier:=public.travel_effective_multiplier(segment.weather_snapshot->>'category',(segment.weather_snapshot->>'windSpeedKmh')::numeric,day_now,segment.modifiers->>'season'); remaining:=segment.distance_km*(1-fraction);
      update public.delivery_route_segments set modifiers=jsonb_set(modifiers,'{weather}',to_jsonb(multiplier)),effective_speed_kmh=greatest(item.animal_speed_kmh*.60,least(item.animal_speed_kmh*1.25,item.animal_speed_kmh*multiplier)),estimated_end_at=reference_time+(remaining/nullif(greatest(item.animal_speed_kmh*.60,least(item.animal_speed_kmh*1.25,item.animal_speed_kmh*multiplier)),0))*interval '1 hour',updated_at=reference_time where id=segment.id;
    end if;
    update public.deliveries set travel_weather_summary=coalesce(travel_weather_summary,'{}'::jsonb)||jsonb_build_object('currentDaylight',jsonb_build_object('isDay',day_now,'observedAt',reference_time,'source','astronomical'),'isDay',day_now),updated_at=reference_time where id=item.id; total:=total+1;
  end loop; delete from public.weather_forecast_cache where queried_at<reference_time-interval '30 days'; return total;
end $$;
revoke all on function public.resolve_travel_progress(timestamptz) from public,anon,authenticated;
grant execute on function public.resolve_travel_progress(timestamptz) to service_role;
do $$ begin
  perform cron.unschedule(jobid) from cron.job where jobname in ('duif-segmented-travel-resolver','duif-live-daylight-resolver');
  if exists(select 1 from cron.job where jobname='duif-travel-progress-resolver') then perform cron.unschedule('duif-travel-progress-resolver'); end if;
  perform cron.schedule('duif-travel-progress-resolver','* * * * *',$job$select public.resolve_travel_progress(now())$job$);
end $$;
