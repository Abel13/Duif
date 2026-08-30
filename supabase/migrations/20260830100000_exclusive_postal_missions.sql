-- Daily, per-mascot exclusive missions. Narrative is advisory copy only; every
-- geographic and gameplay value is chosen and revalidated by the database.

create table public.exclusive_postal_missions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  generation_date date not null,
  status text not null default 'pending' check (status in ('pending','offered','accepted','departed','expired')),
  expires_at timestamptz not null,
  template_catalog_key text not null references public.official_postal_job_templates(catalog_key),
  cargo_slots integer not null check (cargo_slots between 1 and 7),
  seed_reward integer not null check (seed_reward > 0),
  mascot_xp integer not null check (mascot_xp > 0),
  candidate_destinations jsonb not null check (jsonb_typeof(candidate_destinations) = 'array' and jsonb_array_length(candidate_destinations) > 0),
  destination_geoname_id bigint references public.geonames_cities(geoname_id),
  destination_name text,
  destination_country_code text,
  destination_latitude double precision check (destination_latitude between -90 and 90),
  destination_longitude double precision check (destination_longitude between -180 and 180),
  distance_km numeric(10,2) check (distance_km > 0),
  copy jsonb check (copy is null or jsonb_typeof(copy) = 'object'),
  generation_lease_token uuid,
  generation_lease_expires_at timestamptz,
  generated_at timestamptz,
  accepted_at timestamptz,
  departed_at timestamptz,
  expired_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status in ('offered','accepted','departed')) = (copy is not null)),
  check ((status in ('offered','accepted','departed')) = (destination_geoname_id is not null and destination_name is not null and destination_country_code is not null and destination_latitude is not null and destination_longitude is not null and distance_km is not null))
);
create unique index exclusive_postal_missions_one_generation_per_mascot_day on public.exclusive_postal_missions(profile_id, mascot_id, generation_date);
create unique index exclusive_postal_missions_one_open_per_mascot on public.exclusive_postal_missions(profile_id, mascot_id) where status in ('pending','offered','accepted');
create index exclusive_postal_missions_generation_queue on public.exclusive_postal_missions(status, generation_lease_expires_at) where status='pending';

