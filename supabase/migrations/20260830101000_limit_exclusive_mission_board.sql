-- Keep expired state visible only until the mascot receives its next daily offer.
create or replace function public.list_exclusive_postal_missions()
returns table(id uuid, mascot_id uuid, mascot_name text, status text, expires_at timestamptz, destination_name text, destination_country_code text, distance_km numeric, cargo_slots integer, seed_reward integer, mascot_xp integer, copy jsonb)
language sql security definer set search_path=public,auth,pg_temp as $$
  select mission.id, mission.mascot_id, mascot.name, mission.status, mission.expires_at, mission.destination_name,
    mission.destination_country_code, mission.distance_km, mission.cargo_slots, mission.seed_reward, mission.mascot_xp, mission.copy
  from public.exclusive_postal_missions mission
  join public.profiles profile on profile.id=mission.profile_id
  join public.player_mascots mascot on mascot.id=mission.mascot_id
  where profile.auth_user_id=auth.uid() and mission.status in ('offered','accepted','expired')
    and mission.generation_date=(
      select max(latest.generation_date) from public.exclusive_postal_missions latest
      where latest.profile_id=mission.profile_id and latest.mascot_id=mission.mascot_id
    )
  order by case mission.status when 'offered' then 0 when 'accepted' then 1 else 2 end, mascot.name
$$;

revoke all on function public.list_exclusive_postal_missions() from public,anon;
grant execute on function public.list_exclusive_postal_missions() to authenticated;
