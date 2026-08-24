-- Milestone 56 corrective slice: temperature-aware hazards and declarative utility effects.
alter table public.weather_forecast_cache add column temperature_c numeric check (temperature_c between -90 and 70);

alter table public.equipment_catalog drop constraint if exists equipment_catalog_condition_check;
alter table public.equipment_catalog add constraint equipment_catalog_condition_check check (condition is null or condition in ('rain','night','wind','cold','heat'));

create table public.equipment_catalog_effects (
  catalog_id uuid not null references public.equipment_catalog(id) on delete cascade,
  hazard_key text not null check (hazard_key ~ '^[a-z][A-Za-z0-9]{1,31}$'),
  mitigation_points numeric not null check (mitigation_points > 0 and mitigation_points <= .08),
  sort_order integer not null default 0,
  primary key (catalog_id,hazard_key)
);
alter table public.equipment_catalog_effects enable row level security;
create policy "Active equipment effects are readable" on public.equipment_catalog_effects for select to authenticated
using (exists(select 1 from public.equipment_catalog c where c.id=catalog_id and c.status='active'));
grant select on public.equipment_catalog_effects to authenticated;

insert into public.equipment_catalog_effects(catalog_id,hazard_key,mitigation_points,sort_order)
select c.id,e.hazard,e.points,e.position from public.equipment_catalog c join (values
  ('utility-raincoat','wet',.03::numeric,10),
  ('utility-route-lantern','night',.02::numeric,10),('utility-route-lantern','visibility',.01::numeric,20),
  ('utility-wind-goggles','wind',.02::numeric,10)
) e(catalog_key,hazard,points,position) on e.catalog_key=c.catalog_key
on conflict do nothing;

insert into public.equipment_catalog(catalog_key,name_key,description_key,kind,condition,seed_price,max_uses,repair_seed_price,slot_bonus,speed_multiplier,mitigation_points,asset_key,sort_order)
values
 ('utility-crimson-courier-scarf','shop.items.crimsonCourierScarf.name','shop.items.crimsonCourierScarf.description','utility','cold',200,10,80,0,1,.03,'shop.thumbnail.crimsonCourierScarf',70),
 ('utility-meadow-post-cap','shop.items.meadowPostCap.name','shop.items.meadowPostCap.description','utility','heat',200,10,80,0,1,.03,'shop.thumbnail.meadowPostCap',80)
on conflict(catalog_key) do update set status='active',seed_price=excluded.seed_price,max_uses=excluded.max_uses,repair_seed_price=excluded.repair_seed_price,sort_order=excluded.sort_order;

insert into public.equipment_catalog_effects(catalog_id,hazard_key,mitigation_points,sort_order)
select c.id,e.hazard,e.points,e.position from public.equipment_catalog c join (values
  ('utility-crimson-courier-scarf','cold',.03::numeric,10),('utility-crimson-courier-scarf','wind',.01::numeric,20),('utility-crimson-courier-scarf','winterCold',.01::numeric,30),
  ('utility-meadow-post-cap','heat',.03::numeric,10),('utility-meadow-post-cap','strongSun',.01::numeric,20),('utility-meadow-post-cap','summerHeat',.01::numeric,30)
) e(catalog_key,hazard,points,position) on e.catalog_key=c.catalog_key
on conflict do nothing;

alter table public.delivery_equipment_activations add column if not exists applied_effects jsonb not null default '[]'::jsonb;

