-- Finalize M57 segment resolution without rewriting historical migrations.

create or replace function public.apply_segment_equipment() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare
  delivery record; utility jsonb; hazards jsonb; effect jsonb;
  skill_effect numeric; damage numeric; applied numeric; total numeric:=0;
  applications jsonb:='[]'::jsonb; leg_multiplier numeric; base_multiplier numeric;
  skill_multiplier numeric:=1; inserted_count integer; snapshot_version integer;
begin
  select d.animal_speed_kmh,d.equipment_snapshot,d.travel_modifiers,d.is_tutorial
    into delivery from public.deliveries d where d.id=new.delivery_id;
  if delivery.is_tutorial or coalesce((delivery.equipment_snapshot->>'version')::integer,1)<2 then return new; end if;

  snapshot_version:=coalesce((delivery.travel_modifiers->>'version')::integer,1);
  utility:=delivery.equipment_snapshot->'utility';
  hazards:=coalesce(new.modifiers->'hazards','{}'::jsonb);
  if snapshot_version=3 then skill_multiplier:=coalesce((new.modifiers->>'skills')::numeric,1); end if;

  if utility is not null and utility<>'null'::jsonb then
    for effect in select value from jsonb_array_elements(coalesce(utility->'effects','[]'::jsonb)) loop
      damage:=coalesce((hazards->>(effect->>'hazardKey'))::numeric,0);
      skill_effect:=case when snapshot_version=3
        then coalesce((new.modifiers->'skillMitigations'->>(effect->>'hazardKey'))::numeric,0)
        else coalesce((delivery.travel_modifiers->'skillMitigations'->>(effect->>'hazardKey'))::numeric,0) end;
      applied:=least(greatest(0,damage-skill_effect),(effect->>'mitigationPoints')::numeric);
      if applied>0 and total<.04 then
        applied:=least(applied,.04-total); total:=total+applied;
        applications:=applications||jsonb_build_array(jsonb_build_object('hazardKey',effect->>'hazardKey','mitigationPoints',applied));
      end if;
    end loop;
  end if;

  base_multiplier:=coalesce((new.modifiers->>'weather')::numeric,1);
  leg_multiplier:=coalesce((delivery.travel_modifiers->>(case when new.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1);
  new.modifiers:=jsonb_set(jsonb_set(jsonb_set(new.modifiers,'{equipment}',to_jsonb(1+total)),'{equipmentMitigationPoints}',to_jsonb(total)),'{equipmentEffects}',applications);
  new.effective_speed_kmh:=greatest(delivery.animal_speed_kmh*.60,least(delivery.animal_speed_kmh*1.25,delivery.animal_speed_kmh*leg_multiplier*skill_multiplier*least(1.25,base_multiplier+coalesce((new.modifiers->>'skillMitigationPoints')::numeric,0)+total)));
  if new.state='planned' then new.estimated_end_at:=new.estimated_start_at+((new.distance_km/nullif(new.effective_speed_kmh,0))*interval '1 hour'); end if;

  if utility is not null and utility<>'null'::jsonb and total>0 and new.state='active' and (tg_op='INSERT' or old.state is distinct from 'active') then
    insert into public.delivery_equipment_activations(delivery_id,equipment_instance_id,segment_id,condition,mitigation_points,applied_effects)
      values(new.delivery_id,(utility->>'instanceId')::uuid,new.id,coalesce(applications->0->>'hazardKey','multiple'),total,applications) on conflict do nothing;
    get diagnostics inserted_count=row_count;
    if inserted_count=1 then update public.equipment_instances set uses_remaining=greatest(0,uses_remaining-1),updated_at=now() where id=(utility->>'instanceId')::uuid; end if;
  end if;
  return new;
end $$;

create or replace function public.get_delivery_progression_award(delivery_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid; award public.delivery_progression_awards; enriched jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  select * into award from public.delivery_progression_awards where delivery_id=get_delivery_progression_award.delivery_id;
  if award.delivery_id is null then return null; end if;
  if award.profile_id<>current_profile_id then raise exception 'Only the delivery owner may read progression' using errcode='42501'; end if;
  select coalesce(jsonb_agg(base.item||jsonb_build_object('appliedEffects',coalesce(contextual.applied_effects,'[]'::jsonb)) order by base.ordinality),'[]'::jsonb)
    into enriched
    from jsonb_array_elements(award.skill_awards) with ordinality base(item,ordinality)
    left join public.delivery_skill_awards contextual on contextual.delivery_id=award.delivery_id and contextual.skill_id=base.item->>'skillId';
  return jsonb_set(to_jsonb(award),'{skill_awards}',enriched);
end $$;
revoke all on function public.get_delivery_progression_award(uuid) from public;
grant execute on function public.get_delivery_progression_award(uuid) to authenticated;
