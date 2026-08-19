-- Milestone 49: progression is granted only by the authoritative collection transaction.
-- Snapshots keep later balance changes from rewriting a completed delivery's result.

create table public.profile_postal_progression (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  level integer not null default 1 check (level between 1 and 100),
  xp integer not null default 0 check (xp >= 0),
  next_level_xp integer not null default 150 check (next_level_xp > 0),
  updated_at timestamptz not null default now()
);

create table public.mascot_skill_progression (
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  skill_id text not null check (char_length(skill_id) between 1 and 120),
  level integer not null default 1 check (level between 1 and 10),
  xp integer not null default 0 check (xp >= 0),
  next_level_xp integer not null default 60 check (next_level_xp > 0),
  updated_at timestamptz not null default now(),
  primary key (mascot_id, skill_id)
);

create table public.delivery_progression_awards (
  delivery_id uuid primary key references public.deliveries(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  formula_version smallint not null default 1 check (formula_version = 1),
  reputation_xp integer not null check (reputation_xp >= 0),
  mascot_xp integer not null check (mascot_xp >= 0),
  skill_awards jsonb not null default '[]'::jsonb check (jsonb_typeof(skill_awards) = 'array'),
  inputs jsonb not null check (jsonb_typeof(inputs) = 'object'),
  awarded_at timestamptz not null default now()
);

create index delivery_progression_awards_profile_id_idx on public.delivery_progression_awards(profile_id);
create index mascot_skill_progression_mascot_id_idx on public.mascot_skill_progression(mascot_id);

alter table public.profile_postal_progression enable row level security;
alter table public.mascot_skill_progression enable row level security;
alter table public.delivery_progression_awards enable row level security;

create policy "players read own postal progression" on public.profile_postal_progression
  for select using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));
create policy "players read own mascot skill progression" on public.mascot_skill_progression
  for select using (mascot_id in (select id from public.player_mascots where owner_profile_id in (select id from public.profiles where auth_user_id = auth.uid())));
create policy "players read own delivery progression awards" on public.delivery_progression_awards
  for select using (profile_id in (select id from public.profiles where auth_user_id = auth.uid()));

create or replace function public.progression_next_level_xp(curve text, current_level integer)
returns integer language sql immutable set search_path = public as $$
  select case curve
    when 'reputation' then ceil(150 * power(current_level::numeric, 1.45))::integer
    when 'mascot' then ceil(100 * power(current_level::numeric, 1.35))::integer
    when 'skill' then ceil(60 * power(current_level::numeric, 1.4))::integer
    else null
  end;
$$;

create or replace function public.apply_delivery_progression(completed_delivery_id uuid)
returns public.delivery_progression_awards language plpgsql security definer set search_path = public, auth as $$
declare
  selected_delivery public.deliveries;
  selected_mascot public.player_mascots;
  account_progress public.profile_postal_progression;
  skill_progress public.mascot_skill_progression;
  awarded public.delivery_progression_awards;
  total_distance numeric;
  base_mascot_xp integer;
  mascot_multiplier numeric := 1;
  reputation_award integer := 10;
  discovery_count integer := 0;
  is_first_destination boolean;
  is_first_social boolean;
  is_long_distance boolean;
  is_urban boolean;
  affinity_key text := null;
  mascot_level_ups integer := 0;
  active_skill record;
  skill_awards jsonb := '[]'::jsonb;
  skill_xp integer;