create or replace function public.travel_environment_v2(category text,wind_speed numeric,is_day boolean,season text,temperature_c numeric)
returns jsonb language plpgsql immutable set search_path='' as $$
declare weather numeric; wind numeric:=0; cold numeric:=0; heat numeric:=0; seasonal numeric:=0; sun numeric:=0; hazards jsonb:='{}'::jsonb; result numeric;
begin
 weather:=case category when 'clear' then .02 when 'partlyCloudy' then .01 when 'cloudy' then 0 when 'fogDrizzle' then -.02 when 'rain' then -.04 when 'snow' then -.05 when 'heavyFreezingRain' then -.06 else -.08 end;
 if category='fogDrizzle' then hazards:=hazards||jsonb_build_object('wet',.01,'visibility',.01);
 elsif category='rain' then hazards:=hazards||jsonb_build_object('wet',.04);
 elsif category='heavyFreezingRain' then hazards:=hazards||jsonb_build_object('wet',.06);
 elsif category='thunderstorm' then hazards:=hazards||jsonb_build_object('wet',.08); end if;
 if wind_speed>=50 then wind:=-.04; hazards:=hazards||jsonb_build_object('wind',.04); elsif wind_speed>=30 then wind:=-.02; hazards:=hazards||jsonb_build_object('wind',.02); end if;
 if not is_day then hazards:=hazards||jsonb_build_object('night',.02); end if;
 if temperature_c<3 then cold:=-.04; hazards:=hazards||jsonb_build_object('cold',.04); elsif temperature_c<10 then cold:=-.02; hazards:=hazards||jsonb_build_object('cold',.02); end if;
 if temperature_c>=34 then heat:=-.04; hazards:=hazards||jsonb_build_object('heat',.04); elsif temperature_c>=27 then heat:=-.02; hazards:=hazards||jsonb_build_object('heat',.02); end if;
 if season='winter' and temperature_c<10 then seasonal:=-.01; hazards:=hazards||jsonb_build_object('winterCold',.01);
 elsif season='summer' and temperature_c>=27 then seasonal:=-.01; hazards:=hazards||jsonb_build_object('summerHeat',.01); end if;
 if is_day and temperature_c>=27 and category in ('clear','partlyCloudy') then sun:=-.01; hazards:=hazards||jsonb_build_object('strongSun',.01); end if;
 result:=greatest(.60,least(1.25,1+greatest(-.08,least(.02,weather+wind))+(case when is_day then 0 else -.02 end)+cold+heat+seasonal+sun));
 return jsonb_build_object('multiplier',result,'hazards',hazards);
end $$;

create or replace function public.virtual_travel_weather_v2(delivery_id uuid,leg text,segment_index integer,block_start timestamptz,latitude numeric,longitude numeric)
returns jsonb language plpgsql immutable set search_path='' as $$
declare seed bigint; code integer; season text; baseline numeric; temperature numeric;
begin
 seed:=('x'||substr(md5('travel-weather-v2|'||delivery_id||'|'||leg||'|'||segment_index||'|'||date_trunc('hour',block_start)),1,15))::bit(60)::bigint;
 code:=(array[0,1,2,3,45,51,61,63,71,80,95])[(seed%11)+1]; season:=public.travel_season(block_start,latitude);
 baseline:=case season when 'summer' then 27 when 'winter' then 9 else 18 end-abs(latitude)/18;
 temperature:=greatest(-35,least(48,baseline+((seed/97)%180)::numeric/10-9));
 return jsonb_build_object('weatherCode',code,'category',public.travel_weather_category(code),'isDay',public.astronomical_is_day(block_start,latitude,longitude),'windSpeedKmh',(seed%56)::numeric,'windGustKmh',((seed%56)+(seed%20))::numeric,'temperatureC',round(temperature,1),'observedAt',block_start,'hashVersion',3);
end $$;

create or replace function public.apply_delivery_equipment_snapshot() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare backpack record; utility record; effects jsonb; revision_value integer:=1;
begin
 if new.is_tutorial then return new; end if;
 select l.revision into revision_value from public.mascot_loadouts l where l.mascot_id=new.mascot_id;
 select c.catalog_key,c.slot_bonus,c.speed_multiplier,i.id into backpack from public.mascot_loadouts l join public.equipment_instances i on i.id=l.backpack_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=new.mascot_id;
 select c.catalog_key,c.max_uses,i.id,i.uses_remaining,c.id catalog_id into utility from public.mascot_loadouts l join public.equipment_instances i on i.id=l.utility_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=new.mascot_id and i.uses_remaining>0;
 select coalesce(jsonb_agg(jsonb_build_object('hazardKey',e.hazard_key,'mitigationPoints',e.mitigation_points) order by e.sort_order),'[]'::jsonb) into effects from public.equipment_catalog_effects e where e.catalog_id=utility.catalog_id;
 new.equipment_snapshot:=jsonb_build_object('version',2,'loadoutRevision',coalesce(revision_value,1),'backpack',case when backpack.id is null then null else jsonb_build_object('instanceId',backpack.id,'catalogKey',backpack.catalog_key,'slotBonus',backpack.slot_bonus,'speedMultiplier',backpack.speed_multiplier) end,'utility',case when utility.id is null then null else jsonb_build_object('instanceId',utility.id,'catalogKey',utility.catalog_key,'effects',effects,'usesAtDispatch',utility.uses_remaining) end);
 if backpack.id is not null then new.travel_slot_capacity:=new.travel_slot_capacity+backpack.slot_bonus; new.animal_speed_kmh:=new.animal_speed_kmh*backpack.speed_multiplier; end if;
 return new;
