-- M57 rules 59: complete the retained library while preserving older v3 snapshots.
insert into public.official_translation_keys(translation_key) values
 ('skills.nightVigil.name'),('skills.nightVigil.description'),('skills.silentFlight.name'),('skills.silentFlight.description'),
 ('skills.lunarMemory.name'),('skills.lunarMemory.description'),('skills.nightLoad.name'),('skills.nightLoad.description'),
 ('skills.dawnGuardian.name'),('skills.dawnGuardian.description') on conflict do nothing;

-- The owl/Lume receives the M57 identity. Its legacy skill is the direct predecessor of Night Vigil.
update public.mascot_templates set
 trait='{"id":"trait-lume-night-eyes","nameKey":"traits.nightRoute.name","descriptionKey":"traits.nightRoute.description","effect":"eventDiscovery"}'::jsonb,
 skills='[{"id":"skill-lume-night-vigil","nameKey":"skills.nightVigil.name","descriptionKey":"skills.nightVigil.description","level":1,"category":"fixed"},{"id":"skill-lume-silent-flight","nameKey":"skills.silentFlight.name","descriptionKey":"skills.silentFlight.description","level":1,"category":"fixed"},{"id":"skill-lume-lunar-memory","nameKey":"skills.lunarMemory.name","descriptionKey":"skills.lunarMemory.description","level":1,"category":"individual"},{"id":"skill-lume-night-load","nameKey":"skills.nightLoad.name","descriptionKey":"skills.nightLoad.description","level":1,"category":"individual"},{"id":"skill-lume-dawn-guardian","nameKey":"skills.dawnGuardian.name","descriptionKey":"skills.dawnGuardian.description","level":1,"category":"individual"}]'::jsonb
where catalog_key='mascot-owl';

insert into public.mascot_skill_progression(mascot_id,skill_id,level,xp,next_level_xp)
select p.id,'skill-lume-night-vigil',coalesce(old.level,1),coalesce(old.xp,0),coalesce(old.next_level_xp,public.m57_skill_next_level_xp(coalesce(old.level,1)))
from public.player_mascots p join public.mascot_templates t on t.id=p.template_id and t.catalog_key='mascot-owl'
left join public.mascot_skill_progression old on old.mascot_id=p.id and old.skill_id='skill-owl-night-watch'
on conflict(mascot_id,skill_id) do update set level=greatest(public.mascot_skill_progression.level,excluded.level),xp=greatest(public.mascot_skill_progression.xp,excluded.xp),next_level_xp=excluded.next_level_xp;
update public.player_mascots p set trait=t.trait,skills=t.skills,updated_at=now() from public.mascot_templates t where t.id=p.template_id and t.catalog_key='mascot-owl';

-- Retire Water Path using the same durable transfer ledger.
alter table public.mascot_retired_skill_transfers drop constraint mascot_retired_skill_transfers_source_skill_id_check;
alter table public.mascot_retired_skill_transfers add constraint mascot_retired_skill_transfers_source_skill_id_check check(source_skill_id in ('skill-trovao-urban-start','skill-pipoca-water-path'));
alter table public.mascot_retired_skill_transfers drop constraint mascot_retired_skill_transfers_target_skill_id_check;
alter table public.mascot_retired_skill_transfers add constraint mascot_retired_skill_transfers_target_skill_id_check check(target_skill_id in ('skill-trovao-solar-wing','skill-trovao-aerodynamic-load','skill-pipoca-waterproof-feathers','skill-pipoca-first-trip'));
insert into public.mascot_retired_skill_transfers(mascot_id,source_skill_id,source_total_xp,prior_free_change_used)
select p.id,'skill-pipoca-water-path',(case coalesce(progress.level,1) when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end)+coalesce(progress.xp,0),coalesce(choice.free_change_used,false)
from public.player_mascots p join public.mascot_templates t on t.id=p.template_id and t.catalog_key='mascot-pipoca'
left join public.mascot_individual_skill_choices choice on choice.mascot_id=p.id
left join public.mascot_skill_progression progress on progress.mascot_id=p.id and progress.skill_id='skill-pipoca-water-path'
where choice.skill_id='skill-pipoca-water-path' or progress.mascot_id is not null on conflict(mascot_id) do nothing;
delete from public.mascot_individual_skill_choices c using public.mascot_retired_skill_transfers r where c.mascot_id=r.mascot_id and r.source_skill_id='skill-pipoca-water-path' and r.resolved_at is null;
update public.mascot_templates set skills=(select jsonb_agg(item order by ordinal) from jsonb_array_elements(skills) with ordinality e(item,ordinal) where item->>'id'<>'skill-pipoca-water-path') where catalog_key='mascot-pipoca';
update public.player_mascots p set skills=(select jsonb_agg(item order by ordinal) from jsonb_array_elements(p.skills) with ordinality e(item,ordinal) where item->>'id'<>'skill-pipoca-water-path'),updated_at=now() where exists(select 1 from public.mascot_templates t where t.id=p.template_id and t.catalog_key='mascot-pipoca');

