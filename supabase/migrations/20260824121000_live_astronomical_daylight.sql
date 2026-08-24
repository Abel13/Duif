-- Milestone 55 v2: new journeys use astronomical daylight; existing journeys retain v1 snapshots.
create table public.delivery_route_daylight_windows (
  id uuid primary key default gen_random_uuid(), delivery_id uuid not null references public.deliveries(id) on delete cascade,
  segment_id uuid not null references public.delivery_route_segments(id) on delete cascade,
  is_day boolean not null, started_at timestamptz not null, ended_at timestamptz,
  created_at timestamptz not null default now(), check (ended_at is null or ended_at > started_at)
);
create unique index delivery_route_daylight_open_idx on public.delivery_route_daylight_windows(segment_id) where ended_at is null;
alter table public.delivery_route_daylight_windows enable row level security;
revoke all on public.delivery_route_daylight_windows from public,anon,authenticated;

create or replace function public.astronomical_is_day(at_time timestamptz, latitude numeric, longitude numeric) returns boolean
language plpgsql immutable set search_path='' as $$
declare day_number numeric; minute_of_day numeric; gamma numeric; equation numeric; declination numeric; solar_minutes numeric; hour_angle numeric; elevation numeric;
begin
  day_number:=extract(doy from at_time at time zone 'UTC'); minute_of_day:=extract(hour from at_time at time zone 'UTC')*60+extract(minute from at_time at time zone 'UTC')+extract(second from at_time at time zone 'UTC')/60;
  gamma:=2*pi()/365*(day_number-1+(minute_of_day-720)/1440);
  equation:=229.18*(.000075+.001868*cos(gamma)-.032077*sin(gamma)-.014615*cos(2*gamma)-.040849*sin(2*gamma));
  declination:=.006918-.399912*cos(gamma)+.070257*sin(gamma)-.006758*cos(2*gamma)+.000907*sin(2*gamma)-.002697*cos(3*gamma)+.00148*sin(3*gamma);
  solar_minutes:=mod(mod(minute_of_day+equation+4*longitude,1440)+1440,1440); hour_angle:=radians(solar_minutes/4-180);
  elevation:=degrees(asin(sin(radians(latitude))*sin(declination)+cos(radians(latitude))*cos(declination)*cos(hour_angle)));
  return elevation>=-.833;
end $$;

create or replace function public.virtual_travel_weather(delivery_id uuid, leg text, segment_index integer, block_start timestamptz, latitude numeric, longitude numeric) returns jsonb
language plpgsql immutable set search_path=public as $$
declare seed bigint; code integer;
begin
  seed:=('x'||substr(md5('travel-weather-v1|'||delivery_id||'|'||leg||'|'||segment_index||'|'||date_trunc('hour',block_start)),1,15))::bit(60)::bigint;
  code:=(array[0,1,2,3,45,51,61,63,71,80,95])[(seed%11)+1];
  return jsonb_build_object('weatherCode',code,'category',public.travel_weather_category(code),'isDay',public.astronomical_is_day(block_start,latitude,longitude),'windSpeedKmh',(seed%56)::numeric,'windGustKmh',((seed%56)+(seed%20))::numeric,'observedAt',block_start,'hashVersion',2);
end $$;

create or replace function public.initialize_live_daylight_windows() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare segment record;
begin
  if new.is_tutorial or new.travel_rules_snapshot is null then return new; end if;
  update public.deliveries set travel_rules_snapshot=jsonb_set(travel_rules_snapshot,'{version}','2'::jsonb) where id=new.id;
  for segment in select id,weather_snapshot,estimated_start_at from public.delivery_route_segments where delivery_id=new.id loop
    insert into public.delivery_route_daylight_windows(delivery_id,segment_id,is_day,started_at) values(new.id,segment.id,coalesce((segment.weather_snapshot->>'isDay')::boolean,true),segment.estimated_start_at);
  end loop;
  return new;
