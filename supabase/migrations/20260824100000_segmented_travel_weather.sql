-- Milestone 55: authoritative segmented travel and provider-independent weather snapshots.
create table public.weather_forecast_cache (
  cell_latitude numeric(5,1) not null,
  cell_longitude numeric(5,1) not null,
  block_start timestamptz not null,
  weather_code integer not null check (weather_code between 0 and 99),
  category text not null check (category in ('clear','partlyCloudy','cloudy','fogDrizzle','rain','snow','heavyFreezingRain','thunderstorm')),
  is_day boolean not null,
  wind_speed_kmh numeric not null check (wind_speed_kmh >= 0),
  wind_gust_kmh numeric not null check (wind_gust_kmh >= 0),
  source text not null check (source in ('openMeteo','virtual')),
  queried_at timestamptz not null default now(),
  expires_at timestamptz not null,
  primary key (cell_latitude, cell_longitude, block_start)
);

alter table public.weather_forecast_cache enable row level security;
revoke all on public.weather_forecast_cache from anon, authenticated;

create table public.delivery_route_segments (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  leg text not null check (leg in ('outbound','return')),
  segment_index integer not null check (segment_index >= 0 and segment_index < 24),
  route_fraction_start numeric not null check (route_fraction_start >= 0 and route_fraction_start < 1),
  route_fraction_end numeric not null check (route_fraction_end > 0 and route_fraction_end <= 1),
  distance_km numeric not null check (distance_km > 0),
  estimated_start_at timestamptz not null,
  estimated_end_at timestamptz not null,
  state text not null default 'planned' check (state in ('planned','active','completed')),
  weather_source text not null check (weather_source in ('openMeteo','virtual')),
  weather_snapshot jsonb not null,
  modifiers jsonb not null,
  effective_speed_kmh numeric not null check (effective_speed_kmh > 0),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (delivery_id, leg, segment_index),
  check (route_fraction_end > route_fraction_start),
  check (estimated_end_at > estimated_start_at),
  check ((state = 'completed') = (completed_at is not null))
);

create index delivery_route_segments_due_idx on public.delivery_route_segments(state, estimated_start_at, estimated_end_at);
alter table public.delivery_route_segments enable row level security;
revoke all on public.delivery_route_segments from anon, authenticated;

alter table public.deliveries
  add column travel_rules_snapshot jsonb,
  add column travel_weather_summary jsonb;

comment on column public.deliveries.travel_weather_summary is 'Public aggregate only: no route cells, coordinates, or future forecast.';

create or replace function public.travel_weather_category(weather_code integer) returns text
language sql immutable set search_path = '' as $$
  select case
    when weather_code = 0 then 'clear' when weather_code in (1,2) then 'partlyCloudy'
    when weather_code = 3 then 'cloudy' when weather_code in (45,48,51,53,55) then 'fogDrizzle'
    when weather_code in (56,57,65,66,67,82) then 'heavyFreezingRain'
    when weather_code in (71,73,75,77,85,86) then 'snow'
    when weather_code in (95,96,99) then 'thunderstorm' else 'rain' end
$$;

create or replace function public.travel_season(at_time timestamptz, latitude numeric) returns text
language sql immutable set search_path = '' as $$
  with northern as (select (array['winter','spring','summer','autumn'])[floor((extract(month from at_time at time zone 'UTC')-1)/3)::int+1] value)
  select case when latitude >= 0 then value else case value when 'winter' then 'summer' when 'spring' then 'autumn' when 'summer' then 'winter' else 'spring' end end from northern
$$;

create or replace function public.virtual_travel_weather(delivery_id uuid, leg text, segment_index integer, block_start timestamptz, latitude numeric, longitude numeric) returns jsonb
language plpgsql immutable set search_path = '' as $$
declare seed bigint; code integer; local_hour integer;
begin
  seed := ('x'||substr(md5('travel-weather-v1|'||delivery_id||'|'||leg||'|'||segment_index||'|'||date_trunc('hour',block_start)),1,15))::bit(60)::bigint;
  code := (array[0,1,2,3,45,51,61,63,71,80,95])[(seed % 11)+1];
  local_hour := ((extract(hour from block_start at time zone 'UTC')::integer + round(longitude/15)::integer) % 24 + 24) % 24;
  return jsonb_build_object('weatherCode',code,'category',public.travel_weather_category(code),'isDay',local_hour between 6 and 17,
    'windSpeedKmh',(seed % 56)::numeric,'windGustKmh',((seed % 56)+(seed % 20))::numeric,'observedAt',block_start,'hashVersion',1);
