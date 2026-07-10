create policy "Profiles are readable by accepted friends"
  on public.profiles
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles as current_profile
      join public.friendships
        on friendships.status = 'accepted'
        and (
          (
            friendships.requester_profile_id = current_profile.id
            and friendships.addressee_profile_id = profiles.id
          )
          or (
            friendships.addressee_profile_id = current_profile.id
            and friendships.requester_profile_id = profiles.id
          )
        )
      where current_profile.auth_user_id = auth.uid()
    )
  );

create or replace function public.create_delivery_from_selection(
  mascot_mock_key text,
  friend_mock_key text,
  correspondence_mock_key text
)
returns public.deliveries
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_auth_user_id uuid := auth.uid();
  current_profile public.profiles;
  selected_friend public.profiles;
  selected_mascot public.player_mascots;
  selected_correspondence public.correspondence_options;
  distance_km numeric(10, 2);
  speed_kmh numeric(10, 2);
  outbound_start timestamptz := now();
  outbound_arrival timestamptz;
  return_start timestamptz;
  return_arrival timestamptz;
  inserted_delivery public.deliveries;
begin
  if current_auth_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select *
  into current_profile
  from public.profiles
  where auth_user_id = current_auth_user_id;

  if current_profile.id is null then
    raise exception 'Current profile not found' using errcode = '28000';
  end if;

  select *
  into selected_mascot
  from public.player_mascots
  where owner_profile_id = current_profile.id
    and mock_key = mascot_mock_key;

  if selected_mascot.id is null then
    raise exception 'Mascot not found for current profile' using errcode = '42501';
  end if;

  select *
  into selected_friend
  from public.profiles
  where mock_key = friend_mock_key;

  if selected_friend.id is null then
    raise exception 'Friend profile not found' using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.friendships
    where status = 'accepted'
      and (
        (
          requester_profile_id = current_profile.id
          and addressee_profile_id = selected_friend.id
        )
        or (
          addressee_profile_id = current_profile.id
          and requester_profile_id = selected_friend.id
        )
      )
  ) then
    raise exception 'Friendship not accepted' using errcode = '42501';
  end if;

  select *
  into selected_correspondence
  from public.correspondence_options
  where mock_key = correspondence_mock_key
    and active = true;

  if selected_correspondence.id is null then
    raise exception 'Correspondence option not available' using errcode = '22023';
  end if;

  distance_km := round(
    (
      6371 * 2 * asin(
        least(
          1,
          sqrt(
            power(sin(radians((selected_friend.home_latitude - current_profile.home_latitude) / 2)), 2)
            + cos(radians(current_profile.home_latitude))
            * cos(radians(selected_friend.home_latitude))
            * power(sin(radians((selected_friend.home_longitude - current_profile.home_longitude) / 2)), 2)
          )
        )
      )
    )::numeric,
    2
  );
  speed_kmh := (
    28
    + coalesce((selected_mascot.attributes ->> 'speed')::numeric, 0) * 4
    + coalesce((selected_mascot.attributes ->> 'stamina')::numeric, 0) * 2
  )::numeric(10, 2);

  if speed_kmh <= 0 then
    raise exception 'Invalid mascot speed' using errcode = '22023';
  end if;

  outbound_arrival := outbound_start + ((distance_km / speed_kmh) * interval '1 hour');
  return_start := outbound_arrival + interval '30 minutes';
  return_arrival := return_start + ((distance_km / speed_kmh) * interval '1 hour');

  insert into public.deliveries (
    id,
    mock_key,
    sender_profile_id,
    receiver_profile_id,
    mascot_id,
    correspondence_option_id,
    origin_latitude,
    origin_longitude,
    origin_label_key,
    destination_latitude,
    destination_longitude,
    destination_label_key,
    distance_km,
    animal_speed_kmh,
    outbound_start_at,
    outbound_arrival_at,
    return_start_at,
    return_arrival_at,
    status,
    reward_seed
  ) values (
    gen_random_uuid(),
    null,
    current_profile.id,
    selected_friend.id,
    selected_mascot.id,
    selected_correspondence.id,
    current_profile.home_latitude,
    current_profile.home_longitude,
    current_profile.home_label_key,
    selected_friend.home_latitude,
    selected_friend.home_longitude,
    selected_friend.home_label_key,
    distance_km,
    speed_kmh,
    outbound_start,
    outbound_arrival,
    return_start,
    return_arrival,
    'outbound',
    concat(selected_mascot.mock_key, '-', selected_friend.mock_key, '-', selected_correspondence.mock_key)
  )
  returning * into inserted_delivery;

  update public.deliveries
  set mock_key = concat('delivery-', inserted_delivery.id::text)
  where id = inserted_delivery.id
  returning * into inserted_delivery;

  return inserted_delivery;
end;
$$;

revoke all on function public.create_delivery_from_selection(text, text, text) from public;
grant execute on function public.create_delivery_from_selection(text, text, text) to authenticated;
