-- Final precision fixes for rules 59: return mail is only applied on an eligible
-- return segment, and night cargo recovers the backpack penalty without dilution.
alter function public.preview_mascot_skill_modifiers(uuid,text,numeric) rename to preview_mascot_skill_modifiers_rules59_explained_base;
revoke all on function public.preview_mascot_skill_modifiers_rules59_explained_base(uuid,text,numeric) from public,anon,authenticated;
create function public.preview_mascot_skill_modifiers(target_mascot_id uuid,destination_key text,distance_km numeric) returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare payload jsonb;effect jsonb;rebuilt jsonb:='[]';
begin
 payload:=public.preview_mascot_skill_modifiers_rules59_explained_base(target_mascot_id,destination_key,distance_km);
 for effect in select value from jsonb_array_elements(payload->'skillEffects') loop
  if effect->>'skillId'='skill-nuvem-return-mail' then effect:=jsonb_set(effect,'{weatherDependent}','true'::jsonb);end if;
  rebuilt:=rebuilt||jsonb_build_array(effect);
 end loop;
 return jsonb_set(payload,'{skillEffects}',rebuilt);
end $$;
revoke all on function public.preview_mascot_skill_modifiers(uuid,text,numeric) from public,anon;grant execute on function public.preview_mascot_skill_modifiers(uuid,text,numeric) to authenticated;

alter function public.m57_resolve_segment_skills(jsonb,text,integer,jsonb) rename to m57_resolve_segment_skills_rules59_base;
create function public.m57_resolve_segment_skills(snapshot jsonb,leg text,local_hour integer,hazards jsonb) returns jsonb language plpgsql immutable set search_path=public as $$
declare resolved jsonb;effect jsonb;penalty numeric;mitigation numeric;current_multiplier numeric;
begin
 resolved:=public.m57_resolve_segment_skills_rules59_base(snapshot,leg,local_hour,hazards);
 if coalesce((snapshot->>'skillRulesVersion')::integer,58)<59 then return resolved;end if;
 penalty:=coalesce((snapshot#>>'{skillContext,backpackPenalty}')::numeric,0);
 if penalty<=0 or penalty>=1 then return resolved;end if;
 for effect in select value from jsonb_array_elements(coalesce(resolved->'skillEffects','[]')) loop
  if effect->>'skillId'='skill-lume-night-load' then
   mitigation:=least(penalty,coalesce((effect->>'level')::integer,0)*.01);
   current_multiplier:=(resolved->>'multiplier')::numeric;
   resolved:=jsonb_set(resolved,'{multiplier}',to_jsonb(least(1.25,current_multiplier-mitigation+(mitigation/(1-penalty)))));
  end if;
 end loop;
 return resolved;
end $$;