begin
  select * into awarded from public.delivery_progression_awards where delivery_id = completed_delivery_id;
  if awarded.delivery_id is not null then return awarded; end if;

  select * into selected_delivery from public.deliveries where id = completed_delivery_id for update;
  if selected_delivery.id is null or selected_delivery.status <> 'completed' or selected_delivery.is_tutorial then
    raise exception 'Completed non-tutorial delivery required' using errcode = '22023';
  end if;
  select * into selected_mascot from public.player_mascots where id = selected_delivery.mascot_id for update;
  if selected_mascot.id is null then raise exception 'Delivery mascot not found' using errcode = '22023'; end if;

  -- Serialize awards for the same account before resolving first-time route facts.
  insert into public.profile_postal_progression(profile_id) values (selected_delivery.sender_profile_id)
    on conflict (profile_id) do nothing;
  select * into account_progress from public.profile_postal_progression
    where profile_id = selected_delivery.sender_profile_id for update;

  total_distance := round(selected_delivery.distance_km * 2, 2);
  base_mascot_xp := round(15 + power(total_distance, 0.8) * 6);
  is_long_distance := total_distance > 100;
  is_urban := selected_delivery.distance_km <= 10;
  is_first_destination := not exists (
    select 1 from public.delivery_progression_awards award
    join public.deliveries prior on prior.id = award.delivery_id
    where award.profile_id = selected_delivery.sender_profile_id
      and prior.destination_place_label is not distinct from selected_delivery.destination_place_label
      and prior.id <> selected_delivery.id
  );
  select count(*) into discovery_count from public.delivery_route_discoveries
    where delivery_id = selected_delivery.id;
  is_first_social := not exists (
    select 1 from public.delivery_progression_awards award
    join public.deliveries prior on prior.id = award.delivery_id
    where award.profile_id = selected_delivery.sender_profile_id and prior.id <> selected_delivery.id
  );

  if is_first_destination then mascot_multiplier := mascot_multiplier * 1.25; reputation_award := reputation_award + 25; end if;
  if is_first_social then reputation_award := reputation_award + 25; end if;
  reputation_award := reputation_award + discovery_count * 10;

  -- The starter identities have one contextual affinity each. These are route facts,
  -- never a permanent species bonus, and only one affinity can apply to a delivery.
  if selected_mascot.skills @> '[{"id":"skill-nuvem-long-route"}]'::jsonb and is_long_distance then
    affinity_key := 'longDistance';
  elsif selected_mascot.skills @> '[{"id":"skill-trovao-quick-dispatch"}]'::jsonb and is_urban then
    affinity_key := 'urban';
  elsif selected_mascot.skills @> '[{"id":"skill-pipoca-shiny-thing"}]'::jsonb and discovery_count > 0 then
    affinity_key := 'discovery';
  end if;
  if affinity_key is not null then mascot_multiplier := mascot_multiplier * 1.10; end if;

  while account_progress.xp + reputation_award >= account_progress.next_level_xp and account_progress.level < 100 loop
    account_progress.xp := account_progress.xp - account_progress.next_level_xp;
    account_progress.level := account_progress.level + 1;
    account_progress.next_level_xp := public.progression_next_level_xp('reputation', account_progress.level);
  end loop;
  account_progress.xp := account_progress.xp + reputation_award;
  update public.profile_postal_progression set level=account_progress.level,xp=account_progress.xp,next_level_xp=account_progress.next_level_xp,updated_at=now() where profile_id=account_progress.profile_id;

  base_mascot_xp := round(base_mascot_xp * mascot_multiplier);
  while selected_mascot.xp + base_mascot_xp >= selected_mascot.next_level_xp loop
    selected_mascot.xp := selected_mascot.xp - selected_mascot.next_level_xp;
    selected_mascot.level := selected_mascot.level + 1;
    selected_mascot.next_level_xp := public.progression_next_level_xp('mascot', selected_mascot.level);
    mascot_level_ups := mascot_level_ups + 1;
  end loop;
  selected_mascot.xp := selected_mascot.xp + base_mascot_xp;
  update public.player_mascots set level=selected_mascot.level,xp=selected_mascot.xp,next_level_xp=selected_mascot.next_level_xp,updated_at=now() where id=selected_mascot.id;

  -- Mascot level-up reputation is granted in the same transaction and follows the
  -- account curve too, rather than overflowing its current level silently.
  if mascot_level_ups > 0 then
    reputation_award := reputation_award + mascot_level_ups * 30;
    while account_progress.xp + mascot_level_ups * 30 >= account_progress.next_level_xp and account_progress.level < 100 loop
      account_progress.xp := account_progress.xp - account_progress.next_level_xp;
      account_progress.level := account_progress.level + 1;
      account_progress.next_level_xp := public.progression_next_level_xp('reputation', account_progress.level);
    end loop;
    account_progress.xp := account_progress.xp + mascot_level_ups * 30;
    update public.profile_postal_progression set level=account_progress.level,xp=account_progress.xp,next_level_xp=account_progress.next_level_xp,updated_at=now() where profile_id=account_progress.profile_id;
  end if;

  for active_skill in select value->>'id' as id from jsonb_array_elements(selected_mascot.skills) where value ? 'id' loop
    skill_xp := case
      when active_skill.id = 'skill-nuvem-long-route' and is_long_distance then 10
      when active_skill.id = 'skill-trovao-quick-dispatch' and is_urban then 5
      when active_skill.id = 'skill-pipoca-shiny-thing' and discovery_count > 0 then 10
      else 0 end;
    if skill_xp > 0 then
      insert into public.mascot_skill_progression(mascot_id,skill_id) values(selected_mascot.id,active_skill.id) on conflict do nothing;
      select * into skill_progress from public.mascot_skill_progression where mascot_id=selected_mascot.id and skill_id=active_skill.id for update;
      while skill_progress.xp + skill_xp >= skill_progress.next_level_xp and skill_progress.level < 10 loop
        skill_progress.xp := skill_progress.xp - skill_progress.next_level_xp;
        skill_progress.level := skill_progress.level + 1;
        skill_progress.next_level_xp := public.progression_next_level_xp('skill', skill_progress.level);
      end loop;
      skill_progress.xp := skill_progress.xp + skill_xp;
      update public.mascot_skill_progression set level=skill_progress.level,xp=skill_progress.xp,next_level_xp=skill_progress.next_level_xp,updated_at=now() where mascot_id=skill_progress.mascot_id and skill_id=skill_progress.skill_id;
      skill_awards := skill_awards || jsonb_build_array(jsonb_build_object('skillId',active_skill.id,'xp',skill_xp,'level',skill_progress.level,'nextLevelXp',skill_progress.next_level_xp,'currentXp',skill_progress.xp));
    end if;
  end loop;

  insert into public.delivery_progression_awards(delivery_id,profile_id,mascot_id,reputation_xp,mascot_xp,skill_awards,inputs)
  values (selected_delivery.id,selected_delivery.sender_profile_id,selected_mascot.id,reputation_award,base_mascot_xp,skill_awards,
    jsonb_build_object('formulaVersion',1,'totalDistanceKm',total_distance,'baseMascotXp',round(15 + power(total_distance,0.8)*6),
      'multipliers',jsonb_build_object('firstDestination',case when is_first_destination then 1.25 else 1 end,'affinity',case when affinity_key is null then 1 else 1.10 end),
      'affinity',affinity_key,'novelty',jsonb_build_object('firstDestination',is_first_destination),'actions',jsonb_build_object('completedDelivery',10,'firstSocial',is_first_social),'discoveries',discovery_count))
  returning * into awarded;
  return awarded;
end;
$$;
revoke all on function public.apply_delivery_progression(uuid) from public;

-- The existing collection RPC already owns the transaction. This trigger makes progression
-- atomic with inventory collection and harmless on repeat collection calls.
create or replace function public.collect_delivery_progression_on_completion()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' and not new.is_tutorial then
    perform public.apply_delivery_progression(new.id);
  end if;
  return new;
end;
$$;
drop trigger if exists delivery_progression_on_completion on public.deliveries;
create trigger delivery_progression_on_completion after update of status on public.deliveries
  for each row execute function public.collect_delivery_progression_on_completion();

create or replace function public.get_delivery_progression_award(delivery_id uuid)
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare current_profile_id uuid; award public.delivery_progression_awards;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  select * into award from public.delivery_progression_awards where delivery_id=get_delivery_progression_award.delivery_id;
  if award.delivery_id is null then return null; end if;
  if award.profile_id <> current_profile_id then raise exception 'Only the delivery owner may read progression' using errcode='42501'; end if;
  return to_jsonb(award);
end;
$$;
revoke all on function public.get_delivery_progression_award(uuid) from public;
grant execute on function public.get_delivery_progression_award(uuid) to authenticated;
