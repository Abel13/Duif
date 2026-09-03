-- Enrich nearby postal traffic with mascot card fields and encounter friendship requests.

drop function if exists public.get_nearby_postal_traffic(
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision
);

create function public.get_nearby_postal_traffic(
  center_latitude double precision,
  center_longitude double precision,
  viewport_north double precision,
  viewport_east double precision,
  viewport_south double precision,
  viewport_west double precision
)
returns table (
  traffic_id uuid,
  mascot_name text,
  species_key text,
  portrait_asset_key text,
  prestige_asset_key text,
  mascot_level integer,
  trait_name_key text,
  visibility text,
  friendship_state text,
  friend_id text,
  friend_name text,
  origin_latitude double precision,
  origin_longitude double precision,
  destination_latitude double precision,
  destination_longitude double precision,
  origin_region text,
  destination_region text,
  outbound_start_at timestamptz,
  outbound_arrival_at timestamptz,
  return_start_at timestamptz,
  return_arrival_at timestamptz,
  current_latitude double precision,
  current_longitude double precision,
  distance_km double precision
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_profile_id uuid;
  latitude_margin double precision;
  longitude_span double precision;
  expanded_north double precision;
  expanded_south double precision;
  expanded_east double precision;
  expanded_west double precision;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if center_latitude not between -90 and 90
    or center_longitude not between -180 and 180
    or viewport_north not between -90 and 90
    or viewport_south not between -90 and 90
    or viewport_east not between -180 and 180
    or viewport_west not between -180 and 180
    or viewport_north < viewport_south then
    raise exception 'Invalid map viewport' using errcode = '22023';
  end if;

  select id into current_profile_id
  from public.profiles
  where auth_user_id = auth.uid();
  if current_profile_id is null then
    raise exception 'Current profile not found' using errcode = '28000';
  end if;

  latitude_margin := (viewport_north - viewport_south) * 0.25;
  longitude_span := case when viewport_east >= viewport_west
    then viewport_east - viewport_west
    else viewport_east + 360 - viewport_west end;
  expanded_north := least(90, viewport_north + latitude_margin);
  expanded_south := greatest(-90, viewport_south - latitude_margin);
  expanded_east := mod((viewport_east + longitude_span * 0.25 + 540)::numeric, 360)::double precision - 180;
  expanded_west := mod((viewport_west - longitude_span * 0.25 + 540)::numeric, 360)::double precision - 180;

  return query
  with candidates as (
    select
      d.*,
      pm.name as public_mascot_name,
      pm.level as public_mascot_level,
      pm.trait ->> 'nameKey' as public_trait_name_key,
      mt.species_key as public_species_key,
      pm.appearance ->> 'portraitAssetKey' as public_portrait,
      border.asset_key as public_prestige_asset_key,
      owner_profile.id::text as owner_public_id,
      owner_profile.display_name as owner_name,
      case
        when exists (
          select 1 from public.friendships f
          where f.status = 'accepted'
            and current_profile_id in (f.requester_profile_id, f.addressee_profile_id)
            and d.sender_profile_id in (f.requester_profile_id, f.addressee_profile_id)
        ) then concat_ws(', ', owner_profile.postal_base_city, owner_profile.postal_base_state, owner_profile.postal_base_country)
        else concat_ws(', ', owner_profile.postal_base_state, owner_profile.postal_base_country)
      end as origin_public_region,
      case
        when exists (
          select 1 from public.friendships f
          where f.status = 'accepted'
            and current_profile_id in (f.requester_profile_id, f.addressee_profile_id)
            and d.sender_profile_id in (f.requester_profile_id, f.addressee_profile_id)
        ) then concat_ws(', ', receiver_profile.postal_base_city, receiver_profile.postal_base_state, receiver_profile.postal_base_country)
        else concat_ws(', ', receiver_profile.postal_base_state, receiver_profile.postal_base_country)
      end as destination_public_region,
      exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and current_profile_id in (f.requester_profile_id, f.addressee_profile_id)
          and d.sender_profile_id in (f.requester_profile_id, f.addressee_profile_id)
      ) as is_friend,
      (
        select case
          when friendship.status = 'accepted' then 'friend'
          when friendship.status = 'pending' and friendship.requester_profile_id = current_profile_id then 'outgoing'
          when friendship.status = 'pending' and friendship.addressee_profile_id = current_profile_id then 'incoming'
          else 'none'
        end
        from public.friendships friendship
        where least(friendship.requester_profile_id, friendship.addressee_profile_id)
            = least(current_profile_id, d.sender_profile_id)
          and greatest(friendship.requester_profile_id, friendship.addressee_profile_id)
            = greatest(current_profile_id, d.sender_profile_id)
          and friendship.status in ('accepted', 'pending')
        limit 1
      ) as pair_friendship_state,
      round(d.origin_latitude::numeric * 4) / 4.0 as public_origin_latitude,
      round(d.origin_longitude::numeric * 4) / 4.0 as public_origin_longitude,
      round(d.destination_latitude::numeric * 4) / 4.0 as public_destination_latitude,
      round(d.destination_longitude::numeric * 4) / 4.0 as public_destination_longitude,
      case
        when now() < d.outbound_arrival_at then greatest(0, least(1,
          extract(epoch from (now() - d.outbound_start_at)) /
          nullif(extract(epoch from (d.outbound_arrival_at - d.outbound_start_at)), 0)))
        when d.return_start_at is not null and now() >= d.return_start_at then greatest(0, least(1,
          extract(epoch from (now() - d.return_start_at)) /
          nullif(extract(epoch from (d.return_arrival_at - d.return_start_at)), 0)))
        else 1
      end as leg_progress
    from public.deliveries d
    join public.player_mascots pm on pm.id = d.mascot_id
    join public.mascot_templates mt on mt.id = pm.template_id
    join public.profiles owner_profile on owner_profile.id = d.sender_profile_id
    join public.profiles receiver_profile on receiver_profile.id = d.receiver_profile_id
    left join public.mascot_prestige_selections selection on selection.mascot_id = pm.id
    left join public.mascot_prestige_border_catalog border
      on border.catalog_key = selection.border_catalog_key and border.status = 'active'
    where not d.is_tutorial
      and d.sender_profile_id <> current_profile_id
      and not exists (
        select 1 from public.friendships blocked_friendship
        where blocked_friendship.status = 'blocked'
          and current_profile_id in (
            blocked_friendship.requester_profile_id,
            blocked_friendship.addressee_profile_id
          )
          and d.sender_profile_id in (
            blocked_friendship.requester_profile_id,
            blocked_friendship.addressee_profile_id
          )
      )
      and d.status not in ('available', 'returned', 'completed')
      and now() >= d.outbound_start_at
      and (d.return_arrival_at is null or now() < d.return_arrival_at)
  ), positioned as (
    select c.*,
      case when now() < c.outbound_arrival_at
        then c.origin_latitude + (c.destination_latitude - c.origin_latitude) * c.leg_progress
        when c.return_start_at is not null and now() >= c.return_start_at
        then c.destination_latitude + (c.origin_latitude - c.destination_latitude) * c.leg_progress
        else c.destination_latitude end::double precision as exact_current_latitude,
      case when now() < c.outbound_arrival_at
        then mod((c.origin_longitude +
          (mod((c.destination_longitude - c.origin_longitude + 540)::numeric, 360)::double precision - 180) *
          c.leg_progress + 540)::numeric, 360)::double precision - 180
        when c.return_start_at is not null and now() >= c.return_start_at
        then mod((c.destination_longitude +
          (mod((c.origin_longitude - c.destination_longitude + 540)::numeric, 360)::double precision - 180) *
          c.leg_progress + 540)::numeric, 360)::double precision - 180
        else c.destination_longitude end::double precision as exact_current_longitude,
      case when now() < c.outbound_arrival_at
        then c.public_origin_latitude + (c.public_destination_latitude - c.public_origin_latitude) * c.leg_progress
        when c.return_start_at is not null and now() >= c.return_start_at
        then c.public_destination_latitude + (c.public_origin_latitude - c.public_destination_latitude) * c.leg_progress
        else c.public_destination_latitude end::double precision as public_current_latitude,
      case when now() < c.outbound_arrival_at
        then mod((c.public_origin_longitude +
          (mod((c.public_destination_longitude - c.public_origin_longitude + 540)::numeric, 360)::double precision - 180) *
          c.leg_progress + 540)::numeric, 360)::double precision - 180
        when c.return_start_at is not null and now() >= c.return_start_at
        then mod((c.public_destination_longitude +
          (mod((c.public_origin_longitude - c.public_destination_longitude + 540)::numeric, 360)::double precision - 180) *
          c.leg_progress + 540)::numeric, 360)::double precision - 180
        else c.public_destination_longitude end::double precision as public_current_longitude
    from candidates c
  ), visible as (
    select p.*,
      6371 * 2 * asin(sqrt(
        power(sin(radians(p.exact_current_latitude - center_latitude) / 2), 2) +
        cos(radians(center_latitude)) * cos(radians(p.exact_current_latitude)) *
        power(sin(radians(p.exact_current_longitude - center_longitude) / 2), 2)
      )) as center_distance
    from positioned p
    where p.exact_current_latitude between expanded_south and expanded_north
      and (case when expanded_east >= expanded_west
        then p.exact_current_longitude between expanded_west and expanded_east
        else p.exact_current_longitude >= expanded_west or p.exact_current_longitude <= expanded_east end)
  )
  select
    v.id,
    v.public_mascot_name,
    v.public_species_key,
    coalesce(v.public_portrait, ''),
    v.public_prestige_asset_key,
    v.public_mascot_level,
    coalesce(v.public_trait_name_key, ''),
    case when v.is_friend then 'friend' else 'public' end,
    coalesce(v.pair_friendship_state, 'none'),
    case when v.is_friend then v.owner_public_id end,
    case when v.is_friend then v.owner_name end,
    v.public_origin_latitude::double precision,
    v.public_origin_longitude::double precision,
    v.public_destination_latitude::double precision,
    v.public_destination_longitude::double precision,
    v.origin_public_region,
    v.destination_public_region,
    v.outbound_start_at,
    v.outbound_arrival_at,
    v.return_start_at,
    v.return_arrival_at,
    v.public_current_latitude,
    v.public_current_longitude,
    v.center_distance
  from visible v
  order by v.center_distance, v.id
  limit 10;