end $$;
create trigger zz_initialize_live_daylight_windows after insert on public.deliveries for each row execute function public.initialize_live_daylight_windows();

create or replace function public.resolve_live_delivery_daylight(reference_time timestamptz default now()) returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare item record; position_fraction numeric; latitude numeric; longitude numeric; is_day_now boolean; prior boolean; multiplier numeric; remaining numeric; changed integer:=0;
begin
  for item in select s.*,d.origin_latitude,d.origin_longitude,d.destination_latitude,d.destination_longitude,d.animal_speed_kmh,d.travel_rules_snapshot from public.delivery_route_segments s join public.deliveries d on d.id=s.delivery_id where s.state='active' and d.travel_rules_snapshot->>'version'='2' loop
    position_fraction:=least(1,greatest(0,extract(epoch from reference_time-item.estimated_start_at)/nullif(extract(epoch from item.estimated_end_at-item.estimated_start_at),0)));
    if item.leg='outbound' then latitude:=item.origin_latitude+(item.destination_latitude-item.origin_latitude)*(item.route_fraction_start+(item.route_fraction_end-item.route_fraction_start)*position_fraction); longitude:=item.origin_longitude+(item.destination_longitude-item.origin_longitude)*(item.route_fraction_start+(item.route_fraction_end-item.route_fraction_start)*position_fraction); else latitude:=item.destination_latitude+(item.origin_latitude-item.destination_latitude)*(item.route_fraction_start+(item.route_fraction_end-item.route_fraction_start)*position_fraction); longitude:=item.destination_longitude+(item.origin_longitude-item.destination_longitude)*(item.route_fraction_start+(item.route_fraction_end-item.route_fraction_start)*position_fraction); end if;
    is_day_now:=public.astronomical_is_day(reference_time,latitude,longitude); select is_day into prior from public.delivery_route_daylight_windows where segment_id=item.id and ended_at is null;
    if prior is distinct from is_day_now then update public.delivery_route_daylight_windows set ended_at=reference_time where segment_id=item.id and ended_at is null; insert into public.delivery_route_daylight_windows(delivery_id,segment_id,is_day,started_at) values(item.delivery_id,item.id,is_day_now,reference_time); end if;
    multiplier:=public.travel_effective_multiplier(item.weather_snapshot->>'category',(item.weather_snapshot->>'windSpeedKmh')::numeric,is_day_now,item.modifiers->>'season');
    remaining:=item.distance_km*(1-position_fraction); update public.delivery_route_segments set modifiers=jsonb_set(modifiers,'{weather}',to_jsonb(multiplier)),effective_speed_kmh=greatest(item.animal_speed_kmh*.60,least(item.animal_speed_kmh*1.25,item.animal_speed_kmh*multiplier)),estimated_end_at=reference_time+(remaining/nullif(greatest(item.animal_speed_kmh*.60,least(item.animal_speed_kmh*1.25,item.animal_speed_kmh*multiplier)),0))*interval '1 hour',updated_at=reference_time where id=item.id;
    update public.deliveries set travel_weather_summary=coalesce(travel_weather_summary,'{}'::jsonb)||jsonb_build_object('currentDaylight',jsonb_build_object('isDay',is_day_now,'observedAt',reference_time,'source','astronomical'),'isDay',is_day_now,'conditionImpactMultiplier',multiplier),updated_at=reference_time where id=item.delivery_id; changed:=changed+1;
  end loop; return changed;
end $$;
revoke all on function public.resolve_live_delivery_daylight(timestamptz) from public,anon,authenticated;
grant execute on function public.resolve_live_delivery_daylight(timestamptz) to service_role;
do $$ begin if exists(select 1 from cron.job where jobname='duif-live-daylight-resolver') then perform cron.unschedule('duif-live-daylight-resolver'); end if; perform cron.schedule('duif-live-daylight-resolver','* * * * *',$job$select public.resolve_live_delivery_daylight(now())$job$); end $$;