end $$;

create or replace function public.travel_effective_multiplier(category text, wind_speed numeric, is_day boolean, season text) returns numeric
language sql immutable set search_path = '' as $$
  with parts as (select case category when 'clear' then .02 when 'partlyCloudy' then .01 when 'cloudy' then 0 when 'fogDrizzle' then -.02 when 'rain' then -.04 when 'snow' then -.05 when 'heavyFreezingRain' then -.06 else -.08 end weather,
    case when wind_speed >= 50 then -.04 when wind_speed >= 30 then -.02 else 0 end wind,
    case when is_day then 0 else -.02 end night,
    case season when 'summer' then .01 when 'winter' then -.02 else 0 end seasonal)
  select greatest(.60,least(1.25,1+greatest(-.08,least(.02,weather+wind))+night+seasonal)) from parts
$$;

create or replace function public.initialize_delivery_route_segments() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare leg_name text; leg_start timestamptz; leg_end timestamptz; leg_multiplier numeric; segment_count integer; idx integer; segment_start timestamptz; midpoint timestamptz; lat numeric; lon numeric; weather jsonb; season text; climate numeric; duration interval; stop_duration interval;
begin
  if new.is_tutorial or new.distance_km <= 0 or new.return_start_at is null or new.return_arrival_at is null then return new; end if;
  stop_duration := new.return_start_at-new.outbound_arrival_at;
  update public.deliveries set travel_rules_snapshot=jsonb_build_object('version',1,'segmentTargetHours',6,'maxSegmentsPerLeg',24,'forecastWindowHours',72,'weatherRange',jsonb_build_array(-.08,.02),'speedClamp',jsonb_build_array(.60,1.25),'familiarityMultiplier',1,'destinationStopSeconds',extract(epoch from stop_duration)::integer) where id=new.id;
  foreach leg_name in array array['outbound','return'] loop
    if leg_name='outbound' then leg_start:=new.outbound_start_at; leg_end:=new.outbound_arrival_at; leg_multiplier:=coalesce((new.travel_modifiers->>'outboundSpeedMultiplier')::numeric,1); else leg_start:=new.return_start_at; leg_end:=new.return_arrival_at; leg_multiplier:=coalesce((new.travel_modifiers->>'returnSpeedMultiplier')::numeric,1); end if;
    segment_count:=least(24,greatest(1,ceil(extract(epoch from (leg_end-leg_start))/21600)::integer)); segment_start:=leg_start;
    for idx in 0..segment_count-1 loop
      midpoint:=leg_start+(leg_end-leg_start)*((idx+.5)/segment_count);
      if leg_name='outbound' then lat:=new.origin_latitude+(new.destination_latitude-new.origin_latitude)*((idx+.5)/segment_count); lon:=new.origin_longitude+(new.destination_longitude-new.origin_longitude)*((idx+.5)/segment_count); else lat:=new.destination_latitude+(new.origin_latitude-new.destination_latitude)*((idx+.5)/segment_count); lon:=new.destination_longitude+(new.origin_longitude-new.destination_longitude)*((idx+.5)/segment_count); end if;
      weather:=public.virtual_travel_weather(new.id,leg_name,idx,date_bin(interval '3 hours',midpoint,timestamptz '2000-01-01'),lat,lon); season:=public.travel_season(midpoint,lat); climate:=public.travel_effective_multiplier(weather->>'category',(weather->>'windSpeedKmh')::numeric,(weather->>'isDay')::boolean,season);
      duration:=((leg_end-leg_start)/segment_count)/climate;
      insert into public.delivery_route_segments(delivery_id,leg,segment_index,route_fraction_start,route_fraction_end,distance_km,estimated_start_at,estimated_end_at,weather_source,weather_snapshot,modifiers,effective_speed_kmh)
      values(new.id,leg_name,idx,idx::numeric/segment_count,(idx+1)::numeric/segment_count,new.distance_km/segment_count,segment_start,segment_start+duration,'virtual',weather,jsonb_build_object('weather',climate,'night',case when (weather->>'isDay')::boolean then 1 else .98 end,'season',season,'mascot',leg_multiplier,'equipment',1,'backpack',1,'skills',1,'familiarity',1),greatest(new.animal_speed_kmh*.60,least(new.animal_speed_kmh*1.25,new.animal_speed_kmh*leg_multiplier*climate)));
      segment_start:=segment_start+duration;
    end loop;
    if leg_name='outbound' then update public.deliveries set outbound_arrival_at=segment_start,return_start_at=segment_start+stop_duration where id=new.id; else update public.deliveries set return_arrival_at=segment_start where id=new.id; end if;
  end loop;
  perform public.resolve_delivery_route_segments(new.id,clock_timestamp());
  return new;