create or replace function public.resolve_retired_water_path_transfer(target_mascot_id uuid,target_skill_id text) returns void language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; transfer public.mascot_retired_skill_transfers; target public.mascot_skill_progression; total integer; lvl integer; current_xp integer;
begin
 if target_skill_id not in ('skill-pipoca-waterproof-feathers','skill-pipoca-first-trip') then raise exception 'Invalid transfer target' using errcode='22023'; end if;
 select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id() for update;if pet.id is null then raise exception 'Mascot not found' using errcode='42501';end if;
 select * into transfer from public.mascot_retired_skill_transfers where mascot_id=pet.id and source_skill_id='skill-pipoca-water-path' for update;if transfer.mascot_id is null then raise exception 'No pending transfer' using errcode='22023';end if;
 if transfer.resolved_at is not null then if transfer.target_skill_id=target_skill_id then return;end if;raise exception 'Transfer already resolved' using errcode='22023';end if;
 select * into target from public.mascot_skill_progression where mascot_id=pet.id and skill_id=target_skill_id for update;
 total:=(case coalesce(target.level,1) when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end)+coalesce(target.xp,0)+transfer.source_total_xp;
 lvl:=case when total>=1950 then 10 when total>=1450 then 9 when total>=1050 then 8 when total>=740 then 7 when total>=500 then 6 when total>=320 then 5 when total>=190 then 4 when total>=100 then 3 when total>=40 then 2 else 1 end;
 current_xp:=total-(case lvl when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end);
 insert into public.mascot_skill_progression(mascot_id,skill_id,level,xp,next_level_xp) values(pet.id,target_skill_id,lvl,current_xp,public.m57_skill_next_level_xp(lvl)) on conflict(mascot_id,skill_id) do update set level=excluded.level,xp=excluded.xp,next_level_xp=excluded.next_level_xp,updated_at=now();
 insert into public.mascot_individual_skill_choices(mascot_id,skill_id,free_change_used) values(pet.id,target_skill_id,transfer.prior_free_change_used) on conflict(mascot_id) do update set skill_id=excluded.skill_id,free_change_used=excluded.free_change_used,selected_at=now();
 update public.mascot_retired_skill_transfers set target_skill_id=resolve_retired_water_path_transfer.target_skill_id,resolved_at=now() where mascot_id=pet.id;
end $$;

