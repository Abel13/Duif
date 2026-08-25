-- Milestone 57: contextual mascot identities. Existing delivery snapshots remain immutable.

alter table public.deliveries
  add column if not exists skill_context jsonb not null default '{}'::jsonb
    check (jsonb_typeof(skill_context) = 'object'),
  add column if not exists route_identity jsonb not null default '{}'::jsonb
    check (jsonb_typeof(route_identity) = 'object');

create table if not exists public.mascot_route_familiarity (
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  route_pair_key text not null check (char_length(route_pair_key) between 3 and 260),
  completed_count integer not null default 0 check (completed_count >= 0),
  last_completed_at timestamptz,
  primary key (mascot_id, route_pair_key)
);
alter table public.mascot_route_familiarity enable row level security;
create policy "players read own route familiarity" on public.mascot_route_familiarity for select
  using (mascot_id in (select id from public.player_mascots where owner_profile_id=public.current_profile_id()));

create table if not exists public.mascot_individual_skill_choices (
  mascot_id uuid primary key references public.player_mascots(id) on delete cascade,
  skill_id text not null check (skill_id ~ '^skill-[a-z0-9-]+$'),
  selected_at timestamptz not null default now(),
  free_change_used boolean not null default false,
  migration_version smallint not null default 1
);
alter table public.mascot_individual_skill_choices enable row level security;
create policy "players read own individual skill choice" on public.mascot_individual_skill_choices for select
  using (mascot_id in (select id from public.player_mascots where owner_profile_id=public.current_profile_id()));

create table if not exists public.mascot_skill_migration_state (
  mascot_id uuid primary key references public.player_mascots(id) on delete cascade,
  version smallint not null default 57,
  soft_landing_target text check (soft_landing_target in ('skill-nuvem-long-route','skill-nuvem-postal-memory')),
  migrated_at timestamptz not null default now()
);
alter table public.mascot_skill_migration_state enable row level security;
create policy "players read own skill migration" on public.mascot_skill_migration_state for select
  using (mascot_id in (select id from public.player_mascots where owner_profile_id=public.current_profile_id()));

-- The persistent identities deliberately use labels/catalog keys, never decimal coordinates.
create or replace function public.m57_route_pair_key(origin_key text, destination_key text)
returns text language sql immutable set search_path=public as $$
  select least(lower(trim(origin_key)), lower(trim(destination_key))) || '|' || greatest(lower(trim(origin_key)), lower(trim(destination_key)))
$$;

create or replace function public.m57_skill_xp_for_duration(duration_minutes numeric)
returns integer language sql immutable set search_path=public as $$
  select case when duration_minutes < 10 then 0 when duration_minutes <= 30 then 8 when duration_minutes <= 90 then 12 when duration_minutes <= 240 then 16 else 20 end
$$;

create or replace function public.m57_skill_next_level_xp(current_level integer)
returns integer language sql immutable set search_path=public as $$
  select case current_level when 1 then 40 when 2 then 60 when 3 then 90 when 4 then 130 when 5 then 180 when 6 then 240 when 7 then 310 when 8 then 400 when 9 then 500 else 500 end
$$;

create or replace function public.choose_mascot_individual_skill(target_mascot_id uuid, target_skill_id text)
returns void language plpgsql security definer set search_path=public,auth as $$
declare pet public.player_mascots; existing public.mascot_individual_skill_choices;
begin
  select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id() for update;
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  if pet.level < 5 then raise exception 'Mascot level 5 required' using errcode='22023'; end if;
  if not exists(select 1 from jsonb_array_elements(coalesce(pet.skills,'[]'::jsonb)) item where item->>'id'=target_skill_id and item->>'category'='individual') then
    raise exception 'Invalid individual skill' using errcode='22023';
  end if;
  select * into existing from public.mascot_individual_skill_choices where mascot_id=pet.id for update;
  if existing.mascot_id is not null and (pet.level >= 10 or existing.free_change_used) then raise exception 'Individual skill is permanent' using errcode='22023'; end if;
  insert into public.mascot_individual_skill_choices(mascot_id,skill_id,free_change_used)
  values(pet.id,target_skill_id,existing.mascot_id is not null)
  on conflict(mascot_id) do update set skill_id=excluded.skill_id,free_change_used=true,selected_at=now();
end $$;
revoke all on function public.choose_mascot_individual_skill(uuid,text) from public,anon;
grant execute on function public.choose_mascot_individual_skill(uuid,text) to authenticated;