end $$;

create or replace function public.apply_segment_equipment() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare delivery record; utility jsonb; hazards jsonb; effect jsonb; skill_effect numeric; damage numeric; applied numeric; total numeric:=0; applications jsonb:='[]'::jsonb; leg_multiplier numeric; base_multiplier numeric; inserted_count integer;
begin
 select d.animal_speed_kmh,d.equipment_snapshot,d.travel_modifiers,d.is_tutorial into delivery from public.deliveries d where d.id=new.delivery_id;
 if delivery.is_tutorial or coalesce((delivery.equipment_snapshot->>'version')::integer,1)<2 then return new; end if;
 utility:=delivery.equipment_snapshot->'utility'; if utility is null or utility='null'::jsonb then return new; end if;
 hazards:=coalesce(new.modifiers->'hazards','{}'::jsonb);
 for effect in select value from jsonb_array_elements(coalesce(utility->'effects','[]'::jsonb)) loop
   damage:=coalesce((hazards->>(effect->>'hazardKey'))::numeric,0);
   skill_effect:=coalesce((delivery.travel_modifiers->'skillMitigations'->>(effect->>'hazardKey'))::numeric,0);
   applied:=greatest(0,least(damage,(effect->>'mitigationPoints')::numeric)-least(damage,skill_effect));
   if applied>0 and total<.04 then applied:=least(applied,.04-total); total:=total+applied; applications:=applications||jsonb_build_array(jsonb_build_object('hazardKey',effect->>'hazardKey','mitigationPoints',applied)); end if;
 end loop;
 base_multiplier:=coalesce((new.modifiers->>'weather')::numeric,1); leg_multiplier:=coalesce((delivery.travel_modifiers->>(case when new.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1);
 new.modifiers:=jsonb_set(jsonb_set(jsonb_set(new.modifiers,'{equipment}',to_jsonb(1+total)),'{equipmentMitigationPoints}',to_jsonb(total)),'{equipmentEffects}',applications);
 new.effective_speed_kmh:=greatest(delivery.animal_speed_kmh*.60,least(delivery.animal_speed_kmh*1.25,delivery.animal_speed_kmh*leg_multiplier*least(1.25,base_multiplier+total)));
 if new.state='planned' then new.estimated_end_at:=new.estimated_start_at+((new.distance_km/nullif(new.effective_speed_kmh,0))*interval '1 hour'); end if;
 if total>0 and new.state='active' and (tg_op='INSERT' or old.state is distinct from 'active') then
   insert into public.delivery_equipment_activations(delivery_id,equipment_instance_id,segment_id,condition,mitigation_points,applied_effects) values(new.delivery_id,(utility->>'instanceId')::uuid,new.id,coalesce(applications->0->>'hazardKey','multiple'),total,applications) on conflict do nothing;
   get diagnostics inserted_count=row_count; if inserted_count=1 then update public.equipment_instances set uses_remaining=greatest(0,uses_remaining-1),updated_at=now() where id=(utility->>'instanceId')::uuid; end if;
 end if;
 return new;
end $$;

create or replace function public.initialize_delivery_route_segments() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare leg_name text; leg_start timestamptz; leg_end timestamptz; leg_multiplier numeric; segment_count integer; idx integer; segment_start timestamptz; midpoint timestamptz; lat numeric; lon numeric; weather jsonb; season text; environment jsonb; climate numeric; duration interval; stop_duration interval;
begin
 if new.is_tutorial or new.distance_km<=0 or new.return_start_at is null or new.return_arrival_at is null then return new; end if;
 stop_duration:=new.return_start_at-new.outbound_arrival_at;
 update public.deliveries set travel_rules_snapshot=jsonb_build_object('version',2,'segmentTargetHours',6,'maxSegmentsPerLeg',24,'forecastWindowHours',72,'weatherRange',jsonb_build_array(-.08,.02),'speedClamp',jsonb_build_array(.60,1.25),'utilityMitigationCap',.04,'temperatureUnit','celsius','familiarityMultiplier',1,'destinationStopSeconds',extract(epoch from stop_duration)::integer) where id=new.id;
 foreach leg_name in array array['outbound','return'] loop
  if leg_name='outbound' then leg_start:=new.outbound_start_at;leg_end:=new.outbound_arrival_at;leg_multiplier:=coalesce((new.travel_modifiers->>'outboundSpeedMultiplier')::numeric,1);else leg_start:=new.return_start_at;leg_end:=new.return_arrival_at;leg_multiplier:=coalesce((new.travel_modifiers->>'returnSpeedMultiplier')::numeric,1);end if;
  segment_count:=least(24,greatest(1,ceil(extract(epoch from (leg_end-leg_start))/21600)::integer));segment_start:=leg_start;
  for idx in 0..segment_count-1 loop
   midpoint:=leg_start+(leg_end-leg_start)*((idx+.5)/segment_count);
   if leg_name='outbound' then lat:=new.origin_latitude+(new.destination_latitude-new.origin_latitude)*((idx+.5)/segment_count);lon:=new.origin_longitude+(new.destination_longitude-new.origin_longitude)*((idx+.5)/segment_count);else lat:=new.destination_latitude+(new.origin_latitude-new.destination_latitude)*((idx+.5)/segment_count);lon:=new.destination_longitude+(new.origin_longitude-new.destination_longitude)*((idx+.5)/segment_count);end if;
   weather:=public.virtual_travel_weather_v2(new.id,leg_name,idx,date_bin(interval '3 hours',midpoint,timestamptz '2000-01-01'),lat,lon);season:=public.travel_season(midpoint,lat);environment:=public.travel_environment_v2(weather->>'category',(weather->>'windSpeedKmh')::numeric,(weather->>'isDay')::boolean,season,(weather->>'temperatureC')::numeric);climate:=(environment->>'multiplier')::numeric;duration:=((leg_end-leg_start)/segment_count)/climate;
   insert into public.delivery_route_segments(delivery_id,leg,segment_index,route_fraction_start,route_fraction_end,distance_km,estimated_start_at,estimated_end_at,weather_source,weather_snapshot,modifiers,effective_speed_kmh) values(new.id,leg_name,idx,idx::numeric/segment_count,(idx+1)::numeric/segment_count,new.distance_km/segment_count,segment_start,segment_start+duration,'virtual',weather,jsonb_build_object('weather',climate,'hazards',environment->'hazards','season',season,'mascot',leg_multiplier,'equipment',1,'backpack',1,'skills',1,'familiarity',1),greatest(new.animal_speed_kmh*.60,least(new.animal_speed_kmh*1.25,new.animal_speed_kmh*leg_multiplier*climate)));segment_start:=segment_start+duration;
  end loop;
  if leg_name='outbound' then update public.deliveries set outbound_arrival_at=segment_start,return_start_at=segment_start+stop_duration where id=new.id;else update public.deliveries set return_arrival_at=segment_start where id=new.id;end if;
 end loop;perform public.resolve_delivery_route_segments(new.id,clock_timestamp());return new;
end $$;

drop function public.pending_weather_forecast_requests(timestamptz);
create function public.pending_weather_forecast_requests(reference_time timestamptz default now())
returns table(cell_latitude numeric,cell_longitude numeric,block_start timestamptz,cached_weather_code integer,cached_is_day boolean,cached_wind_speed_kmh numeric,cached_wind_gust_kmh numeric,cached_temperature_c numeric,cached_source text)
language sql security definer set search_path=public,pg_temp as $$
 with requested as (select distinct round((case when s.leg='outbound' then d.origin_latitude+(d.destination_latitude-d.origin_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_latitude+(d.origin_latitude-d.destination_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2 lat,round((case when s.leg='outbound' then d.origin_longitude+(d.destination_longitude-d.origin_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_longitude+(d.origin_longitude-d.destination_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2 lon,date_bin(interval '3 hours',s.estimated_start_at,timestamptz '2000-01-01') block from public.delivery_route_segments s join public.deliveries d on d.id=s.delivery_id where s.state='planned' and s.estimated_start_at between reference_time and reference_time+interval '72 hours' and coalesce((d.travel_rules_snapshot->>'version')::integer,1)>=2)
 select r.lat,r.lon,r.block,c.weather_code,c.is_day,c.wind_speed_kmh,c.wind_gust_kmh,c.temperature_c,c.source from requested r left join public.weather_forecast_cache c on c.cell_latitude=r.lat and c.cell_longitude=r.lon and c.block_start=r.block and c.expires_at>reference_time and c.temperature_c is not null where auth.role()='service_role'
$$;

create or replace function public.apply_weather_forecast(cell_latitude numeric,cell_longitude numeric,block_start timestamptz,weather_code integer,is_day boolean,wind_speed_kmh numeric,wind_gust_kmh numeric,temperature_c numeric,source text default 'openMeteo') returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare changed integer:=0; segment record; season text; category text; environment jsonb; multiplier numeric;
begin
 if auth.role()<>'service_role' then raise exception 'Forbidden' using errcode='42501';end if;if temperature_c not between -90 and 70 then raise exception 'Invalid temperature' using errcode='22023';end if;category:=public.travel_weather_category(weather_code);
 insert into public.weather_forecast_cache(cell_latitude,cell_longitude,block_start,weather_code,category,is_day,wind_speed_kmh,wind_gust_kmh,temperature_c,source,queried_at,expires_at) values(apply_weather_forecast.cell_latitude,apply_weather_forecast.cell_longitude,apply_weather_forecast.block_start,apply_weather_forecast.weather_code,category,apply_weather_forecast.is_day,apply_weather_forecast.wind_speed_kmh,apply_weather_forecast.wind_gust_kmh,apply_weather_forecast.temperature_c,apply_weather_forecast.source,now(),now()+interval '6 hours') on conflict on constraint weather_forecast_cache_pkey do update set weather_code=excluded.weather_code,category=excluded.category,is_day=excluded.is_day,wind_speed_kmh=excluded.wind_speed_kmh,wind_gust_kmh=excluded.wind_gust_kmh,temperature_c=excluded.temperature_c,source=excluded.source,queried_at=excluded.queried_at,expires_at=excluded.expires_at;
 for segment in select s.*,d.animal_speed_kmh,d.travel_modifiers from public.delivery_route_segments s join public.deliveries d on d.id=s.delivery_id where s.state='planned' and s.estimated_start_at>now() and coalesce((d.travel_rules_snapshot->>'version')::integer,1)>=2 and date_bin(interval '3 hours',s.estimated_start_at,timestamptz '2000-01-01')=apply_weather_forecast.block_start and round((case when s.leg='outbound' then d.origin_latitude+(d.destination_latitude-d.origin_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_latitude+(d.origin_latitude-d.destination_latitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2=apply_weather_forecast.cell_latitude and round((case when s.leg='outbound' then d.origin_longitude+(d.destination_longitude-d.origin_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) else d.destination_longitude+(d.origin_longitude-d.destination_longitude)*((s.route_fraction_start+s.route_fraction_end)/2) end)*2)/2=apply_weather_forecast.cell_longitude for update of s loop
  season:=segment.modifiers->>'season';environment:=public.travel_environment_v2(category,apply_weather_forecast.wind_speed_kmh,apply_weather_forecast.is_day,season,apply_weather_forecast.temperature_c);multiplier:=(environment->>'multiplier')::numeric;
  update public.delivery_route_segments set weather_source=apply_weather_forecast.source,weather_snapshot=jsonb_build_object('weatherCode',apply_weather_forecast.weather_code,'category',category,'isDay',apply_weather_forecast.is_day,'windSpeedKmh',apply_weather_forecast.wind_speed_kmh,'windGustKmh',apply_weather_forecast.wind_gust_kmh,'temperatureC',apply_weather_forecast.temperature_c,'observedAt',apply_weather_forecast.block_start),modifiers=jsonb_set(jsonb_set(modifiers,'{weather}',to_jsonb(multiplier)),'{hazards}',environment->'hazards'),effective_speed_kmh=greatest(segment.animal_speed_kmh*.60,least(segment.animal_speed_kmh*1.25,segment.animal_speed_kmh*coalesce((segment.travel_modifiers->>(case when segment.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1)*multiplier)),estimated_end_at=estimated_start_at+((distance_km/nullif(greatest(segment.animal_speed_kmh*.60,least(segment.animal_speed_kmh*1.25,segment.animal_speed_kmh*multiplier)),0))*interval '1 hour'),updated_at=now() where id=segment.id;changed:=changed+1;perform public.resolve_delivery_route_segments(segment.delivery_id,now());
 end loop;return changed;
end $$;

revoke all on function public.pending_weather_forecast_requests(timestamptz) from public,anon,authenticated;
grant execute on function public.pending_weather_forecast_requests(timestamptz) to service_role;
revoke all on function public.apply_weather_forecast(numeric,numeric,timestamptz,integer,boolean,numeric,numeric,numeric,text) from public,anon,authenticated;
grant execute on function public.apply_weather_forecast(numeric,numeric,timestamptz,integer,boolean,numeric,numeric,numeric,text) to service_role;

create or replace function public.enrich_delivery_weather_summary() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare segment public.delivery_route_segments%rowtype; leg_segment_count integer;
begin
 if new.travel_weather_summary is null then return new;end if;select * into segment from public.delivery_route_segments where delivery_id=new.id and state<>'completed' order by estimated_start_at limit 1;if segment.id is null then select * into segment from public.delivery_route_segments where delivery_id=new.id order by estimated_end_at desc limit 1;end if;
 if segment.id is not null then select count(*) into leg_segment_count from public.delivery_route_segments where delivery_id=new.id and leg=segment.leg;new.travel_weather_summary:=new.travel_weather_summary||jsonb_build_object('currentSegmentIndex',segment.segment_index,'segmentCount',leg_segment_count,'isDay',coalesce((segment.weather_snapshot->>'isDay')::boolean,true),'conditionImpactMultiplier',coalesce((segment.modifiers->>'weather')::numeric,1),'rulesVersion',coalesce((new.travel_rules_snapshot->>'version')::integer,1),'currentWeather',jsonb_strip_nulls(coalesce(new.travel_weather_summary->'currentWeather','{}'::jsonb)||jsonb_build_object('category',segment.weather_snapshot->>'category','source',segment.weather_source,'observedAt',segment.weather_snapshot->>'observedAt','temperatureC',(segment.weather_snapshot->>'temperatureC')::numeric)));end if;return new;
end $$;

update public.deliveries set travel_weather_summary=travel_weather_summary where travel_weather_summary is not null;

create or replace function public.preview_mascot_loadout(target_mascot_id uuid,backpack_instance_id uuid,utility_instance_id uuid,weather jsonb)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare profile_id uuid:=public.current_profile_id(); mascot public.player_mascots; backpack record; utility record; effects jsonb; environment jsonb; hazards jsonb; effect jsonb; damage numeric; mitigation numeric:=0; applications jsonb:='[]'::jsonb;
begin
 select * into mascot from public.player_mascots where id=target_mascot_id and owner_profile_id=profile_id;if mascot.id is null then raise exception 'Mascot not found' using errcode='42501';end if;
 select c.* into backpack from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=backpack_instance_id and i.owner_profile_id=profile_id and c.kind='backpack';
 select c.* into utility from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=utility_instance_id and i.owner_profile_id=profile_id and c.kind='utility' and i.uses_remaining>0;
 select coalesce(jsonb_agg(jsonb_build_object('hazardKey',e.hazard_key,'mitigationPoints',e.mitigation_points) order by e.sort_order),'[]'::jsonb) into effects from public.equipment_catalog_effects e where e.catalog_id=utility.id;
 if weather ? 'temperatureC' then environment:=public.travel_environment_v2(coalesce(weather->>'category','cloudy'),coalesce((weather->>'windSpeedKmh')::numeric,0),coalesce((weather->>'isDay')::boolean,true),coalesce(weather->>'season','spring'),(weather->>'temperatureC')::numeric);hazards:=environment->'hazards';else hazards:='{}'::jsonb;end if;
 for effect in select value from jsonb_array_elements(effects) loop damage:=coalesce((hazards->>(effect->>'hazardKey'))::numeric,0);if damage>0 and mitigation<.04 then damage:=least(damage,(effect->>'mitigationPoints')::numeric,.04-mitigation);mitigation:=mitigation+damage;applications:=applications||jsonb_build_array(jsonb_build_object('hazardKey',effect->>'hazardKey','mitigationPoints',damage));end if;end loop;
 return jsonb_build_object('mascotId',target_mascot_id,'speedMultiplier',coalesce(backpack.speed_multiplier,1),'slotCapacity',3+coalesce(backpack.slot_bonus,0),'mitigationPoints',mitigation,'activeMitigations',applications,'effects',effects,'forecastMayChange',true);
end $$;
revoke all on function public.preview_mascot_loadout(uuid,uuid,uuid,jsonb) from public,anon;
grant execute on function public.preview_mascot_loadout(uuid,uuid,uuid,jsonb) to authenticated;