create or replace function public.get_mascot_skill_state(target_mascot_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots;chosen public.mascot_individual_skill_choices;migration public.mascot_skill_migration_state;retired public.mascot_retired_skill_transfers;result jsonb;targets jsonb:='[]';entry jsonb;p public.mascot_skill_progression;total integer;lvl integer;allowed text[];
begin
 select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id();if pet.id is null then raise exception 'Mascot not found' using errcode='42501';end if;
 select * into chosen from public.mascot_individual_skill_choices where mascot_id=pet.id;select * into migration from public.mascot_skill_migration_state where mascot_id=pet.id;select * into retired from public.mascot_retired_skill_transfers where mascot_id=pet.id and resolved_at is null;
 select coalesce(jsonb_agg(skill||jsonb_build_object('level',coalesce(progress.level,1),'xp',coalesce(progress.xp,0),'nextLevelXp',coalesce(progress.next_level_xp,public.m57_skill_next_level_xp(coalesce(progress.level,1))),'isSelected',case when skill->>'category'='individual' then skill->>'id'=chosen.skill_id else true end) order by skill->>'id'),'[]') into result from jsonb_array_elements(pet.skills) skill left join public.mascot_skill_progression progress on progress.mascot_id=pet.id and progress.skill_id=skill->>'id';
 if retired.mascot_id is not null then
  allowed:=case retired.source_skill_id when 'skill-trovao-urban-start' then array['skill-trovao-solar-wing','skill-trovao-aerodynamic-load'] else array['skill-pipoca-waterproof-feathers','skill-pipoca-first-trip'] end;
  for entry in select value from jsonb_array_elements(pet.skills) where value->>'id'=any(allowed) loop
   select * into p from public.mascot_skill_progression where mascot_id=pet.id and skill_id=entry->>'id';total:=(case coalesce(p.level,1) when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end)+coalesce(p.xp,0)+retired.source_total_xp;
   lvl:=case when total>=1950 then 10 when total>=1450 then 9 when total>=1050 then 8 when total>=740 then 7 when total>=500 then 6 when total>=320 then 5 when total>=190 then 4 when total>=100 then 3 when total>=40 then 2 else 1 end;
   targets:=targets||jsonb_build_array(jsonb_build_object('skillId',entry->>'id','level',lvl,'xp',total-(case lvl when 1 then 0 when 2 then 40 when 3 then 100 when 4 then 190 when 5 then 320 when 6 then 500 when 7 then 740 when 8 then 1050 when 9 then 1450 else 1950 end),'nextLevelXp',public.m57_skill_next_level_xp(lvl)));
  end loop;
 end if;
 return jsonb_build_object('mascotId',pet.id,'mascotLevel',pet.level,'skills',result,'chosenSkillId',chosen.skill_id,'freeChangeUsed',coalesce(chosen.free_change_used,false),'migrationPending',pet.skills @> '[{"id":"skill-nuvem-postal-memory"}]' and migration.soft_landing_target is null,'pendingTransfer',case when retired.mascot_id is null then null else jsonb_build_object('kind',case retired.source_skill_id when 'skill-trovao-urban-start' then 'urbanStartRetired' else 'waterPathRetired' end,'sourceSkillId',retired.source_skill_id,'sourceTotalXp',retired.source_total_xp,'targets',targets) end);
end $$;

create or replace function public.a_m57_apply_segment_skills() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare delivery record;resolved jsonb;hazards jsonb;local_hour integer;skill_total numeric:=0;mitigation_value numeric;leg_multiplier numeric;snapshot jsonb;base_weather numeric;
begin
 select travel_modifiers,animal_speed_kmh into delivery from public.deliveries where id=new.delivery_id;
 if coalesce((delivery.travel_modifiers->>'version')::integer,0)<>3 or new.state<>'planned' then return new;end if;
 snapshot:=delivery.travel_modifiers;
 if coalesce((snapshot->>'skillRulesVersion')::integer,58)>=59 and new.leg='return' then snapshot:=jsonb_set(snapshot,'{skillContext,replyConfirmed}',to_jsonb(exists(select 1 from public.delivery_return_replies where delivery_id=new.delivery_id)),true);end if;
 hazards:=coalesce(new.modifiers->'hazards','{}');local_hour:=public.m57_segment_local_hour(new.delivery_id,new.leg,(new.route_fraction_start+new.route_fraction_end)/2,new.estimated_start_at);
 resolved:=public.m57_resolve_segment_skills(snapshot,new.leg,local_hour,hazards);
 for mitigation_value in select m.value::numeric from jsonb_each_text(coalesce(resolved->'skillMitigations','{}')) m(key,value) loop skill_total:=skill_total+mitigation_value;end loop;
 base_weather:=coalesce((new.modifiers->>'weather')::numeric,1);leg_multiplier:=coalesce((snapshot->>(case when new.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1);
 new.modifiers:=jsonb_set(jsonb_set(jsonb_set(jsonb_set(new.modifiers,'{skills}',resolved->'multiplier'),'{skillEffects}',resolved->'skillEffects'),'{skillMitigations}',resolved->'skillMitigations'),'{skillMitigationPoints}',to_jsonb(skill_total));
 new.effective_speed_kmh:=greatest(delivery.animal_speed_kmh*.60,least(delivery.animal_speed_kmh*1.25,delivery.animal_speed_kmh*leg_multiplier*(resolved->>'multiplier')::numeric*least(1.25,base_weather+skill_total)));
 new.estimated_end_at:=new.estimated_start_at+((new.distance_km/nullif(new.effective_speed_kmh,0))*interval '1 hour');return new;
end $$;

-- Awards are sourced only from static snapshot effects and effects materialized on segments.
create or replace function public.m57_award_contextual_skills() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare pet public.player_mascots;sid text;duration_minutes numeric;base_xp integer;repeats integer;granted integer;state public.mascot_skill_progression;awards jsonb:='[]';effect_payload jsonb;inserted_count integer;
begin
 if new.status<>'completed' or old.status='completed' or new.is_tutorial or coalesce((new.travel_modifiers->>'skillRulesVersion')::integer,58)<59 then return new;end if;
 select * into pet from public.player_mascots where id=new.mascot_id for update;if pet.id is null then return new;end if;
 duration_minutes:=extract(epoch from ((new.outbound_arrival_at-new.outbound_start_at)+(coalesce(new.return_arrival_at,new.outbound_arrival_at)-coalesce(new.return_start_at,new.outbound_arrival_at))))/60;base_xp:=public.m57_skill_xp_for_duration(duration_minutes);if base_xp=0 then return new;end if;
 select count(*) into repeats from public.deliveries d where d.mascot_id=pet.id and d.id<>new.id and d.status='completed' and coalesce(d.route_identity->>'pairKey','')=coalesce(new.route_identity->>'pairKey','') and d.updated_at>=new.updated_at-interval '24 hours';granted:=case when repeats<3 then base_xp when repeats<5 then ceil(base_xp/2.0)::integer else 0 end;
 for sid in
  select distinct skill_id from (
   select e->>'skillId' skill_id from jsonb_array_elements(coalesce(new.travel_modifiers->'skillEffects','[]')) e where e->>'state'='active' and not coalesce((e->>'weatherDependent')::boolean,false)
   union all select e->>'skillId' from public.delivery_route_segments s cross join lateral jsonb_array_elements(coalesce(s.modifiers->'skillEffects','[]')) e where s.delivery_id=new.id
  ) applied where skill_id is not null
 loop
  select coalesce(jsonb_agg(payload),'[]') into effect_payload from (
   select e payload from jsonb_array_elements(coalesce(new.travel_modifiers->'skillEffects','[]')) e where e->>'skillId'=sid and e->>'state'='active'
   union all select e from public.delivery_route_segments s cross join lateral jsonb_array_elements(coalesce(s.modifiers->'skillEffects','[]')) e where s.delivery_id=new.id and e->>'skillId'=sid
  ) effects;
  insert into public.delivery_skill_awards(delivery_id,skill_id,mascot_id,xp,applied_effects) values(new.id,sid,pet.id,granted,effect_payload) on conflict do nothing;get diagnostics inserted_count=row_count;
  if inserted_count=1 and granted>0 then
   insert into public.mascot_skill_progression(mascot_id,skill_id,next_level_xp) values(pet.id,sid,public.m57_skill_next_level_xp(1)) on conflict do nothing;select * into state from public.mascot_skill_progression where mascot_id=pet.id and skill_id=sid for update;
   while state.level<10 and state.xp+granted>=state.next_level_xp loop state.xp:=state.xp-state.next_level_xp;state.level:=state.level+1;state.next_level_xp:=public.m57_skill_next_level_xp(state.level);end loop;state.xp:=state.xp+granted;
   update public.mascot_skill_progression set level=state.level,xp=state.xp,next_level_xp=state.next_level_xp,updated_at=now() where mascot_id=pet.id and skill_id=sid;
  end if;
  if inserted_count=1 then awards:=awards||jsonb_build_array(jsonb_build_object('skillId',sid,'xp',granted,'level',coalesce(state.level,1),'currentXp',coalesce(state.xp,0),'nextLevelXp',coalesce(state.next_level_xp,40),'appliedEffects',effect_payload));end if;
 end loop;
 if awards<>'[]' then update public.delivery_progression_awards set skill_awards=skill_awards||awards,inputs=inputs||jsonb_build_object('skillRulesVersion',59) where delivery_id=new.id;end if;return new;
end $$;
revoke all on function public.resolve_retired_water_path_transfer(uuid,text) from public,anon;grant execute on function public.resolve_retired_water_path_transfer(uuid,text) to authenticated;

-- Authoritative dispatch/preview contract for rules 59.
create or replace function public.preview_mascot_skill_modifiers(target_mascot_id uuid,destination_key text,distance_km numeric)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; selected text; pair_key text; familiarity integer:=0; first_visit boolean; effects jsonb:='[]'; entry jsonb; sid text; lvl integer; active boolean; weather boolean; prep numeric:=5; outbound numeric:=1; return_mult numeric:=1; radius numeric:=1; rarity numeric:=1; long_penalty numeric:=0; backpack numeric:=1; cargo numeric:=0; context jsonb;
begin
 select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id();if pet.id is null then raise exception 'Mascot not found' using errcode='42501';end if;
 select skill_id into selected from public.mascot_individual_skill_choices where mascot_id=pet.id;
 pair_key:=public.m57_route_pair_key(coalesce((select postal_base_city from public.profiles where id=pet.owner_profile_id),'nest'),destination_key);
 select completed_count into familiarity from public.mascot_route_familiarity where mascot_id=pet.id and route_pair_key=pair_key;familiarity:=coalesce(familiarity,0);
 first_visit:=not exists(select 1 from public.deliveries where mascot_id=pet.id and status='completed' and coalesce(destination_place_label,destination_label_key)=destination_key);
 select coalesce((c.speed_multiplier),1) into backpack from public.mascot_loadouts l join public.equipment_instances i on i.id=l.backpack_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=pet.id;backpack:=coalesce(backpack,1);
 context:=jsonb_build_object('version',3,'direct',true,'longRoute',distance_km>=500,'familiarity',familiarity,'firstDestination',first_visit,'pairKey',pair_key,'backpackPenalty',greatest(0,1-backpack),'returnReplyEligible',true);
 for entry in select value from jsonb_array_elements(pet.skills) loop
  sid:=entry->>'id';select coalesce(level,1) into lvl from public.mascot_skill_progression where mascot_id=pet.id and skill_id=sid;lvl:=coalesce(lvl,1);active:=entry->>'category'='fixed' or sid=selected;weather:=sid in ('skill-trovao-crosswind','skill-trovao-solar-wing','skill-pipoca-waterproof-feathers','skill-lume-night-vigil','skill-lume-silent-flight','skill-lume-lunar-memory','skill-lume-night-load','skill-lume-dawn-guardian');
  if sid='skill-nuvem-long-route' then active:=active and distance_km>=500;if active then long_penalty:=.1*.8*greatest(0,1-.07*lvl);end if;
  elsif sid='skill-nuvem-postal-memory' then active:=active and familiarity>=3;if active then outbound:=outbound+.004*lvl;return_mult:=return_mult+.004*lvl;end if;
  elsif sid='skill-nuvem-balanced-load' then active:=active and backpack<1;if active then cargo:=least(1-backpack,.01*lvl);outbound:=outbound*(backpack+cargo)/backpack;return_mult:=return_mult*(backpack+cargo)/backpack;end if;
  elsif sid='skill-nuvem-cartographic-eye' then active:=active and (distance_km>=500 or familiarity>=3);if active then radius:=radius+.02*lvl;end if;
  elsif sid='skill-nuvem-return-mail' then active:=active;
  elsif sid='skill-trovao-quick-dispatch' then if active then prep:=greatest(2,5-.2*lvl);end if;
  elsif sid='skill-trovao-aerodynamic-load' then active:=active and backpack<1;if active then cargo:=least(1-backpack,.01*lvl);outbound:=outbound*(backpack+cargo)/backpack;return_mult:=return_mult*(backpack+cargo)/backpack;end if;
  elsif sid='skill-pipoca-shiny-thing' then if active then rarity:=rarity+.015*lvl;end if;
  elsif sid='skill-pipoca-detour' then if active then radius:=radius+.02*lvl;outbound:=outbound/(1+.01*lvl);return_mult:=return_mult/(1+.01*lvl);end if;
  elsif sid='skill-pipoca-first-trip' then active:=active and first_visit;if active then radius:=radius+.02*lvl;end if;
  elsif sid='skill-lume-lunar-memory' then active:=active and familiarity>=3;
  end if;
  effects:=effects||jsonb_build_array(jsonb_build_object('skillId',sid,'level',lvl,'state',case when active then 'active' else 'inactive' end,'reason',case when active then 'snapshot' else 'conditionNotMet' end,'weatherDependent',weather));
 end loop;
 if pet.trait->>'id'='trait-direct-flight' then outbound:=outbound*1.05;return_mult:=return_mult*1.05;end if;
 if pet.trait->>'id'='trait-curious-finder' then radius:=radius+.15;end if;
 if distance_km>=500 and pet.trait->>'id'='trait-steady-route' and long_penalty=0 then long_penalty:=.08;end if;
 return_mult:=return_mult*(1-long_penalty);
 return jsonb_build_object('version',3,'skillRulesVersion',59,'preparationMinutes',prep,'outboundSpeedMultiplier',least(1.25,outbound),'returnSpeedMultiplier',least(1.25,return_mult),'discoveryRadiusMultiplier',radius,'rarityWeightMultiplier',rarity,'longRouteConsistency',1-long_penalty,'isLongRoute',distance_km>=500,'traitId',pet.trait->>'id','skillContext',context,'skillEffects',effects,'skillMitigations','{}','weatherMayChange',true);
end $$;

-- Rules 59 segment effects. Rules 58 keep their existing resolver branch.
create or replace function public.m57_resolve_segment_skills(snapshot jsonb,leg text,local_hour integer,hazards jsonb)
returns jsonb language plpgsql immutable set search_path=public as $$
declare effect jsonb; mitigation jsonb:='{}';applied jsonb:='[]';multiplier numeric:=1;sid text;lvl integer;night boolean:=coalesce((hazards->>'night')::numeric,0)>0;
begin
 if coalesce((snapshot->>'skillRulesVersion')::integer,58)<59 then
  for effect in select value from jsonb_array_elements(coalesce(snapshot->'skillEffects','[]')) loop sid:=effect->>'skillId';lvl:=coalesce((effect->>'level')::integer,0);if effect->>'state'<>'active' then continue;end if;
   if sid='skill-lume-night-watch' and night then mitigation:=jsonb_set(mitigation,'{night}',hazards->'night');applied:=applied||jsonb_build_array(effect);
   elsif sid='skill-lume-night-vigil' and night then multiplier:=multiplier+lvl*.01;applied:=applied||jsonb_build_array(effect);
   elsif sid='skill-trovao-crosswind' and coalesce((hazards->>'wind')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{wind}',to_jsonb((hazards->>'wind')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);
   elsif sid='skill-pipoca-waterproof-feathers' and coalesce((hazards->>'wet')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{wet}',to_jsonb((hazards->>'wet')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);
   elsif sid='skill-trovao-solar-wing' and coalesce((hazards->>'strongSun')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{strongSun}',to_jsonb((hazards->>'strongSun')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);end if;end loop;
  return jsonb_build_object('multiplier',least(1.25,multiplier),'skillMitigations',mitigation,'skillEffects',applied);
 end if;
 if snapshot->>'traitId'='trait-lume-night-eyes' and night then mitigation:=jsonb_set(mitigation,'{night}',hazards->'night');end if;
 for effect in select value from jsonb_array_elements(coalesce(snapshot->'skillEffects','[]')) loop sid:=effect->>'skillId';lvl:=coalesce((effect->>'level')::integer,0);if effect->>'state'<>'active' then continue;end if;
  if sid='skill-lume-night-vigil' and night then multiplier:=multiplier+lvl*.01;applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-lume-silent-flight' and coalesce((hazards->>'visibility')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{visibility}',to_jsonb((hazards->>'visibility')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-lume-lunar-memory' and night and coalesce((snapshot#>>'{skillContext,familiarity}')::integer,0)>=3 then multiplier:=multiplier+lvl*.01;applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-lume-night-load' and night and coalesce((snapshot#>>'{skillContext,backpackPenalty}')::numeric,0)>0 then multiplier:=multiplier+least((snapshot#>>'{skillContext,backpackPenalty}')::numeric,lvl*.01);applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-lume-dawn-guardian' and local_hour between 5 and 6 and coalesce((hazards->>'cold')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{cold}',to_jsonb((hazards->>'cold')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-trovao-crosswind' and coalesce((hazards->>'wind')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{wind}',to_jsonb((hazards->>'wind')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-trovao-solar-wing' and coalesce((hazards->>'strongSun')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{strongSun}',to_jsonb((hazards->>'strongSun')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-pipoca-waterproof-feathers' and coalesce((hazards->>'wet')::numeric,0)>0 then mitigation:=jsonb_set(mitigation,'{wet}',to_jsonb((hazards->>'wet')::numeric*least(1,lvl*.1)));applied:=applied||jsonb_build_array(effect);
  elsif sid='skill-nuvem-return-mail' and leg='return' and coalesce((snapshot#>>'{skillContext,replyConfirmed}')::boolean,false) then multiplier:=multiplier+lvl*.01;applied:=applied||jsonb_build_array(effect);end if;
 end loop;
 return jsonb_build_object('multiplier',least(1.25,multiplier),'skillMitigations',mitigation,'skillEffects',applied);
end $$;
