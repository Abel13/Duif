-- Remove the retired skill from the contextual award resolver. Historical award rows remain readable.
create or replace function public.m57_award_contextual_skills() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare pet public.player_mascots; entry jsonb; selected text; duration_minutes numeric; base_xp integer; repeats integer; granted integer; state public.mascot_skill_progression; sid text; active boolean; awards jsonb:='[]'::jsonb;
begin
  if new.status<>'completed' or old.status='completed' or new.is_tutorial then return new; end if;
  select * into pet from public.player_mascots where id=new.mascot_id for update; if pet.id is null then return new; end if;
  duration_minutes:=extract(epoch from ((new.outbound_arrival_at-new.outbound_start_at)+(coalesce(new.return_arrival_at,new.outbound_arrival_at)-coalesce(new.return_start_at,new.outbound_arrival_at))))/60;
  base_xp:=public.m57_skill_xp_for_duration(duration_minutes); if base_xp=0 then return new; end if;
  select count(*) into repeats from public.deliveries d where d.mascot_id=pet.id and d.id<>new.id and d.status='completed' and coalesce(d.route_identity->>'pairKey','')=coalesce(new.route_identity->>'pairKey','') and d.updated_at>=new.updated_at-interval '24 hours';
  granted:=case when repeats<3 then base_xp when repeats<5 then ceil(base_xp/2.0)::integer else 0 end;
  select skill_id into selected from public.mascot_individual_skill_choices where mascot_id=pet.id;
  for entry in select value from jsonb_array_elements(pet.skills) loop
    sid:=entry->>'id'; active:=entry->>'category'='fixed' or sid=selected;
    if sid='skill-nuvem-long-route' then active:=active and new.distance_km>=500;
    elsif sid='skill-nuvem-postal-memory' then active:=active and exists(select 1 from public.mascot_route_familiarity f where f.mascot_id=pet.id and f.route_pair_key=new.route_identity->>'pairKey' and f.completed_count>=3);
    elsif sid='skill-pipoca-shiny-thing' then active:=active and exists(select 1 from public.delivery_route_discoveries r where r.delivery_id=new.id);
    elsif sid='skill-pipoca-water-path' then active:=active and coalesce((new.skill_context->>'coastal')::boolean,false);
    elsif sid='skill-pipoca-first-trip' then active:=active and coalesce((new.skill_context->>'firstDestination')::boolean,false);
    elsif sid not in ('skill-trovao-quick-dispatch','skill-pipoca-detour') then active:=false; end if;
    if active then
      insert into public.delivery_skill_awards(delivery_id,skill_id,mascot_id,xp,applied_effects) values(new.id,sid,pet.id,granted,jsonb_build_array(jsonb_build_object('kind','contextual','ruleVersion',58))) on conflict do nothing;
      if found and granted>0 then
        insert into public.mascot_skill_progression(mascot_id,skill_id,next_level_xp) values(pet.id,sid,public.m57_skill_next_level_xp(1)) on conflict do nothing;
        select * into state from public.mascot_skill_progression where mascot_id=pet.id and skill_id=sid for update;
        while state.level<10 and state.xp+granted>=state.next_level_xp loop state.xp:=state.xp-state.next_level_xp; state.level:=state.level+1; state.next_level_xp:=public.m57_skill_next_level_xp(state.level); end loop;
        state.xp:=state.xp+granted; update public.mascot_skill_progression set level=state.level,xp=state.xp,next_level_xp=state.next_level_xp,updated_at=now() where mascot_id=pet.id and skill_id=sid;
        awards:=awards||jsonb_build_array(jsonb_build_object('skillId',sid,'xp',granted,'level',state.level,'currentXp',state.xp,'nextLevelXp',state.next_level_xp));
      end if;
    end if;
  end loop;
  if awards<>'[]'::jsonb then update public.delivery_progression_awards set skill_awards=skill_awards||awards,inputs=inputs||jsonb_build_object('skillRulesVersion',58,'skillContext',new.skill_context) where delivery_id=new.id; end if;
  return new;
end $$;
