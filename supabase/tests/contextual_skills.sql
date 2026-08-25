begin;
do $$
declare segment jsonb; night_segment jsonb; dawn_segment jsonb; wet_segment jsonb; sun_segment jsonb; rules59 jsonb; night_load jsonb; function_body text;
begin
  segment:=public.m57_resolve_segment_skills('{"skillEffects":[{"skillId":"skill-trovao-crosswind","level":10,"state":"active"}]}'::jsonb,'outbound',12,'{"wind":0.04}'::jsonb);
  if (segment->'skillMitigations'->>'wind')::numeric <> .04 then raise exception 'Crosswind mitigation was not resolved: %',segment; end if;
  if public.m57_skill_xp_for_duration(9)<>0 or public.m57_skill_xp_for_duration(30)<>8 or public.m57_skill_xp_for_duration(31)<>12 or public.m57_skill_xp_for_duration(91)<>16 or public.m57_skill_xp_for_duration(241)<>20 then raise exception 'Skill XP bands are invalid'; end if;
  if to_regprocedure('public.preview_mascot_skill_modifiers(uuid,text,numeric)') is null then raise exception 'Preview RPC is missing'; end if;
  if not exists(select 1 from pg_trigger where tgname='a_m57_apply_segment_skills_before_write' and not tgisinternal) then raise exception 'Segment skill trigger is missing'; end if;
  night_segment:=public.m57_resolve_segment_skills('{"skillEffects":[{"skillId":"skill-lume-night-watch","level":1,"state":"active"},{"skillId":"skill-lume-night-vigil","level":4,"state":"active"}]}'::jsonb,'outbound',23,'{"night":0.05}'::jsonb);
  if (night_segment->'skillMitigations'->>'night')::numeric<>.05 or (night_segment->>'multiplier')::numeric<>1.04 then raise exception 'Night skills were not resolved: %',night_segment; end if;
  dawn_segment:=public.m57_resolve_segment_skills('{"skillEffects":[{"skillId":"skill-lume-dawn-guardian","level":5,"state":"active"}]}'::jsonb,'return',6,'{"cold":0.04}'::jsonb);
  if (dawn_segment->'skillMitigations'->>'cold')::numeric<>.020 then raise exception 'Dawn cold mitigation was not resolved: %',dawn_segment; end if;
  wet_segment:=public.m57_resolve_segment_skills('{"skillEffects":[{"skillId":"skill-pipoca-waterproof-feathers","level":10,"state":"active"}]}'::jsonb,'outbound',12,'{"wet":0.03}'::jsonb);
  if (wet_segment->'skillMitigations'->>'wet')::numeric<>.03 then raise exception 'Wet mitigation was not resolved: %',wet_segment; end if;
  sun_segment:=public.m57_resolve_segment_skills('{"skillEffects":[{"skillId":"skill-trovao-solar-wing","level":3,"state":"active"}]}'::jsonb,'outbound',12,'{"strongSun":0.05}'::jsonb);
  if (sun_segment->'skillMitigations'->>'strongSun')::numeric<>.015 then raise exception 'Sun mitigation was not resolved: %',sun_segment; end if;
  if jsonb_array_length(public.m57_resolve_segment_skills('{"skillEffects":[{"skillId":"skill-lume-dawn-guardian","level":10,"state":"active"}]}'::jsonb,'outbound',7,'{"cold":0.04}'::jsonb)->'skillEffects')<>0 then raise exception 'Dawn boundary must end at 06:59'; end if;
  select pg_get_functiondef('public.apply_segment_equipment()'::regprocedure) into function_body;
  if position('new.modifiers->''skillMitigations''' in function_body)=0 then raise exception 'Equipment does not use segment skill mitigation'; end if;
  if position('new.state<>''planned''' in pg_get_functiondef('public.a_m57_apply_segment_skills()'::regprocedure))=0 then raise exception 'M57 resolver must leave active/completed segments immutable'; end if;
  if position('.value::numeric' in pg_get_functiondef('public.a_m57_apply_segment_skills()'::regprocedure))=0 then raise exception 'M57 mitigation iterator must qualify its JSON value'; end if;
  if exists(select 1 from public.mascot_templates template cross join lateral jsonb_array_elements(template.skills) skill where template.catalog_key='mascot-trovao' and skill->>'id'='skill-trovao-urban-start') then raise exception 'Urban Start remains selectable'; end if;
  if to_regprocedure('public.resolve_retired_urban_start_transfer(uuid,text)') is null then raise exception 'Urban Start transfer RPC is missing'; end if;
  if not exists(select 1 from public.official_translation_keys where translation_key='skills.urbanStart.name') then raise exception 'Historical Urban Start translation was removed'; end if;
  if position('skill-trovao-urban-start' in pg_get_functiondef('public.m57_award_contextual_skills()'::regprocedure))>0 then raise exception 'Urban Start remains in contextual awards'; end if;
  rules59:=public.m57_resolve_segment_skills('{"skillRulesVersion":59,"traitId":"trait-lume-night-eyes","skillContext":{"familiarity":3,"replyConfirmed":true,"backpackPenalty":0.05},"skillEffects":[{"skillId":"skill-lume-night-vigil","level":10,"state":"active"},{"skillId":"skill-lume-silent-flight","level":10,"state":"active"},{"skillId":"skill-lume-lunar-memory","level":10,"state":"active"},{"skillId":"skill-nuvem-return-mail","level":10,"state":"active"}]}'::jsonb,'return',23,'{"night":0.02,"visibility":0.04}'::jsonb);
  if (rules59->>'multiplier')::numeric<>1.25 or (rules59->'skillMitigations'->>'night')::numeric<>.02 or (rules59->'skillMitigations'->>'visibility')::numeric<>.04 then raise exception 'Rules 59 night/return resolution is invalid: %',rules59;end if;
  night_load:=public.m57_resolve_segment_skills('{"skillRulesVersion":59,"skillContext":{"backpackPenalty":0.05},"skillEffects":[{"skillId":"skill-lume-night-load","level":5,"state":"active"}]}'::jsonb,'outbound',23,'{"night":0.02}'::jsonb);
  if abs((night_load->>'multiplier')::numeric-(1+(.05/.95)))>.00001 then raise exception 'Night cargo did not recover the backpack penalty proportionally: %',night_load;end if;
  if exists(select 1 from public.mascot_templates t cross join lateral jsonb_array_elements(t.skills) s where s->>'id'='skill-pipoca-water-path') then raise exception 'Water Path remains selectable';end if;
  if (select count(*) from public.mascot_templates t cross join lateral jsonb_array_elements(t.skills) s where t.catalog_key='mascot-owl')<>5 then raise exception 'Lume M57 catalog is incomplete';end if;
  if position('skill-pipoca-water-path' in pg_get_functiondef('public.m57_award_contextual_skills()'::regprocedure))>0 then raise exception 'Water Path remains in contextual awards';end if;
