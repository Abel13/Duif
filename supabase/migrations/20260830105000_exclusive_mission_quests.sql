-- Exclusive missions are authored as structured quests. The model receives only
-- approved fictional template context; geography and gameplay remain database-owned.

drop function public.claim_exclusive_postal_mission_generations(integer);

create function public.claim_exclusive_postal_mission_generations(batch_size integer default 20)
returns table(mission_id uuid, lease_token uuid, mascot_name text, origin_hint text, cargo_slots integer, template_catalog_key text, candidates jsonb)
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
    concat_ws(' · ', nullif(profile.postal_base_city,''), nullif(profile.postal_base_country,'')),
    mission.cargo_slots, mission.template_catalog_key, mission.candidate_destinations
  from updated mission
  join public.profiles profile on profile.id=mission.profile_id
  join public.player_mascots mascot on mascot.id=mission.mascot_id;
end $$;

create or replace function public.complete_exclusive_postal_mission_generation(target_mission_id uuid, target_lease_token uuid, selected_geoname_id bigint, localized_copy jsonb, used_fallback boolean default false)
returns boolean language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare
  mission public.exclusive_postal_missions;
  city public.geonames_cities;
  selected_candidate jsonb;
  pt_title text; pt_briefing text; pt_outbound_objective text; pt_return_record text;
  en_title text; en_briefing text; en_outbound_objective text; en_return_record text;
begin
  if auth.role()<>'service_role' then raise exception 'Forbidden' using errcode='42501'; end if;
  select * into mission from public.exclusive_postal_missions where id=target_mission_id for update;
  if mission.id is null or mission.status<>'pending' or mission.generation_lease_token is distinct from target_lease_token or mission.generation_lease_expires_at<now() then return false; end if;
  select value into selected_candidate from jsonb_array_elements(mission.candidate_destinations) where value->>'id'=selected_geoname_id::text;
  if selected_candidate is null then raise exception 'Destination is not a mission candidate' using errcode='22023'; end if;
  if localized_copy is null or jsonb_typeof(localized_copy)<>'object' then raise exception 'Invalid mission copy' using errcode='22023'; end if;
  pt_title:=btrim(localized_copy#>>'{pt-BR,title}'); pt_briefing:=btrim(localized_copy#>>'{pt-BR,briefing}');
  pt_outbound_objective:=btrim(localized_copy#>>'{pt-BR,outboundObjective}'); pt_return_record:=btrim(localized_copy#>>'{pt-BR,returnRecord}');
  en_title:=btrim(localized_copy#>>'{en-US,title}'); en_briefing:=btrim(localized_copy#>>'{en-US,briefing}');
  en_outbound_objective:=btrim(localized_copy#>>'{en-US,outboundObjective}'); en_return_record:=btrim(localized_copy#>>'{en-US,returnRecord}');
  if coalesce(char_length(pt_title),0) not between 3 and 90 or coalesce(char_length(en_title),0) not between 3 and 90
     or coalesce(char_length(pt_briefing),0) not between 40 and 360 or coalesce(char_length(en_briefing),0) not between 40 and 360
     or coalesce(char_length(pt_outbound_objective),0) not between 24 and 240 or coalesce(char_length(en_outbound_objective),0) not between 24 and 240
     or coalesce(char_length(pt_return_record),0) not between 24 and 240 or coalesce(char_length(en_return_record),0) not between 24 and 240 then
    raise exception 'Invalid quest copy' using errcode='22023';
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

create function public.get_exclusive_postal_mission_dossier(target_delivery_id uuid)
returns table(mission_id uuid, delivery_id uuid, copy jsonb)
language sql security definer set search_path=public,auth,pg_temp as $$
  select mission.id, run.delivery_id, mission.copy
  from public.exclusive_postal_mission_runs run
  join public.exclusive_postal_missions mission on mission.id=run.mission_id
  join public.profiles profile on profile.id=run.profile_id
  where run.delivery_id=target_delivery_id
    and profile.auth_user_id=auth.uid()
$$;

revoke all on function public.claim_exclusive_postal_mission_generations(integer),public.get_exclusive_postal_mission_dossier(uuid) from public,anon,authenticated;
grant execute on function public.claim_exclusive_postal_mission_generations(integer) to service_role;
grant execute on function public.get_exclusive_postal_mission_dossier(uuid) to authenticated;