end $$;

create or replace function public.resolve_delivery_route_segments(target_delivery_id uuid, at_time timestamptz default now()) returns jsonb
language plpgsql security definer set search_path = public, pg_temp as $$
declare d public.deliveries%rowtype; current_segment public.delivery_route_segments%rowtype; total_count integer; stop_seconds integer; outbound_end timestamptz; return_begin timestamptz; return_end timestamptz; cursor_time timestamptz; s record;
begin
  perform pg_advisory_xact_lock(hashtextextended(target_delivery_id::text,55)); select * into d from public.deliveries where id=target_delivery_id for update;
  if not found or d.is_tutorial then return null; end if;
  update public.delivery_route_segments set state='completed',completed_at=estimated_end_at,updated_at=at_time where delivery_id=d.id and state<>'completed' and estimated_end_at<=at_time;
  update public.delivery_route_segments set state=case when estimated_start_at<=at_time then 'active' else 'planned' end,updated_at=at_time where delivery_id=d.id and state<>'completed';
  stop_seconds:=coalesce((d.travel_rules_snapshot->>'destinationStopSeconds')::integer,1800);
  select max(estimated_end_at) into outbound_end from public.delivery_route_segments where delivery_id=d.id and leg='outbound'; return_begin:=outbound_end+make_interval(secs=>stop_seconds);
  cursor_time:=return_begin;
  for s in select * from public.delivery_route_segments where delivery_id=d.id and leg='return' and state='planned' order by segment_index for update loop
    update public.delivery_route_segments set estimated_start_at=cursor_time,estimated_end_at=cursor_time+(s.estimated_end_at-s.estimated_start_at),updated_at=at_time where id=s.id; cursor_time:=cursor_time+(s.estimated_end_at-s.estimated_start_at);
  end loop;
  select max(estimated_end_at) into return_end from public.delivery_route_segments where delivery_id=d.id and leg='return';
  select * into current_segment from public.delivery_route_segments where delivery_id=d.id and state<>'completed' order by estimated_start_at limit 1;
  if current_segment.id is null then select * into current_segment from public.delivery_route_segments where delivery_id=d.id order by estimated_end_at desc limit 1; end if;
  select count(*) into total_count from public.delivery_route_segments where delivery_id=d.id;
  update public.deliveries set outbound_arrival_at=outbound_end,return_start_at=return_begin,return_arrival_at=return_end,
    travel_weather_summary=jsonb_build_object('estimatedArrivalAt',case when current_segment.leg='outbound' then outbound_end else return_end end,'currentSegmentIndex',current_segment.segment_index,'segmentCount',total_count,'currentWeather',jsonb_build_object('category',current_segment.weather_snapshot->>'category','source',current_segment.weather_source,'observedAt',current_segment.weather_snapshot->>'observedAt'),'season',current_segment.modifiers->>'season','effectiveSpeedMultiplier',round(current_segment.effective_speed_kmh/nullif(d.animal_speed_kmh,0),4),'rulesVersion',1),updated_at=at_time where id=d.id;
  return (select travel_weather_summary from public.deliveries where id=d.id);
end $$;

create trigger initialize_delivery_route_segments_after_insert after insert on public.deliveries for each row execute function public.initialize_delivery_route_segments();

