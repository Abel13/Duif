-- Qualify the JSON iterator output so delivery creation cannot collide with a
-- PL/pgSQL variable named `value` while initial route segments are inserted.
create or replace function public.a_m57_apply_segment_skills() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare delivery record; resolved jsonb; hazards jsonb; local_hour integer; base_weather numeric; skill_total numeric:=0; mitigation_value numeric; leg_multiplier numeric;
begin
  select travel_modifiers,animal_speed_kmh into delivery from public.deliveries where id=new.delivery_id;
  if coalesce((delivery.travel_modifiers->>'version')::integer,0)<>3 or new.state<>'planned' then return new; end if;
  hazards:=coalesce(new.modifiers->'hazards','{}'::jsonb);
  local_hour:=public.m57_segment_local_hour(new.delivery_id,new.leg,(new.route_fraction_start+new.route_fraction_end)/2,new.estimated_start_at);
  resolved:=public.m57_resolve_segment_skills(delivery.travel_modifiers,new.leg,local_hour,hazards);
  for mitigation_value in
    select mitigation_entry.value::numeric
    from jsonb_each_text(coalesce(resolved->'skillMitigations','{}'::jsonb)) as mitigation_entry(key,value)
  loop
    skill_total:=skill_total+mitigation_value;
  end loop;
  base_weather:=coalesce((new.modifiers->>'weather')::numeric,1);
  leg_multiplier:=coalesce((delivery.travel_modifiers->>(case when new.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1);
  new.modifiers:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(new.modifiers,'{skills}',resolved->'multiplier'),'{skillEffects}',resolved->'skillEffects'),'{skillMitigations}',resolved->'skillMitigations'),'{skillMitigationPoints}',to_jsonb(skill_total));
  new.effective_speed_kmh:=greatest(delivery.animal_speed_kmh*.60,least(delivery.animal_speed_kmh*1.25,delivery.animal_speed_kmh*leg_multiplier*(resolved->>'multiplier')::numeric*least(1.25,base_weather+skill_total)));
  new.estimated_end_at:=new.estimated_start_at+((new.distance_km/nullif(new.effective_speed_kmh,0))*interval '1 hour');
  return new;
end $$;
