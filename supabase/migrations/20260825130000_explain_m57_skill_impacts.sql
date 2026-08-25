-- Add numeric explanations without changing the already applied rules-59 resolver.
alter function public.preview_mascot_skill_modifiers(uuid,text,numeric) rename to preview_mascot_skill_modifiers_rules59_base;
revoke all on function public.preview_mascot_skill_modifiers_rules59_base(uuid,text,numeric) from public,anon,authenticated;

create function public.preview_mascot_skill_modifiers(target_mascot_id uuid,destination_key text,distance_km numeric)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare payload jsonb;effect jsonb;explained jsonb:='[]';sid text;lvl integer;backpack_penalty numeric;
begin
 payload:=public.preview_mascot_skill_modifiers_rules59_base(target_mascot_id,destination_key,distance_km);
 backpack_penalty:=coalesce((payload#>>'{skillContext,backpackPenalty}')::numeric,0);
 for effect in select value from jsonb_array_elements(payload->'skillEffects') loop
  sid:=effect->>'skillId';lvl:=(effect->>'level')::integer;
  explained:=explained||jsonb_build_array(effect||jsonb_build_object('impact',case sid
   when 'skill-nuvem-long-route' then jsonb_build_object('kind','penaltyMitigation','value',least(1,.07*lvl))
   when 'skill-nuvem-postal-memory' then jsonb_build_object('kind','speed','value',.004*lvl)
   when 'skill-nuvem-balanced-load' then jsonb_build_object('kind','cargoMitigation','value',least(backpack_penalty,.01*lvl))
   when 'skill-nuvem-return-mail' then jsonb_build_object('kind','returnSpeed','value',.01*lvl)
   when 'skill-nuvem-cartographic-eye' then jsonb_build_object('kind','corridor','value',.02*lvl)
   when 'skill-trovao-quick-dispatch' then jsonb_build_object('kind','preparationMinutes','value',-.2*lvl)
   when 'skill-trovao-crosswind' then jsonb_build_object('kind','penaltyMitigation','value',least(1,.1*lvl))
   when 'skill-trovao-solar-wing' then jsonb_build_object('kind','penaltyMitigation','value',least(1,.1*lvl))
   when 'skill-trovao-aerodynamic-load' then jsonb_build_object('kind','cargoMitigation','value',least(backpack_penalty,.01*lvl))
   when 'skill-pipoca-shiny-thing' then jsonb_build_object('kind','rarity','value',.015*lvl)
   when 'skill-pipoca-detour' then jsonb_build_object('kind','corridorAndDuration','value',.02*lvl,'duration',.01*lvl)
   when 'skill-pipoca-waterproof-feathers' then jsonb_build_object('kind','penaltyMitigation','value',least(1,.1*lvl))
   when 'skill-pipoca-first-trip' then jsonb_build_object('kind','corridor','value',.02*lvl)
   when 'skill-lume-night-vigil' then jsonb_build_object('kind','speed','value',.01*lvl)
   when 'skill-lume-silent-flight' then jsonb_build_object('kind','penaltyMitigation','value',least(1,.1*lvl))
   when 'skill-lume-lunar-memory' then jsonb_build_object('kind','speed','value',.01*lvl)
   when 'skill-lume-night-load' then jsonb_build_object('kind','cargoMitigation','value',least(backpack_penalty,.01*lvl))
   when 'skill-lume-dawn-guardian' then jsonb_build_object('kind','penaltyMitigation','value',least(1,.1*lvl)) else '{}'::jsonb end));
 end loop;
 return jsonb_set(payload,'{skillEffects}',explained);
end $$;
revoke all on function public.preview_mascot_skill_modifiers(uuid,text,numeric) from public,anon;
grant execute on function public.preview_mascot_skill_modifiers(uuid,text,numeric) to authenticated;