end;
$$;

revoke all on function public.get_nearby_postal_traffic(
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision
) from public;
grant execute on function public.get_nearby_postal_traffic(
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision
) to authenticated;

create or replace function public.request_friendship_from_postal_traffic(traffic_delivery_id uuid)
returns table(outcome text, request_id uuid)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_profile_id uuid := public.current_profile_for_postal_friendship();
  target_profile_id uuid;
  request_record public.friendships;
  limit_record public.postal_friend_code_rate_limits;
  now_at timestamptz := now();
begin
  insert into public.postal_friend_code_rate_limits(profile_id, window_started_at, request_count, updated_at)
  values (current_profile_id, now_at, 1, now_at)
  on conflict (profile_id) do update set
    window_started_at = case
      when postal_friend_code_rate_limits.window_started_at <= now_at - interval '1 minute' then now_at
      else postal_friend_code_rate_limits.window_started_at
    end,
    request_count = case
      when postal_friend_code_rate_limits.window_started_at <= now_at - interval '1 minute' then 1
      else postal_friend_code_rate_limits.request_count + 1
    end,
    updated_at = now_at
  returning * into limit_record;
  if limit_record.request_count > 10 then
    raise exception 'Postal friend code rate limit exceeded' using errcode = '22023';
  end if;

  if traffic_delivery_id is null then
    return query select 'unavailable'::text, null::uuid;
    return;
  end if;

  select d.sender_profile_id into target_profile_id
  from public.deliveries d
  where d.id = traffic_delivery_id
    and not d.is_tutorial
    and d.sender_profile_id <> current_profile_id
    and d.status not in ('available', 'returned', 'completed')
    and now() >= d.outbound_start_at
    and (d.return_arrival_at is null or now() < d.return_arrival_at);

  if target_profile_id is null then
    return query select 'unavailable'::text, null::uuid;
    return;
  end if;

  if exists (
    select 1 from public.friendships blocked_friendship
    where blocked_friendship.status = 'blocked'
      and current_profile_id in (
        blocked_friendship.requester_profile_id,
        blocked_friendship.addressee_profile_id
      )
      and target_profile_id in (
        blocked_friendship.requester_profile_id,
        blocked_friendship.addressee_profile_id
      )
  ) then
    return query select 'unavailable'::text, null::uuid;
    return;
  end if;

  select * into request_record
  from public.friendships
  where least(requester_profile_id, addressee_profile_id) = least(current_profile_id, target_profile_id)
    and greatest(requester_profile_id, addressee_profile_id) = greatest(current_profile_id, target_profile_id)
  for update;

  if request_record.id is not null then
    if request_record.status = 'accepted' then
      return query select 'alreadyFriends'::text, request_record.id;
    elsif request_record.status = 'blocked' then
      return query select 'unavailable'::text, null::uuid;
    elsif request_record.addressee_profile_id = current_profile_id then
      return query select 'receivedPending'::text, request_record.id;
    else
      return query select 'alreadyPending'::text, request_record.id;
    end if;
    return;
  end if;

  insert into public.friendships(
    id, requester_profile_id, addressee_profile_id, status, friendship_level, exchange_count
  ) values (
    gen_random_uuid(), current_profile_id, target_profile_id, 'pending', 1, 0
  ) returning * into request_record;

  return query select 'sent'::text, request_record.id;
end;
$$;

revoke all on function public.request_friendship_from_postal_traffic(uuid) from public, anon;
grant execute on function public.request_friendship_from_postal_traffic(uuid) to authenticated;