create or replace function public.pending_weather_forecast_cells(reference_time timestamptz default now()) returns table(cell_latitude numeric,cell_longitude numeric,block_start timestamptz)
language sql security definer set search_path = public, pg_temp as $$
  select distinct round((case when s.leg='outbound' then d.origin_latitude+(d.destination_latitude-d.origin_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_latitude+(d.origin_latitude-d.destination_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2,
    round((case when s.leg='outbound' then d.origin_longitude+(d.destination_longitude-d.origin_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_longitude+(d.origin_longitude-d.destination_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2,
    date_bin(interval '3 hours',s.estimated_start_at,timestamptz '2000-01-01')
  from public.delivery_route_segments s join public.deliveries d on d.id=s.delivery_id
  where auth.role()='service_role' and s.state='planned' and s.estimated_start_at between reference_time and reference_time+interval '72 hours'
    and not exists(select 1 from public.weather_forecast_cache c where c.cell_latitude=round((case when s.leg='outbound' then d.origin_latitude+(d.destination_latitude-d.origin_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_latitude+(d.origin_latitude-d.destination_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2 and c.cell_longitude=round((case when s.leg='outbound' then d.origin_longitude+(d.destination_longitude-d.origin_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_longitude+(d.origin_longitude-d.destination_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2 and c.block_start=date_bin(interval '3 hours',s.estimated_start_at,timestamptz '2000-01-01') and c.expires_at>reference_time)
$$;

create or replace function public.apply_weather_forecast(cell_latitude numeric,cell_longitude numeric,block_start timestamptz,weather_code integer,is_day boolean,wind_speed_kmh numeric,wind_gust_kmh numeric,source text default 'openMeteo') returns integer
language plpgsql security definer set search_path = public, pg_temp as $$
declare changed integer; s record; season text; multiplier numeric; new_start timestamptz; category text;
begin
  if auth.role()<>'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
  category:=public.travel_weather_category(weather_code);
  insert into public.weather_forecast_cache values(cell_latitude,cell_longitude,block_start,weather_code,category,is_day,wind_speed_kmh,wind_gust_kmh,source,now(),now()+interval '6 hours') on conflict (cell_latitude,cell_longitude,block_start) do update set weather_code=excluded.weather_code,category=excluded.category,is_day=excluded.is_day,wind_speed_kmh=excluded.wind_speed_kmh,wind_gust_kmh=excluded.wind_gust_kmh,source=excluded.source,queried_at=excluded.queried_at,expires_at=excluded.expires_at;
  changed:=0;
  for s in select s.*,d.origin_latitude,d.origin_longitude,d.destination_latitude,d.destination_longitude,d.animal_speed_kmh,d.travel_modifiers from public.delivery_route_segments s join public.deliveries d on d.id=s.delivery_id where s.state='planned' and s.estimated_start_at>now() and date_bin(interval '3 hours',s.estimated_start_at,timestamptz '2000-01-01')=block_start and round((case when s.leg='outbound' then d.origin_latitude+(d.destination_latitude-d.origin_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_latitude+(d.origin_latitude-d.destination_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2=cell_latitude and round((case when s.leg='outbound' then d.origin_longitude+(d.destination_longitude-d.origin_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_longitude+(d.origin_longitude-d.destination_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2=cell_longitude for update of s loop
    season:=s.modifiers->>'season'; multiplier:=public.travel_effective_multiplier(category,wind_speed_kmh,is_day,season);
    update public.delivery_route_segments set weather_source=source,weather_snapshot=jsonb_build_object('weatherCode',weather_code,'category',category,'isDay',is_day,'windSpeedKmh',wind_speed_kmh,'windGustKmh',wind_gust_kmh,'observedAt',block_start),modifiers=jsonb_set(modifiers,'{weather}',to_jsonb(multiplier)),effective_speed_kmh=greatest(s.animal_speed_kmh*.60,least(s.animal_speed_kmh*1.25,s.animal_speed_kmh*coalesce((s.travel_modifiers->>(case when s.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1)*multiplier)),estimated_end_at=estimated_start_at+((distance_km/nullif(greatest(s.animal_speed_kmh*.60,least(s.animal_speed_kmh*1.25,s.animal_speed_kmh*multiplier)),0))*interval '1 hour'),updated_at=now() where id=s.id; changed:=changed+1;
    perform public.resolve_delivery_route_segments(s.delivery_id,now());
  end loop;
  return changed;
end $$;

create or replace function public.resolve_due_delivery_route_segments(reference_time timestamptz default now()) returns integer language plpgsql security definer set search_path=public,pg_temp as $$ declare item record; total integer:=0; begin if auth.role()<>'service_role' then raise exception 'Forbidden' using errcode='42501'; end if; for item in select distinct delivery_id from public.delivery_route_segments where state<>'completed' and estimated_start_at<=reference_time loop perform public.resolve_delivery_route_segments(item.delivery_id,reference_time); total:=total+1; end loop; delete from public.weather_forecast_cache where queried_at<reference_time-interval '30 days'; return total; end $$;

revoke all on function public.pending_weather_forecast_cells(timestamptz),public.apply_weather_forecast(numeric,numeric,timestamptz,integer,boolean,numeric,numeric,text),public.resolve_due_delivery_route_segments(timestamptz) from public,anon,authenticated;
grant execute on function public.pending_weather_forecast_cells(timestamptz),public.apply_weather_forecast(numeric,numeric,timestamptz,integer,boolean,numeric,numeric,text),public.resolve_due_delivery_route_segments(timestamptz) to service_role;
