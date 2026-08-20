drop function if exists public.get_accepted_friend_profiles();

create function public.get_accepted_friend_profiles()
returns table (
  profile_id uuid, display_name text, postal_base_city text, postal_base_state text,
  postal_base_country text, city_latitude double precision, city_longitude double precision,
  friendship_level integer, exchange_count integer, favorite_note_key text
)
language plpgsql security definer set search_path = public, auth as $$
declare current_profile_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select id into current_profile_id from public.profiles where auth_user_id = auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode = '28000'; end if;
  return query select
    friend_profile.id, friend_profile.display_name, friend_profile.postal_base_city,
    friend_profile.postal_base_state, friend_profile.postal_base_country,
    city.latitude, city.longitude,
    friendship.friendship_level, friendship.exchange_count, friendship.favorite_note_key
  from public.friendships friendship
  join public.profiles friend_profile on friend_profile.id = case
    when friendship.requester_profile_id = current_profile_id then friendship.addressee_profile_id
    else friendship.requester_profile_id end
  left join public.geonames_cities city on city.geoname_id = friend_profile.home_city_geoname_id and city.is_active
  where friendship.status = 'accepted'
    and current_profile_id in (friendship.requester_profile_id, friendship.addressee_profile_id);
end;
$$;

revoke all on function public.get_accepted_friend_profiles() from public;
grant execute on function public.get_accepted_friend_profiles() to authenticated;