create or replace function public.m57_record_route_familiarity() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare pair_key text;
begin
  if new.status='completed' and old.status is distinct from 'completed' and not new.is_tutorial then
    pair_key:=public.m57_route_pair_key(coalesce(new.route_identity->>'origin',new.origin_place_label,new.origin_label_key),coalesce(new.route_identity->>'destination',new.destination_place_label,new.destination_label_key));
    insert into public.mascot_route_familiarity(mascot_id,route_pair_key,completed_count,last_completed_at) values(new.mascot_id,pair_key,1,now())
    on conflict(mascot_id,route_pair_key) do update set completed_count=public.mascot_route_familiarity.completed_count+1,last_completed_at=excluded.last_completed_at;
  end if;
  return new;
end $$;
drop trigger if exists m57_record_route_familiarity_on_completion on public.deliveries;
create trigger m57_record_route_familiarity_on_completion after update of status on public.deliveries for each row execute function public.m57_record_route_familiarity();

-- Add the new contracts without rewriting legacy in-flight deliveries.
update public.mascot_templates set
  skills = case catalog_key
    when 'mascot-nuvem' then '[{"id":"skill-nuvem-long-route","nameKey":"skills.longRoute.name","descriptionKey":"skills.longRoute.description","level":1,"category":"fixed"},{"id":"skill-nuvem-postal-memory","nameKey":"skills.postalMemory.name","descriptionKey":"skills.postalMemory.description","level":1,"category":"fixed"},{"id":"skill-nuvem-balanced-load","nameKey":"skills.balancedLoad.name","descriptionKey":"skills.balancedLoad.description","level":1,"category":"individual"},{"id":"skill-nuvem-return-mail","nameKey":"skills.returnMail.name","descriptionKey":"skills.returnMail.description","level":1,"category":"individual"},{"id":"skill-nuvem-cartographic-eye","nameKey":"skills.cartographicEye.name","descriptionKey":"skills.cartographicEye.description","level":1,"category":"individual"}]'::jsonb
    when 'mascot-trovao' then '[{"id":"skill-trovao-quick-dispatch","nameKey":"skills.quickDispatch.name","descriptionKey":"skills.quickDispatch.description","level":1,"category":"fixed"},{"id":"skill-trovao-crosswind","nameKey":"skills.crosswindInstinct.name","descriptionKey":"skills.crosswindInstinct.description","level":1,"category":"fixed"},{"id":"skill-trovao-solar-wing","nameKey":"skills.solarWing.name","descriptionKey":"skills.solarWing.description","level":1,"category":"individual"},{"id":"skill-trovao-urban-start","nameKey":"skills.urbanStart.name","descriptionKey":"skills.urbanStart.description","level":1,"category":"individual"},{"id":"skill-trovao-aerodynamic-load","nameKey":"skills.aerodynamicLoad.name","descriptionKey":"skills.aerodynamicLoad.description","level":1,"category":"individual"}]'::jsonb
    when 'mascot-pipoca' then '[{"id":"skill-pipoca-shiny-thing","nameKey":"skills.shinyThing.name","descriptionKey":"skills.shinyThing.description","level":1,"category":"fixed"},{"id":"skill-pipoca-detour","nameKey":"skills.happyDetour.name","descriptionKey":"skills.happyDetour.description","level":1,"category":"fixed"},{"id":"skill-pipoca-water-path","nameKey":"skills.waterPath.name","descriptionKey":"skills.waterPath.description","level":1,"category":"individual"},{"id":"skill-pipoca-waterproof-feathers","nameKey":"skills.waterproofFeathers.name","descriptionKey":"skills.waterproofFeathers.description","level":1,"category":"individual"},{"id":"skill-pipoca-first-trip","nameKey":"skills.firstTrip.name","descriptionKey":"skills.firstTrip.description","level":1,"category":"individual"}]'::jsonb
    else skills end;

-- Existing pets keep their old array until their one-time migration choice is resolved; direct successors preserve ids/progression.

create or replace function public.m57_materialize_skill_context() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare origin_key text:=coalesce(new.origin_place_label,new.origin_label_key); destination_key text:=coalesce(new.destination_place_label,new.destination_label_key); first_destination boolean;
begin
  if new.is_tutorial or new.route_identity <> '{}'::jsonb then return new; end if;
  select not exists(select 1 from public.deliveries prior where prior.sender_profile_id=new.sender_profile_id and prior.status='completed' and coalesce(prior.destination_place_label,prior.destination_label_key)=destination_key) into first_destination;
  new.route_identity:=jsonb_build_object('version',1,'origin',origin_key,'destination',destination_key,'pairKey',public.m57_route_pair_key(origin_key,destination_key));
  new.skill_context:=jsonb_build_object('version',1,'direct',true,'urban',new.distance_km<=10,'coastal',false,'firstDestination',first_destination,'returnReplyEligible',new.correspondence_option_id is not null);
  return new;
end $$;
drop trigger if exists m57_materialize_skill_context_before_insert on public.deliveries;
create trigger m57_materialize_skill_context_before_insert before insert on public.deliveries for each row execute function public.m57_materialize_skill_context();

