-- The official job catalog has many variants. Generation receives their stable
-- contact and cargo keys so all variants share an approved fictional quest context.

drop function public.claim_exclusive_postal_mission_generations(integer);

create function public.claim_exclusive_postal_mission_generations(batch_size integer default 20)
returns table(mission_id uuid, lease_token uuid, mascot_name text, origin_hint text, cargo_slots integer, template_catalog_key text, contact_catalog_key text, cargo_key text, candidates jsonb)
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
    mission.cargo_slots, mission.template_catalog_key, template.contact_catalog_key, template.cargo_key, mission.candidate_destinations
  from updated mission
  join public.profiles profile on profile.id=mission.profile_id
  join public.player_mascots mascot on mascot.id=mission.mascot_id
  join public.official_postal_job_templates template on template.catalog_key=mission.template_catalog_key;
end $$;

revoke all on function public.claim_exclusive_postal_mission_generations(integer) from public,anon,authenticated;
grant execute on function public.claim_exclusive_postal_mission_generations(integer) to service_role;
