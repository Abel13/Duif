create table public.delivery_correspondence_contents (
  id uuid primary key,
  delivery_id uuid not null unique references public.deliveries(id) on delete cascade,
  correspondence_type public.correspondence_type not null,
  letter_text text,
  postcard_message text,
  postcard_variant text,
  sticker_ids text[] not null default '{}',
  gift_note text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint delivery_correspondence_letter_limit check (
    letter_text is null or char_length(letter_text) <= 500
  ),
  constraint delivery_correspondence_postcard_limit check (
    postcard_message is null or char_length(postcard_message) <= 180
  ),
  constraint delivery_correspondence_sticker_limit check (
    cardinality(sticker_ids) <= 3
  )
);

create index delivery_correspondence_contents_delivery_id_idx
  on public.delivery_correspondence_contents(delivery_id);

alter table public.delivery_correspondence_contents enable row level security;

create policy "Correspondence content is readable by delivery participants"
  on public.delivery_correspondence_contents
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.deliveries
      join public.profiles
        on profiles.id in (deliveries.sender_profile_id, deliveries.receiver_profile_id)
      where deliveries.id = delivery_correspondence_contents.delivery_id
        and profiles.auth_user_id = auth.uid()
    )
  );

drop function if exists public.create_delivery_from_selection(text, text, text);

create or replace function public.create_delivery_from_selection(
  mascot_mock_key text,
  friend_mock_key text,
  correspondence_mock_key text,
  content_payload jsonb
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
  payload_type text := content_payload ->> 'type';
  letter_text_value text := nullif(btrim(content_payload ->> 'letterText'), '');
  postcard_message_value text := nullif(btrim(content_payload ->> 'postcardMessage'), '');
  postcard_variant_value text := nullif(btrim(content_payload ->> 'postcardVariant'), '');
  gift_note_value text := nullif(btrim(content_payload ->> 'giftNote'), '');
  sticker_ids_value text[] := array[]::text[];
begin
  if current_auth_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  if content_payload is null or jsonb_typeof(content_payload) <> 'object' then
    raise exception 'Invalid correspondence content' using errcode = '22023';
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

  if payload_type is distinct from selected_correspondence.type::text then
    raise exception 'Correspondence content type mismatch' using errcode = '22023';
  end if;

  if selected_correspondence.type = 'letter' then
    if letter_text_value is null or char_length(letter_text_value) > 500 then
      raise exception 'Letter text must be between 1 and 500 characters' using errcode = '22023';
    end if;
  elsif selected_correspondence.type = 'postcard' then
    if postcard_variant_value is null or postcard_variant_value not in ('city', 'event', 'photo') then
      raise exception 'Invalid postcard variant' using errcode = '22023';
    end if;

    if postcard_message_value is not null and char_length(postcard_message_value) > 180 then
      raise exception 'Postcard message must be 180 characters or less' using errcode = '22023';
    end if;
  elsif selected_correspondence.type = 'sticker' then
    if jsonb_typeof(content_payload -> 'stickerIds') <> 'array' then
      raise exception 'Sticker content must include sticker ids' using errcode = '22023';
    end if;

    select coalesce(array_agg(value), array[]::text[])
    into sticker_ids_value
    from jsonb_array_elements_text(content_payload -> 'stickerIds') as value;

    if cardinality(sticker_ids_value) < 1 or cardinality(sticker_ids_value) > 3 then
      raise exception 'Sticker content must include 1 to 3 stickers' using errcode = '22023';
    end if;
  elsif selected_correspondence.type = 'smallGift' then
    if gift_note_value is not null and char_length(gift_note_value) > 180 then
      raise exception 'Gift note must be 180 characters or less' using errcode = '22023';
    end if;
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

  insert into public.delivery_correspondence_contents (
    id,
    delivery_id,
    correspondence_type,
    letter_text,
    postcard_message,
    postcard_variant,
    sticker_ids,
    gift_note,
    metadata
  ) values (
    gen_random_uuid(),
    inserted_delivery.id,
    selected_correspondence.type,
    case when selected_correspondence.type = 'letter' then letter_text_value else null end,
    case when selected_correspondence.type = 'postcard' then postcard_message_value else null end,
    case when selected_correspondence.type = 'postcard' then postcard_variant_value else null end,
    case when selected_correspondence.type = 'sticker' then sticker_ids_value else array[]::text[] end,
    case when selected_correspondence.type = 'smallGift' then gift_note_value else null end,
    jsonb_build_object(
      'prototype', true,
      'createdBy', 'create_delivery_from_selection'
    )
  );

  return inserted_delivery;
end;
$$;

revoke all on function public.create_delivery_from_selection(text, text, text, jsonb) from public;
grant execute on function public.create_delivery_from_selection(text, text, text, jsonb) to authenticated;