end $$;

do $$
declare pet record; target_progress public.mascot_skill_progression; transfer public.mascot_retired_skill_transfers; choice public.mascot_individual_skill_choices;
begin
  select p.id,p.owner_profile_id,profile.auth_user_id into pet from public.player_mascots p join public.mascot_templates template on template.id=p.template_id join public.profiles profile on profile.id=p.owner_profile_id where template.catalog_key='mascot-trovao' and profile.auth_user_id is not null limit 1;
  if pet.id is null then return; end if;
  perform set_config('request.jwt.claim.sub',pet.auth_user_id::text,true);
  delete from public.mascot_skill_progression where mascot_id=pet.id and skill_id='skill-trovao-solar-wing';
  delete from public.mascot_individual_skill_choices where mascot_id=pet.id;
  insert into public.mascot_retired_skill_transfers(mascot_id,source_skill_id,source_total_xp,prior_free_change_used,target_skill_id,resolved_at)
    values(pet.id,'skill-trovao-urban-start',100,false,null,null)
    on conflict(mascot_id) do update set source_total_xp=100,prior_free_change_used=false,target_skill_id=null,resolved_at=null;
  perform public.resolve_retired_urban_start_transfer(pet.id,'skill-trovao-solar-wing');
  select * into target_progress from public.mascot_skill_progression where mascot_id=pet.id and skill_id='skill-trovao-solar-wing';
  select * into transfer from public.mascot_retired_skill_transfers where mascot_id=pet.id;
  select * into choice from public.mascot_individual_skill_choices where mascot_id=pet.id;
  if target_progress.level<>3 or target_progress.xp<>0 then raise exception 'Urban Start XP was not transferred integrally: %',to_jsonb(target_progress); end if;
  if choice.skill_id<>'skill-trovao-solar-wing' or choice.free_change_used then raise exception 'Compensatory choice consumed the free change'; end if;
  if transfer.target_skill_id<>'skill-trovao-solar-wing' or transfer.resolved_at is null then raise exception 'Transfer was not resolved'; end if;
  perform public.resolve_retired_urban_start_transfer(pet.id,'skill-trovao-solar-wing');
  begin
    perform public.choose_mascot_individual_skill(pet.id,'skill-trovao-urban-start');
    raise exception 'Retired Urban Start was accepted';
  exception when sqlstate '22023' then null; end;
end $$;

do $$
declare pet record; preview jsonb;
begin
 select p.id,profile.auth_user_id into pet from public.player_mascots p join public.mascot_templates t on t.id=p.template_id join public.profiles profile on profile.id=p.owner_profile_id where t.catalog_key='mascot-trovao' and profile.auth_user_id is not null limit 1;
 if pet.id is null then return;end if;
 perform set_config('request.jwt.claim.sub',pet.auth_user_id::text,true);
 preview:=public.preview_mascot_skill_modifiers(pet.id,'test-destination',100);
 if (preview->>'skillRulesVersion')::integer<>59 or (preview->>'preparationMinutes')::numeric<>4.8 or (preview->>'outboundSpeedMultiplier')::numeric<1.05 then raise exception 'Rules 59 preview is not authoritative: %',preview;end if;
 if exists(select 1 from jsonb_array_elements(preview->'skillEffects') e where e->>'skillId'='skill-nuvem-return-mail' and not coalesce((e->>'weatherDependent')::boolean,false)) then raise exception 'Return Mail may be awarded before a confirmed return';end if;
end $$;

rollback;
