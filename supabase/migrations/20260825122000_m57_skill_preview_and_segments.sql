-- M57 v3: one authoritative payload for send preview and future weather segments.

create or replace function public.m57_resolve_segment_skills(snapshot jsonb, leg text, local_hour integer, hazards jsonb)
returns jsonb language plpgsql immutable set search_path=public as $$
declare effect jsonb; mitigation jsonb:='{}'::jsonb; applied jsonb:='[]'::jsonb; multiplier numeric:=1; sid text; level_value integer;
begin
  for effect in select value from jsonb_array_elements(coalesce(snapshot->'skillEffects','[]'::jsonb)) loop
    sid:=effect->>'skillId'; level_value:=coalesce((effect->>'level')::integer,0);
    if effect->>'state'<>'active' then continue; end if;
    if sid='skill-lume-night-watch' and coalesce((hazards->>'night')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{night}',to_jsonb(coalesce((hazards->>'night')::numeric,0))); applied:=applied||jsonb_build_array(effect);
    elsif sid='skill-lume-night-vigil' and coalesce((hazards->>'night')::numeric,0)>0 then multiplier:=multiplier+(level_value*.01); applied:=applied||jsonb_build_array(effect);
    elsif sid='skill-trovao-crosswind' and coalesce((hazards->>'wind')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{wind}',to_jsonb(coalesce((hazards->>'wind')::numeric,0)*least(1,level_value*.1))); applied:=applied||jsonb_build_array(effect);
    elsif sid='skill-pipoca-waterproof-feathers' and coalesce((hazards->>'wet')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{wet}',to_jsonb(coalesce((hazards->>'wet')::numeric,0)*least(1,level_value*.1))); applied:=applied||jsonb_build_array(effect);
    elsif sid='skill-trovao-solar-wing' and coalesce((hazards->>'strongSun')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{strongSun}',to_jsonb(coalesce((hazards->>'strongSun')::numeric,0)*least(1,level_value*.1))); applied:=applied||jsonb_build_array(effect);
    elsif sid='skill-lume-dawn-guardian' and local_hour between 5 and 6 and coalesce((hazards->>'cold')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{cold}',to_jsonb(coalesce((hazards->>'cold')::numeric,0)*least(1,level_value*.1))); applied:=applied||jsonb_build_array(effect);
    end if;
  end loop;
  return jsonb_build_object('multiplier',least(1.25,multiplier),'skillMitigations',mitigation,'skillEffects',applied);
end $$;

create or replace function public.preview_mascot_skill_modifiers(target_mascot_id uuid, destination_key text, distance_km numeric)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; choice text; pair_key text; familiarity integer:=0; context jsonb; effects jsonb:='[]'::jsonb; item jsonb; active boolean; level_value integer; is_coastal boolean:=false;
begin
  select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id();
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  select skill_id into choice from public.mascot_individual_skill_choices where mascot_id=pet.id;
  pair_key:=public.m57_route_pair_key(coalesce((select postal_base_city from public.profiles where id=pet.owner_profile_id),'nest'),destination_key);
  select completed_count into familiarity from public.mascot_route_familiarity where mascot_id=pet.id and route_pair_key=pair_key;
  select is_coastal into is_coastal from public.route_context_catalog where route_context_catalog.destination_key=destination_key;
  context:=jsonb_build_object('version',3,'direct',true,'urban',distance_km<=10,'coastal',coalesce(is_coastal,false),'familiarity',coalesce(familiarity,0),'weatherMayChange',true);
  for item in select value from jsonb_array_elements(pet.skills) loop
    level_value:=coalesce((select level from public.mascot_skill_progression where mascot_id=pet.id and skill_id=item->>'id'),1);
    active:=item->>'category'='fixed' or item->>'id'=choice;
    if item->>'id'='skill-nuvem-long-route' then active:=active and distance_km>=500; end if;
    if item->>'id'='skill-nuvem-postal-memory' then active:=active and coalesce(familiarity,0)>=3; end if;
    effects:=effects||jsonb_build_array(jsonb_build_object('skillId',item->>'id','level',level_value,'state',case when active then 'active' else 'inactive' end,'reason',case when active then 'snapshot' else 'conditionNotMet' end));
  end loop;
  return jsonb_build_object('version',3,'preparationMinutes',5,'outboundSpeedMultiplier',1,'returnSpeedMultiplier',1,'discoveryRadiusMultiplier',1,'rarityWeightMultiplier',1,'longRouteConsistency',1,'isLongRoute',distance_km>=500,'skillContext',context,'skillEffects',effects,'skillMitigations','{}'::jsonb,'weatherMayChange',true);
end $$;
revoke all on function public.preview_mascot_skill_modifiers(uuid,text,numeric) from public,anon;
grant execute on function public.preview_mascot_skill_modifiers(uuid,text,numeric) to authenticated;
