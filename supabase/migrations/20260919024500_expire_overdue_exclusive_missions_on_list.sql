-- Time-expired exclusive offers stayed status=offered when prepare could not
-- run, so the board still showed Accept while accept_exclusive_postal_mission
-- correctly rejected them. Expire overdue rows for the caller on list.

create or replace function public.list_exclusive_postal_missions()
returns table(
  id uuid,
  mascot_id uuid,
  mascot_name text,
  status text,
  expires_at timestamptz,
  destination_name text,
  destination_country_code text,
  distance_km numeric,
  cargo_slots integer,
  seed_reward integer,
  mascot_xp integer,
  copy jsonb
)
language plpgsql
security definer
set search_path=public,auth,pg_temp
as $$
declare
  me uuid;
begin
  select profiles.id into me from public.profiles where profiles.auth_user_id = auth.uid();
  if me is null then
    return;
  end if;

  update public.exclusive_postal_missions mission
  set
    status = 'expired',
    expired_at = coalesce(mission.expired_at, now()),
    updated_at = now()
  where mission.profile_id = me
    and mission.status in ('pending', 'offered', 'accepted')
    and mission.expires_at <= now();

  return query
  select
    mission.id,
    mission.mascot_id,
    mascot.name,
    mission.status,
    mission.expires_at,
    mission.destination_name,
    mission.destination_country_code,
    mission.distance_km,
    mission.cargo_slots,
    mission.seed_reward,
    mission.mascot_xp,
    mission.copy
  from public.exclusive_postal_missions mission
  join public.player_mascots mascot on mascot.id = mission.mascot_id
  where mission.profile_id = me
    and mission.status in ('offered', 'accepted', 'expired')
    and mission.generation_date = (
      select max(latest.generation_date)
      from public.exclusive_postal_missions latest
      where latest.profile_id = mission.profile_id
        and latest.mascot_id = mission.mascot_id
    )
  order by
    case mission.status
      when 'offered' then 0
      when 'accepted' then 1
      else 2
    end,
    mascot.name;
end;
$$;

revoke all on function public.list_exclusive_postal_missions() from public, anon;
grant execute on function public.list_exclusive_postal_missions() to authenticated;