create table public.exclusive_postal_mission_runs (
  delivery_id uuid primary key references public.deliveries(id) on delete cascade,
  mission_id uuid not null unique references public.exclusive_postal_missions(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  seed_reward integer not null check (seed_reward > 0),
  mascot_xp integer not null check (mascot_xp > 0),
  collected_at timestamptz
);
create table public.exclusive_postal_mission_seed_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mission_delivery_id uuid not null unique references public.exclusive_postal_mission_runs(delivery_id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

alter table public.exclusive_postal_missions enable row level security;
alter table public.exclusive_postal_mission_runs enable row level security;
alter table public.exclusive_postal_mission_seed_ledger enable row level security;

create or replace function public.exclusive_mission_local_day(reference_time timestamptz default now())
returns date language sql stable set search_path=public as $$
  select (reference_time at time zone 'America/Sao_Paulo')::date
$$;

-- The daily preparation step expires old offers first. A mission that expires in
-- this run deliberately waits until the following day before being replaced.
create or replace function public.prepare_exclusive_postal_missions(reference_time timestamptz default now(), batch_size integer default 100)
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare generation_day date := public.exclusive_mission_local_day(reference_time); inserted_count integer := 0;
begin
  if batch_size < 1 or batch_size > 500 then raise exception 'Invalid mission batch size' using errcode='22023'; end if;
  update public.exclusive_postal_missions
  set status='expired', expired_at=reference_time, updated_at=reference_time
  where status in ('pending','offered','accepted') and expires_at<=reference_time;

  with eligible as (
    select p.id as profile_id, p.home_latitude, p.home_longitude, p.postal_base_city, p.postal_base_country,
      m.id as mascot_id, m.level, m.name as mascot_name,
      (public.m58_flight_rule(m.level)->>'maxOneWayKm')::numeric as max_range_km,
      (public.m58_flight_rule(m.level)->>'naturalSlots')::integer + coalesce(backpack.slot_bonus,0) as slot_capacity
    from public.profiles p
    join public.player_mascots m on m.owner_profile_id=p.id
    left join lateral (
      select coalesce(c.slot_bonus,0) as slot_bonus
      from public.mascot_loadouts l
      join public.equipment_instances i on i.id=l.backpack_instance_id
      join public.equipment_catalog c on c.id=i.catalog_id
      where l.mascot_id=m.id
    ) backpack on true
    where p.home_city_geoname_id is not null
      and not exists (
        select 1 from public.exclusive_postal_missions current
        where current.profile_id=p.id and current.mascot_id=m.id and current.status in ('pending','offered','accepted')
      )
      and not exists (
        select 1 from public.exclusive_postal_missions expired_today
        where expired_today.profile_id=p.id and expired_today.mascot_id=m.id and expired_today.status='expired'
          and public.exclusive_mission_local_day(expired_today.expired_at)=generation_day
      )
    order by p.id, m.id
    limit batch_size
  ), prepared as (
    select e.*, template.catalog_key, template.cargo_slots, template.seed_reward, template.mascot_xp,
      candidates.destinations
    from eligible e
    join lateral (
      select t.* from public.official_postal_job_templates t
      where t.status='active' and e.level>=t.min_mascot_level
        and (t.max_mascot_level is null or e.level<=t.max_mascot_level)
        and t.cargo_slots<=e.slot_capacity
      order by md5(t.catalog_key || e.mascot_id::text || generation_day::text)
      limit 1
    ) template on true
    join lateral (
      select jsonb_agg(jsonb_build_object('id', candidate.geoname_id::text, 'name', candidate.name,
        'countryCode', candidate.country_code, 'distanceKm', candidate.distance_km) order by candidate.sort_key) as destinations
      from (
        select city.geoname_id, city.name, city.country_code, distance.distance_km,
          md5(city.geoname_id::text || e.mascot_id::text || generation_day::text) as sort_key
        from public.geonames_cities city
        cross join lateral (
          select round((6371*2*asin(least(1,sqrt(power(sin(radians((city.latitude-e.home_latitude)/2)),2)+cos(radians(e.home_latitude))*cos(radians(city.latitude))*power(sin(radians((city.longitude-e.home_longitude)/2)),2)))))::numeric,2) as distance_km
        ) distance
        where city.is_active and city.name<>e.postal_base_city
          and distance.distance_km between least(5,e.max_range_km) and e.max_range_km
        order by md5(city.geoname_id::text || e.mascot_id::text || generation_day::text)
        limit 6
      ) candidate
    ) candidates on jsonb_array_length(candidates.destinations)>0
  )
  insert into public.exclusive_postal_missions(profile_id,mascot_id,generation_date,expires_at,template_catalog_key,cargo_slots,seed_reward,mascot_xp,candidate_destinations)
  select profile_id,mascot_id,generation_day,reference_time+interval '7 days',catalog_key,cargo_slots,seed_reward,mascot_xp,destinations
  from prepared
  on conflict(profile_id,mascot_id,generation_date) do nothing;
  get diagnostics inserted_count=row_count;
  return inserted_count;
end $$;

create or replace function public.claim_exclusive_postal_mission_generations(batch_size integer default 20)
returns table(mission_id uuid, lease_token uuid, mascot_name text, origin_hint text, candidates jsonb)
language plpgsql security definer set search_path=public,auth,pg_temp as $$
begin
  if auth.role()<>'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
  if batch_size < 1 or batch_size > 50 then raise exception 'Invalid mission generation batch size' using errcode='22023'; end if;
  return query
  with claimed as (
    select mission.id
    from public.exclusive_postal_missions mission
    where mission.status='pending' and (mission.generation_lease_expires_at is null or mission.generation_lease_expires_at<now())
    order by mission.created_at, mission.id
    for update skip locked
    limit batch_size
  ), updated as (
    update public.exclusive_postal_missions mission
    set generation_lease_token=gen_random_uuid(), generation_lease_expires_at=now()+interval '10 minutes', updated_at=now()
    from claimed where mission.id=claimed.id
    returning mission.*
  )
  select mission.id, mission.generation_lease_token, mascot.name,
    concat_ws(' · ', nullif(profile.postal_base_city,''), nullif(profile.postal_base_country,'')), mission.candidate_destinations
  from updated mission
  join public.profiles profile on profile.id=mission.profile_id
  join public.player_mascots mascot on mascot.id=mission.mascot_id;
end $$;

create or replace function public.complete_exclusive_postal_mission_generation(target_mission_id uuid, target_lease_token uuid, selected_geoname_id bigint, localized_copy jsonb, used_fallback boolean default false)
returns boolean language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare mission public.exclusive_postal_missions; city public.geonames_cities; selected_candidate jsonb; pt_title text; pt_story text; en_title text; en_story text;
begin
  if auth.role()<>'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
  select * into mission from public.exclusive_postal_missions where id=target_mission_id for update;
  if mission.id is null or mission.status<>'pending' or mission.generation_lease_token is distinct from target_lease_token or mission.generation_lease_expires_at<now() then return false; end if;
  select value into selected_candidate from jsonb_array_elements(mission.candidate_destinations) where value->>'id'=selected_geoname_id::text;
  if selected_candidate is null then raise exception 'Destination is not a mission candidate' using errcode='22023'; end if;
  if localized_copy is null or jsonb_typeof(localized_copy)<>'object' then raise exception 'Invalid mission copy' using errcode='22023'; end if;
  pt_title:=btrim(localized_copy#>>'{pt-BR,title}'); pt_story:=btrim(localized_copy#>>'{pt-BR,story}');
  en_title:=btrim(localized_copy#>>'{en-US,title}'); en_story:=btrim(localized_copy#>>'{en-US,story}');
  if char_length(pt_title) not between 1 and 90 or char_length(en_title) not between 1 and 90
     or char_length(pt_story) not between 1 and 480 or char_length(en_story) not between 1 and 480 then
    raise exception 'Invalid mission copy length' using errcode='22023';
  end if;
  select * into city from public.geonames_cities where geoname_id=selected_geoname_id and is_active;
  if city.geoname_id is null then raise exception 'Mission destination is unavailable' using errcode='22023'; end if;
  update public.exclusive_postal_missions set
    status='offered', destination_geoname_id=city.geoname_id, destination_name=city.name, destination_country_code=city.country_code,
    destination_latitude=city.latitude, destination_longitude=city.longitude, distance_km=(selected_candidate->>'distanceKm')::numeric,
    copy=localized_copy || jsonb_build_object('generationMode',case when used_fallback then 'fallback' else 'ai' end), generated_at=now(),
    generation_lease_token=null, generation_lease_expires_at=null, updated_at=now()
  where id=mission.id;
  return true;
end $$;

create or replace function public.list_exclusive_postal_missions()
returns table(id uuid, mascot_id uuid, mascot_name text, status text, expires_at timestamptz, destination_name text, destination_country_code text, distance_km numeric, cargo_slots integer, seed_reward integer, mascot_xp integer, copy jsonb)
language sql security definer set search_path=public,auth,pg_temp as $$
  select mission.id, mission.mascot_id, mascot.name, mission.status, mission.expires_at, mission.destination_name,
    mission.destination_country_code, mission.distance_km, mission.cargo_slots, mission.seed_reward, mission.mascot_xp, mission.copy
  from public.exclusive_postal_missions mission
  join public.profiles profile on profile.id=mission.profile_id
  join public.player_mascots mascot on mascot.id=mission.mascot_id
  where profile.auth_user_id=auth.uid() and mission.status in ('offered','accepted','expired')
  order by case mission.status when 'offered' then 0 when 'accepted' then 1 else 2 end, mascot.name, mission.created_at desc
$$;

create or replace function public.accept_exclusive_postal_mission(target_mission_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid; mission public.exclusive_postal_missions;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  select * into mission from public.exclusive_postal_missions where id=target_mission_id and profile_id=me for update;
  if mission.id is null or mission.status not in ('offered','accepted') or mission.expires_at<=now() then raise exception 'Exclusive mission is unavailable' using errcode='22023'; end if;
  update public.exclusive_postal_missions set status='accepted',accepted_at=coalesce(accepted_at,now()),updated_at=now() where id=mission.id returning * into mission;
  return to_jsonb(mission);
end $$;

create or replace function public.dispatch_exclusive_postal_mission(target_mission_id uuid)
returns public.deliveries language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me public.profiles; mission public.exclusive_postal_missions; pet public.player_mascots; d public.deliveries; actual_distance numeric; speed numeric; started timestamptz:=now();
begin
  select * into me from public.profiles where auth_user_id=auth.uid() for update;
  select * into mission from public.exclusive_postal_missions where id=target_mission_id and profile_id=me.id for update;
  if mission.id is null or mission.status<>'accepted' or mission.expires_at<=started then raise exception 'Exclusive mission must be accepted before departure' using errcode='22023'; end if;
  select * into pet from public.player_mascots where id=mission.mascot_id and owner_profile_id=me.id for update;
  if pet.id is null or exists(select 1 from public.deliveries where mascot_id=pet.id and status<>'completed') then raise exception 'Mascot is unavailable' using errcode='23505'; end if;
  select round((6371*2*asin(least(1,sqrt(power(sin(radians((mission.destination_latitude-me.home_latitude)/2)),2)+cos(radians(me.home_latitude))*cos(radians(mission.destination_latitude))*power(sin(radians((mission.destination_longitude-me.home_longitude)/2)),2)))))::numeric,2) into actual_distance;
  if actual_distance>(public.m58_flight_rule(pet.level)->>'maxOneWayKm')::numeric then raise exception 'Route exceeds mascot flight range' using errcode='22023'; end if;
  if mission.cargo_slots>(public.m58_flight_rule(pet.level)->>'naturalSlots')::integer + coalesce((select c.slot_bonus from public.mascot_loadouts l join public.equipment_instances i on i.id=l.backpack_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=pet.id),0) then raise exception 'Mission cargo does not fit' using errcode='22023'; end if;
  speed:=(28+coalesce((pet.attributes->>'speed')::numeric,0)*4+coalesce((pet.attributes->>'stamina')::numeric,0)*2)::numeric(10,2);
  insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,origin_place_label,destination_latitude,destination_longitude,destination_label_key,destination_place_label,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,travel_slot_capacity,travel_slots_used)
  values(gen_random_uuid(),me.id,me.id,pet.id,me.home_latitude,me.home_longitude,me.home_label_key,me.postal_base_city,mission.destination_latitude,mission.destination_longitude,'exclusiveMissions.destination',mission.destination_name,actual_distance,speed,started,started+((actual_distance/speed)*interval '1 hour'),started+((actual_distance/speed)*interval '1 hour')+interval '5 minutes',started+((actual_distance/speed)*interval '2 hours')+interval '5 minutes','outbound',concat('exclusive-',mission.id),0,mission.cargo_slots) returning * into d;
  insert into public.exclusive_postal_mission_runs(delivery_id,mission_id,profile_id,mascot_id,seed_reward,mascot_xp) values(d.id,mission.id,me.id,pet.id,mission.seed_reward,mission.mascot_xp);
  update public.exclusive_postal_missions set status='departed',departed_at=started,updated_at=started where id=mission.id;
  return d;
end $$;

create or replace function public.collect_delivery_progression_on_completion()
returns trigger language plpgsql security definer set search_path=public,auth as $$
begin
  if new.status='completed' and old.status is distinct from 'completed' and not new.is_tutorial
     and not exists(select 1 from public.postal_job_runs where delivery_id=new.id)
     and not exists(select 1 from public.exclusive_postal_mission_runs where delivery_id=new.id) then
    perform public.apply_delivery_progression(new.id);
  end if;
  return new;
end $$;

create or replace function public.credit_exclusive_postal_mission_rewards()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare run public.exclusive_postal_mission_runs; pet public.player_mascots; level_ups integer:=0;
begin
  if new.status='completed' and old.status is distinct from 'completed' then
    select * into run from public.exclusive_postal_mission_runs where delivery_id=new.id for update;
    if run.delivery_id is not null then
      insert into public.exclusive_postal_mission_seed_ledger(profile_id,mission_delivery_id,quantity) values(run.profile_id,run.delivery_id,run.seed_reward) on conflict(mission_delivery_id) do nothing;
      if found then
        insert into public.profile_seed_balances(profile_id,quantity) values(run.profile_id,run.seed_reward) on conflict(profile_id) do update set quantity=profile_seed_balances.quantity+excluded.quantity,updated_at=now();
        select * into pet from public.player_mascots where id=run.mascot_id for update;
        while pet.xp+run.mascot_xp>=pet.next_level_xp and pet.level<100 loop
          pet.xp:=pet.xp-pet.next_level_xp; pet.level:=pet.level+1; pet.next_level_xp:=public.progression_next_level_xp('mascot',pet.level); level_ups:=level_ups+1;
        end loop;
        pet.xp:=pet.xp+run.mascot_xp;
        update public.player_mascots set level=pet.level,xp=pet.xp,next_level_xp=pet.next_level_xp,updated_at=now() where id=pet.id;
        update public.exclusive_postal_mission_runs set collected_at=now() where delivery_id=run.delivery_id;
      end if;
    end if;
  end if;
  return new;
end $$;
create trigger exclusive_postal_mission_credit_on_completion after update of status on public.deliveries for each row execute function public.credit_exclusive_postal_mission_rewards();

create or replace function public.invoke_exclusive_postal_mission_edge_function() returns bigint
language plpgsql security definer set search_path=public,extensions,vault,pg_temp as $$
declare project_url text; cron_secret text;
begin
  select decrypted_secret into project_url from vault.decrypted_secrets where name='duif_project_url' limit 1;
  select decrypted_secret into cron_secret from vault.decrypted_secrets where name='duif_exclusive_mission_cron_secret' limit 1;
  if project_url is null or cron_secret is null then return null; end if;
  return net.http_post(url=>rtrim(project_url,'/')||'/functions/v1/exclusive-mission-generator',headers=>jsonb_build_object('Content-Type','application/json','X-Duif-Cron-Secret',cron_secret),body=>'{}'::jsonb,timeout_milliseconds=>60000);
end $$;
do $$ begin
  if exists(select 1 from cron.job where jobname='duif-exclusive-mission-generator') then perform cron.unschedule('duif-exclusive-mission-generator'); end if;
  perform cron.schedule('duif-exclusive-mission-generator','10 3 * * *',$job$select public.invoke_exclusive_postal_mission_edge_function()$job$);
end $$;

revoke all on table public.exclusive_postal_missions,public.exclusive_postal_mission_runs,public.exclusive_postal_mission_seed_ledger from anon,authenticated;
revoke all on function public.exclusive_mission_local_day(timestamptz),public.prepare_exclusive_postal_missions(timestamptz,integer),public.claim_exclusive_postal_mission_generations(integer),public.complete_exclusive_postal_mission_generation(uuid,uuid,bigint,jsonb,boolean),public.credit_exclusive_postal_mission_rewards(),public.invoke_exclusive_postal_mission_edge_function() from public,anon,authenticated;
revoke all on function public.list_exclusive_postal_missions(),public.accept_exclusive_postal_mission(uuid),public.dispatch_exclusive_postal_mission(uuid) from public,anon;
grant execute on function public.list_exclusive_postal_missions(),public.accept_exclusive_postal_mission(uuid),public.dispatch_exclusive_postal_mission(uuid) to authenticated;
grant execute on function public.prepare_exclusive_postal_missions(timestamptz,integer),public.claim_exclusive_postal_mission_generations(integer),public.complete_exclusive_postal_mission_generation(uuid,uuid,bigint,jsonb,boolean) to service_role;
