-- Connect the M57 pure resolver to every planned-segment write path.
create or replace function public.a_m57_apply_segment_skills() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare delivery record; resolved jsonb; hazards jsonb; local_hour integer; base_weather numeric; skill_total numeric:=0; value numeric; leg_multiplier numeric;
begin
  select travel_modifiers,animal_speed_kmh into delivery from public.deliveries where id=new.delivery_id;
  if coalesce((delivery.travel_modifiers->>'version')::integer,0)<>3 or new.state<>'planned' then return new; end if;
  hazards:=coalesce(new.modifiers->'hazards','{}'::jsonb); local_hour:=extract(hour from new.estimated_start_at at time zone 'UTC');
  resolved:=public.m57_resolve_segment_skills(delivery.travel_modifiers,new.leg,local_hour,hazards);
  for value in select value::numeric from jsonb_each_text(coalesce(resolved->'skillMitigations','{}'::jsonb)) loop skill_total:=skill_total+value; end loop;
  base_weather:=coalesce((new.modifiers->>'weather')::numeric,1); leg_multiplier:=coalesce((delivery.travel_modifiers->>(case when new.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1);
  new.modifiers:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(new.modifiers,'{skills}',resolved->'multiplier'),'{skillEffects}',resolved->'skillEffects'),'{skillMitigations}',resolved->'skillMitigations'),'{skillMitigationPoints}',to_jsonb(skill_total));
  new.effective_speed_kmh:=greatest(delivery.animal_speed_kmh*.60,least(delivery.animal_speed_kmh*1.25,delivery.animal_speed_kmh*leg_multiplier*(resolved->>'multiplier')::numeric*least(1.25,base_weather+skill_total)));
  new.estimated_end_at:=new.estimated_start_at+((new.distance_km/nullif(new.effective_speed_kmh,0))*interval '1 hour');
  return new;
end $$;
drop trigger if exists a_m57_apply_segment_skills_before_write on public.delivery_route_segments;
create trigger a_m57_apply_segment_skills_before_write before insert or update of weather_snapshot,state,effective_speed_kmh on public.delivery_route_segments for each row execute function public.a_m57_apply_segment_skills();

-- Mark climate-driven skills explicitly so the client does not promise a forecast outcome.
create or replace function public.preview_mascot_skill_modifiers(target_mascot_id uuid,destination_key text,distance_km numeric)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare payload jsonb; effect jsonb; rebuilt jsonb:='[]'::jsonb;
begin
  -- Reuse the catalog/state RPC inputs through the already materialized skill state.
  payload:=public.get_mascot_skill_state(target_mascot_id)||jsonb_build_object('version',3,'weatherMayChange',true);
  for effect in select value from jsonb_array_elements(payload->'skills') loop
    rebuilt:=rebuilt||jsonb_build_array(jsonb_build_object('skillId',effect->>'id','level',coalesce((effect->>'level')::integer,1),'state',case when coalesce((effect->>'isSelected')::boolean,true) then 'active' else 'inactive' end,'reason',case when coalesce((effect->>'isSelected')::boolean,true) then 'snapshot' else 'conditionNotMet' end,'weatherDependent',(effect->>'id') in ('skill-trovao-crosswind','skill-trovao-solar-wing','skill-pipoca-waterproof-feathers','skill-lume-night-watch','skill-lume-night-vigil','skill-lume-dawn-guardian')));
  end loop;
  return jsonb_build_object('version',3,'preparationMinutes',5,'outboundSpeedMultiplier',1,'returnSpeedMultiplier',1,'discoveryRadiusMultiplier',1,'rarityWeightMultiplier',1,'longRouteConsistency',1,'isLongRoute',distance_km>=500,'skillEffects',rebuilt,'skillMitigations','{}'::jsonb,'weatherMayChange',true);
end $$;

create or replace function public.resolve_delivery_travel_modifiers() returns trigger language plpgsql security definer set search_path=public,auth as $$
declare snapshot jsonb; requested_at timestamptz; outbound_duration interval; return_duration interval; destination_key text;
begin
  if new.travel_modifiers is not null then return new; end if;
  destination_key:=coalesce(new.destination_place_label,new.destination_label_key);
  snapshot:=public.preview_mascot_skill_modifiers(new.mascot_id,destination_key,new.distance_km);
  requested_at:=new.outbound_start_at;
  outbound_duration:=(new.distance_km/new.animal_speed_kmh/nullif((snapshot->>'outboundSpeedMultiplier')::numeric,0))*interval '1 hour';
  return_duration:=(new.distance_km/new.animal_speed_kmh/nullif((snapshot->>'returnSpeedMultiplier')::numeric,0))*interval '1 hour';
  new.travel_modifiers:=snapshot; new.outbound_start_at:=requested_at+((snapshot->>'preparationMinutes')::numeric*interval '1 minute'); new.outbound_arrival_at:=new.outbound_start_at+outbound_duration; new.return_start_at:=new.outbound_arrival_at+interval '5 minutes'; new.return_arrival_at:=new.return_start_at+return_duration; new.status:='preparing';
  return new;
end $$;
