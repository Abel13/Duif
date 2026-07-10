alter table public.profiles
  add column if not exists postal_base_street text,
  add column if not exists postal_base_neighborhood text,
  add column if not exists postal_base_city text,
  add column if not exists postal_base_state text,
  add column if not exists postal_base_country text;

update public.profiles
set
  postal_base_street = case mock_key
    when 'player-current' then 'Rua das Cartas'
    when 'friend-lisbon' then 'Rua dos Azulejos'
    when 'friend-curitiba' then 'Rua das Araucarias'
    when 'friend-toronto' then 'Maple Letter Street'
    else coalesce(postal_base_street, 'Private postal street')
  end,
  postal_base_neighborhood = case mock_key
    when 'player-current' then 'Centro Postal'
    when 'friend-lisbon' then 'Alfama'
    when 'friend-curitiba' then 'Batel'
    when 'friend-toronto' then 'Harbourfront'
    else coalesce(postal_base_neighborhood, 'Private postal neighborhood')
  end,
  postal_base_city = case mock_key
    when 'player-current' then 'Sao Paulo'
    when 'friend-lisbon' then 'Lisboa'
    when 'friend-curitiba' then 'Curitiba'
    when 'friend-toronto' then 'Toronto'
    else coalesce(postal_base_city, 'Unknown city')
  end,
  postal_base_state = case mock_key
    when 'player-current' then 'SP'
    when 'friend-lisbon' then 'Lisboa'
    when 'friend-curitiba' then 'PR'
    when 'friend-toronto' then 'ON'
    else coalesce(postal_base_state, 'Unknown state')
  end,
  postal_base_country = case mock_key
    when 'player-current' then 'Brasil'
    when 'friend-lisbon' then 'Portugal'
    when 'friend-curitiba' then 'Brasil'
    when 'friend-toronto' then 'Canada'
    else coalesce(postal_base_country, 'Unknown country')
  end;

alter table public.profiles
  alter column postal_base_street set not null,
  alter column postal_base_neighborhood set not null,
  alter column postal_base_city set not null,
  alter column postal_base_state set not null,
  alter column postal_base_country set not null;

drop policy if exists "Profiles are readable by accepted friends" on public.profiles;

create or replace function public.get_accepted_friend_profiles()
returns table (
  profile_id uuid,
  mock_key text,
  display_name text,
  postal_base_city text,
  postal_base_state text,
  postal_base_country text,
  friendship_level integer,
  exchange_count integer,
  favorite_note_key text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_auth_user_id uuid := auth.uid();
  current_profile_id uuid;
begin
  if current_auth_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select id
  into current_profile_id
  from public.profiles
  where auth_user_id = current_auth_user_id;

  if current_profile_id is null then
    raise exception 'Current profile not found' using errcode = '28000';
  end if;

  return query
    select
      friend_profile.id as profile_id,
      friend_profile.mock_key,
      friend_profile.display_name,
      friend_profile.postal_base_city,
      friend_profile.postal_base_state,
      friend_profile.postal_base_country,
      friendships.friendship_level,
      friendships.exchange_count,
      friendships.favorite_note_key
    from public.friendships
    join public.profiles as friend_profile
      on friend_profile.id = case
        when friendships.requester_profile_id = current_profile_id
          then friendships.addressee_profile_id
        else friendships.requester_profile_id
      end
    where friendships.status = 'accepted'
      and current_profile_id in (
        friendships.requester_profile_id,
        friendships.addressee_profile_id
      );
end;
$$;

revoke all on function public.get_accepted_friend_profiles() from public;
grant execute on function public.get_accepted_friend_profiles() to authenticated;
