-- Milestone 57 corrective slice. Do not amend the already published foundation migration.

create table public.delivery_skill_awards (
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  skill_id text not null check (skill_id ~ '^skill-[a-z0-9-]+$'),
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  xp integer not null check (xp >= 0),
  applied_effects jsonb not null default '[]'::jsonb check (jsonb_typeof(applied_effects)='array'),
  created_at timestamptz not null default now(),
  primary key (delivery_id,skill_id)
);
alter table public.delivery_skill_awards enable row level security;
create policy "players read own delivery skill awards" on public.delivery_skill_awards for select using (
  mascot_id in (select id from public.player_mascots where owner_profile_id=public.current_profile_id())
);

create table public.route_context_catalog (
  destination_key text primary key,
  is_coastal boolean not null default false,
  updated_at timestamptz not null default now()
);
alter table public.route_context_catalog enable row level security;
create policy "route context is readable" on public.route_context_catalog for select to authenticated using (true);

-- Existing level values in the mascot JSON were presentation-only. Progression is preserved in
-- mascot_skill_progression and is merged into this catalog-shaped JSON by the read RPC below.
update public.player_mascots p set skills=t.skills, updated_at=now()
from public.mascot_templates t
where t.id=p.template_id
  and not exists(select 1 from public.mascot_skill_migration_state s where s.mascot_id=p.id and s.version>=58);

insert into public.mascot_skill_migration_state(mascot_id,version)
select id,58 from public.player_mascots
on conflict(mascot_id) do update set version=greatest(public.mascot_skill_migration_state.version,excluded.version);

create or replace function public.resolve_soft_landing_migration(target_mascot_id uuid,target_skill_id text)
returns void language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; old_progress public.mascot_skill_progression;
begin
  if target_skill_id not in ('skill-nuvem-long-route','skill-nuvem-postal-memory') then raise exception 'Invalid migration target' using errcode='22023'; end if;
  select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id() for update;
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  if exists(select 1 from public.mascot_skill_migration_state where mascot_id=pet.id and soft_landing_target is not null) then return; end if;
  select * into old_progress from public.mascot_skill_progression where mascot_id=pet.id and skill_id='skill-nuvem-soft-landing' for update;
  if old_progress.mascot_id is not null then
    insert into public.mascot_skill_progression(mascot_id,skill_id,level,xp,next_level_xp)
    values(pet.id,target_skill_id,old_progress.level,old_progress.xp,old_progress.next_level_xp)
    on conflict(mascot_id,skill_id) do update set level=greatest(public.mascot_skill_progression.level,excluded.level),xp=greatest(public.mascot_skill_progression.xp,excluded.xp),next_level_xp=least(public.mascot_skill_progression.next_level_xp,excluded.next_level_xp);
  end if;
  update public.mascot_skill_migration_state set soft_landing_target=target_skill_id,migrated_at=now(),version=58 where mascot_id=pet.id;
end $$;
revoke all on function public.resolve_soft_landing_migration(uuid,text) from public,anon;
grant execute on function public.resolve_soft_landing_migration(uuid,text) to authenticated;

create or replace function public.get_mascot_skill_state(target_mascot_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; chosen public.mascot_individual_skill_choices; migration public.mascot_skill_migration_state; result jsonb;
begin
  select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id();
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  select * into chosen from public.mascot_individual_skill_choices where mascot_id=pet.id;
  select * into migration from public.mascot_skill_migration_state where mascot_id=pet.id;
  select coalesce(jsonb_agg(item || jsonb_build_object('level',coalesce(p.level,1),'xp',coalesce(p.xp,0),'nextLevelXp',coalesce(p.next_level_xp,public.m57_skill_next_level_xp(coalesce(p.level,1))),'isSelected',case when item->>'category'='individual' then item->>'id'=chosen.skill_id else true end) order by item->>'id'),'[]'::jsonb)
  into result from jsonb_array_elements(pet.skills) item left join public.mascot_skill_progression p on p.mascot_id=pet.id and p.skill_id=item->>'id';
  return jsonb_build_object('mascotId',pet.id,'mascotLevel',pet.level,'skills',result,'chosenSkillId',chosen.skill_id,'freeChangeUsed',coalesce(chosen.free_change_used,false),'migrationPending',pet.skills @> '[{"id":"skill-nuvem-postal-memory"}]'::jsonb and migration.soft_landing_target is null);
end $$;
revoke all on function public.get_mascot_skill_state(uuid) from public,anon;
grant execute on function public.get_mascot_skill_state(uuid) to authenticated;

-- Materialize coastal context from an authored catalog. Absent catalog rows are explicitly false.
create or replace function public.m57_materialize_skill_context() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare origin_key text:=coalesce(new.origin_place_label,new.origin_label_key); target_destination_key text:=coalesce(new.destination_place_label,new.destination_label_key); first_destination boolean; coastal boolean:=false;
begin
  if new.is_tutorial or new.route_identity <> '{}'::jsonb then return new; end if;
  select not exists(select 1 from public.deliveries prior where prior.sender_profile_id=new.sender_profile_id and prior.status='completed' and coalesce(prior.destination_place_label,prior.destination_label_key)=target_destination_key) into first_destination;
  select is_coastal into coastal from public.route_context_catalog where route_context_catalog.destination_key=target_destination_key;
  new.route_identity:=jsonb_build_object('version',2,'origin',origin_key,'destination',target_destination_key,'pairKey',public.m57_route_pair_key(origin_key,target_destination_key));
  new.skill_context:=jsonb_build_object('version',2,'direct',true,'urban',new.distance_km<=10,'coastal',coalesce(coastal,false),'firstDestination',first_destination,'returnReplyEligible',new.correspondence_option_id is not null);
  return new;
end $$;

-- Award each contextual skill once, independently of reward collection retries.
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
    elsif sid='skill-trovao-urban-start' then active:=active and coalesce((new.skill_context->>'urban')::boolean,false);
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
