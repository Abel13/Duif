create or replace function public.claim_current_profile()
returns public.profiles
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_auth_user_id uuid := auth.uid();
  claimed_profile public.profiles;
begin
  if current_auth_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  update public.profiles
  set
    auth_user_id = current_auth_user_id,
    updated_at = now()
  where mock_key = 'player-current'
    and auth_user_id is null
  returning * into claimed_profile;

  if claimed_profile.id is not null then
    return claimed_profile;
  end if;

  select *
  into claimed_profile
  from public.profiles
  where mock_key = 'player-current'
    and auth_user_id = current_auth_user_id;

  if claimed_profile.id is not null then
    return claimed_profile;
  end if;

  raise exception 'Current profile is already linked to another user' using errcode = '42501';
end;
$$;

revoke all on function public.claim_current_profile() from public;
grant execute on function public.claim_current_profile() to authenticated;