-- The award is intentionally separate from older progression versions: it is keyed by delivery and
-- records only newly contextual skill ids, so a retried collection cannot mint extra XP.
create or replace function public.m57_award_contextual_skills() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare pet public.player_mascots; award public.delivery_progression_awards; entry jsonb; selected text; duration_minutes numeric; base_xp integer; repetitions integer; earned integer; progress public.mascot_skill_progression; awards jsonb:='[]'::jsonb; active boolean; sid text;
begin
  if new.status<>'completed' or old.status='completed' or new.is_tutorial then return new; end if;
  select * into pet from public.player_mascots where id=new.mascot_id for update;
  select * into award from public.delivery_progression_awards where delivery_id=new.id for update;
  if pet.id is null or award.delivery_id is null then return new; end if;
  duration_minutes:=extract(epoch from ((new.outbound_arrival_at-new.outbound_start_at)+(coalesce(new.return_arrival_at,new.outbound_arrival_at)-coalesce(new.return_start_at,new.outbound_arrival_at))))/60;
  base_xp:=public.m57_skill_xp_for_duration(duration_minutes); if base_xp=0 then return new; end if;
  select count(*) into repetitions from public.deliveries d where d.mascot_id=new.mascot_id and d.id<>new.id and d.status='completed' and public.m57_route_pair_key(coalesce(d.route_identity->>'origin',d.origin_place_label,d.origin_label_key),coalesce(d.route_identity->>'destination',d.destination_place_label,d.destination_label_key))=coalesce(new.route_identity->>'pairKey',public.m57_route_pair_key(coalesce(new.origin_place_label,new.origin_label_key),coalesce(new.destination_place_label,new.destination_label_key))) and d.updated_at>=new.updated_at-interval '24 hours';
  earned:=case when repetitions<3 then base_xp when repetitions<5 then ceil(base_xp/2.0)::integer else 0 end;
  select skill_id into selected from public.mascot_individual_skill_choices where mascot_id=pet.id;
  for entry in select value from jsonb_array_elements(coalesce(pet.skills,'[]'::jsonb)) loop
    sid:=entry->>'id'; active:= entry->>'category'='fixed' or sid=selected;
    if not active then continue; end if;
    -- Conditions that are available at completion; climate-specific effects are recorded per segment.
    if sid='skill-nuvem-long-route' then active:=new.distance_km>=500;
    elsif sid='skill-nuvem-postal-memory' then active:=exists(select 1 from public.mascot_route_familiarity f where f.mascot_id=pet.id and f.route_pair_key=coalesce(new.route_identity->>'pairKey','') and f.completed_count>=3);
    elsif sid='skill-trovao-quick-dispatch' then active:=true;
    elsif sid='skill-pipoca-shiny-thing' then active:=exists(select 1 from public.delivery_route_discoveries r where r.delivery_id=new.id);
    elsif sid='skill-pipoca-detour' then active:=true;
    elsif sid='skill-trovao-urban-start' then active:=coalesce((new.skill_context->>'urban')::boolean,false);
    elsif sid='skill-pipoca-water-path' then active:=coalesce((new.skill_context->>'coastal')::boolean,false);
    elsif sid='skill-pipoca-first-trip' then active:=coalesce((new.skill_context->>'firstDestination')::boolean,false);
    else active:=false; end if;
    if active and earned>0 then
      insert into public.mascot_skill_progression(mascot_id,skill_id,next_level_xp) values(pet.id,sid,public.m57_skill_next_level_xp(1)) on conflict do nothing;
      select * into progress from public.mascot_skill_progression where mascot_id=pet.id and skill_id=sid for update;
      while progress.level<10 and progress.xp+earned>=progress.next_level_xp loop progress.xp:=progress.xp-progress.next_level_xp; progress.level:=progress.level+1; progress.next_level_xp:=public.m57_skill_next_level_xp(progress.level); end loop;
      progress.xp:=progress.xp+earned; update public.mascot_skill_progression set level=progress.level,xp=progress.xp,next_level_xp=progress.next_level_xp,updated_at=now() where mascot_id=pet.id and skill_id=sid;
      awards:=awards||jsonb_build_array(jsonb_build_object('skillId',sid,'xp',earned,'level',progress.level,'currentXp',progress.xp,'nextLevelXp',progress.next_level_xp,'contextualVersion',57));
    end if;
  end loop;
  if awards<>'[]'::jsonb then update public.delivery_progression_awards set skill_awards=skill_awards||awards,inputs=inputs||jsonb_build_object('skillRulesVersion',57,'skillContext',new.skill_context) where delivery_id=new.id; end if;
  return new;
end $$;
drop trigger if exists m57_award_contextual_skills_on_completion on public.deliveries;
create trigger m57_award_contextual_skills_on_completion after update of status on public.deliveries for each row execute function public.m57_award_contextual_skills();
