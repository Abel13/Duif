-- Acceptance must respect the mascot's current trip as well as departure.
-- This preserves the rule in the authoritative backend when clients are stale.
create or replace function public.accept_exclusive_postal_mission(target_mission_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid; mission public.exclusive_postal_missions; pet public.player_mascots;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  select * into mission from public.exclusive_postal_missions where id=target_mission_id and profile_id=me for update;
  if mission.id is null or mission.status not in ('offered','accepted') or mission.expires_at<=now() then
    raise exception 'Exclusive mission is unavailable' using errcode='22023';
  end if;
  select * into pet from public.player_mascots where id=mission.mascot_id and owner_profile_id=me for update;
  if pet.id is null or exists(select 1 from public.deliveries where mascot_id=pet.id and status<>'completed') then
    raise exception 'Mascot is unavailable' using errcode='23505';
  end if;
  update public.exclusive_postal_missions
  set status='accepted',accepted_at=coalesce(accepted_at,now()),updated_at=now()
  where id=mission.id
  returning * into mission;
  return to_jsonb(mission);
end $$;

revoke all on function public.accept_exclusive_postal_mission(uuid) from public,anon;
grant execute on function public.accept_exclusive_postal_mission(uuid) to authenticated;
