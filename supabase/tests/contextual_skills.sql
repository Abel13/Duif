begin;
do $$
declare segment jsonb; night_segment jsonb; dawn_segment jsonb; wet_segment jsonb; sun_segment jsonb; function_body text;
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
end $$;

rollback;
