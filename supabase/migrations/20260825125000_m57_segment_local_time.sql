-- Resolve civil time from the same private, versioned timezone catalog used by travel visuals.
create or replace function public.m57_segment_local_hour(target_delivery_id uuid, target_leg text, fraction numeric, instant timestamptz)
returns integer language plpgsql stable security definer set search_path=public,extensions,pg_temp as $$
declare delivery record; latitude numeric; longitude numeric; zone text;
begin
  select origin_latitude,origin_longitude,destination_latitude,destination_longitude into delivery from public.deliveries where id=target_delivery_id;
  if target_leg='outbound' then
    latitude:=delivery.origin_latitude+(delivery.destination_latitude-delivery.origin_latitude)*fraction;
    longitude:=delivery.origin_longitude+(delivery.destination_longitude-delivery.origin_longitude)*fraction;
  else
    latitude:=delivery.destination_latitude+(delivery.origin_latitude-delivery.destination_latitude)*fraction;
    longitude:=delivery.destination_longitude+(delivery.origin_longitude-delivery.destination_longitude)*fraction;
  end if;
  select boundary.time_zone into zone from public.timezone_boundaries boundary
    join public.timezone_boundary_imports imported on imported.id=boundary.import_id
    where st_covers(boundary.geometry,st_setsrid(st_makepoint(longitude,latitude),4326))
    order by imported.imported_at desc,boundary.priority desc limit 1;
  return extract(hour from instant at time zone coalesce(zone,'UTC'))::integer;
end $$;
revoke all on function public.m57_segment_local_hour(uuid,text,numeric,timestamptz) from public,anon,authenticated;

create or replace function public.a_m57_apply_segment_skills() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare delivery record; resolved jsonb; hazards jsonb; local_hour integer; base_weather numeric; skill_total numeric:=0; value numeric; leg_multiplier numeric;
begin
  select travel_modifiers,animal_speed_kmh into delivery from public.deliveries where id=new.delivery_id;
  if coalesce((delivery.travel_modifiers->>'version')::integer,0)<>3 or new.state<>'planned' then return new; end if;
  hazards:=coalesce(new.modifiers->'hazards','{}'::jsonb);
  local_hour:=public.m57_segment_local_hour(new.delivery_id,new.leg,(new.route_fraction_start+new.route_fraction_end)/2,new.estimated_start_at);
  resolved:=public.m57_resolve_segment_skills(delivery.travel_modifiers,new.leg,local_hour,hazards);
  for value in select value::numeric from jsonb_each_text(coalesce(resolved->'skillMitigations','{}'::jsonb)) loop skill_total:=skill_total+value; end loop;
  base_weather:=coalesce((new.modifiers->>'weather')::numeric,1);
  leg_multiplier:=coalesce((delivery.travel_modifiers->>(case when new.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1);
  new.modifiers:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(new.modifiers,'{skills}',resolved->'multiplier'),'{skillEffects}',resolved->'skillEffects'),'{skillMitigations}',resolved->'skillMitigations'),'{skillMitigationPoints}',to_jsonb(skill_total));
  new.effective_speed_kmh:=greatest(delivery.animal_speed_kmh*.60,least(delivery.animal_speed_kmh*1.25,delivery.animal_speed_kmh*leg_multiplier*(resolved->>'multiplier')::numeric*least(1.25,base_weather+skill_total)));
  new.estimated_end_at:=new.estimated_start_at+((new.distance_km/nullif(new.effective_speed_kmh,0))*interval '1 hour');
  return new;
end $$;
