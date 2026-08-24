-- Qualify RPC parameters so PostgreSQL never confuses them with cache columns.
create or replace function public.apply_weather_forecast(cell_latitude numeric,cell_longitude numeric,block_start timestamptz,weather_code integer,is_day boolean,wind_speed_kmh numeric,wind_gust_kmh numeric,source text default 'openMeteo') returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare changed integer; segment record; segment_season text; multiplier numeric; weather_category text;
begin
  if auth.role()<>'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
  weather_category:=public.travel_weather_category(apply_weather_forecast.weather_code);
  insert into public.weather_forecast_cache(cell_latitude,cell_longitude,block_start,weather_code,category,is_day,wind_speed_kmh,wind_gust_kmh,source,queried_at,expires_at)
  values(apply_weather_forecast.cell_latitude,apply_weather_forecast.cell_longitude,apply_weather_forecast.block_start,apply_weather_forecast.weather_code,weather_category,apply_weather_forecast.is_day,apply_weather_forecast.wind_speed_kmh,apply_weather_forecast.wind_gust_kmh,apply_weather_forecast.source,now(),now()+interval '6 hours')
  on conflict on constraint weather_forecast_cache_pkey do update
  set weather_code=excluded.weather_code,category=excluded.category,is_day=excluded.is_day,wind_speed_kmh=excluded.wind_speed_kmh,wind_gust_kmh=excluded.wind_gust_kmh,source=excluded.source,queried_at=excluded.queried_at,expires_at=excluded.expires_at;
  changed:=0;
  for segment in
    select route_segment.*,delivery.origin_latitude,delivery.origin_longitude,delivery.destination_latitude,delivery.destination_longitude,delivery.animal_speed_kmh,delivery.travel_modifiers
    from public.delivery_route_segments route_segment
    join public.deliveries delivery on delivery.id=route_segment.delivery_id
    where route_segment.state='planned'
      and route_segment.estimated_start_at>now()
      and date_bin(interval '3 hours',route_segment.estimated_start_at,timestamptz '2000-01-01')=apply_weather_forecast.block_start
      and round((case when route_segment.leg='outbound' then delivery.origin_latitude+(delivery.destination_latitude-delivery.origin_latitude)*((route_segment.route_fraction_start+route_segment.route_fraction_end)/2) else delivery.destination_latitude+(delivery.origin_latitude-delivery.destination_latitude)*((route_segment.route_fraction_start+route_segment.route_fraction_end)/2) end)*2)/2=apply_weather_forecast.cell_latitude
      and round((case when route_segment.leg='outbound' then delivery.origin_longitude+(delivery.destination_longitude-delivery.origin_longitude)*((route_segment.route_fraction_start+route_segment.route_fraction_end)/2) else delivery.destination_longitude+(delivery.origin_longitude-delivery.destination_longitude)*((route_segment.route_fraction_start+route_segment.route_fraction_end)/2) end)*2)/2=apply_weather_forecast.cell_longitude
    for update of route_segment
  loop
    segment_season:=segment.modifiers->>'season';
    multiplier:=public.travel_effective_multiplier(weather_category,apply_weather_forecast.wind_speed_kmh,apply_weather_forecast.is_day,segment_season);
    update public.delivery_route_segments
    set weather_source=apply_weather_forecast.source,
      weather_snapshot=jsonb_build_object('weatherCode',apply_weather_forecast.weather_code,'category',weather_category,'isDay',apply_weather_forecast.is_day,'windSpeedKmh',apply_weather_forecast.wind_speed_kmh,'windGustKmh',apply_weather_forecast.wind_gust_kmh,'observedAt',apply_weather_forecast.block_start),
      modifiers=jsonb_set(modifiers,'{weather}',to_jsonb(multiplier)),
      effective_speed_kmh=greatest(segment.animal_speed_kmh*.60,least(segment.animal_speed_kmh*1.25,segment.animal_speed_kmh*coalesce((segment.travel_modifiers->>(case when segment.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1)*multiplier)),
      estimated_end_at=estimated_start_at+((distance_km/nullif(greatest(segment.animal_speed_kmh*.60,least(segment.animal_speed_kmh*1.25,segment.animal_speed_kmh*multiplier)),0))*interval '1 hour'),updated_at=now()
    where id=segment.id;
    changed:=changed+1;
    perform public.resolve_delivery_route_segments(segment.delivery_id,now());
  end loop;
  return changed;
end $$;

revoke all on function public.apply_weather_forecast(numeric,numeric,timestamptz,integer,boolean,numeric,numeric,text) from public,anon,authenticated;
grant execute on function public.apply_weather_forecast(numeric,numeric,timestamptz,integer,boolean,numeric,numeric,text) to service_role;
