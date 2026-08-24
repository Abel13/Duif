-- Expose cache hits only to the service role so the Edge Function avoids duplicate provider calls.
create or replace function public.pending_weather_forecast_requests(reference_time timestamptz default now())
returns table(cell_latitude numeric,cell_longitude numeric,block_start timestamptz,cached_weather_code integer,cached_is_day boolean,cached_wind_speed_kmh numeric,cached_wind_gust_kmh numeric,cached_source text)
language sql security definer set search_path=public,pg_temp as $$
  with requested as (
    select distinct round((case when s.leg='outbound' then d.origin_latitude+(d.destination_latitude-d.origin_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_latitude+(d.origin_latitude-d.destination_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2 lat,
      round((case when s.leg='outbound' then d.origin_longitude+(d.destination_longitude-d.origin_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_longitude+(d.origin_longitude-d.destination_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2 lon,
      date_bin(interval '3 hours',s.estimated_start_at,timestamptz '2000-01-01') block
    from public.delivery_route_segments s join public.deliveries d on d.id=s.delivery_id
    where s.state='planned' and s.estimated_start_at between reference_time and reference_time+interval '72 hours'
  )
  select r.lat,r.lon,r.block,c.weather_code,c.is_day,c.wind_speed_kmh,c.wind_gust_kmh,c.source
  from requested r left join public.weather_forecast_cache c on c.cell_latitude=r.lat and c.cell_longitude=r.lon and c.block_start=r.block and c.expires_at>reference_time
  where auth.role()='service_role'
$$;
revoke all on function public.pending_weather_forecast_requests(timestamptz) from public,anon,authenticated;
grant execute on function public.pending_weather_forecast_requests(timestamptz) to service_role;
