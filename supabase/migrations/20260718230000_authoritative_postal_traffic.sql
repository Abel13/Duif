create or replace function public.get_nearby_postal_traffic(
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
  portrait_asset_path text,
  visibility text,
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
      mt.species_key as public_species_key,
      pm.appearance ->> 'portraitAssetPath' as public_portrait,
      owner_profile.mock_key as owner_mock_key,
      owner_profile.display_name as owner_name,
      concat_ws(', ', owner_profile.postal_base_state, owner_profile.postal_base_country) as origin_public_region,
      concat_ws(', ', receiver_profile.postal_base_state, receiver_profile.postal_base_country) as destination_public_region,
      exists (
        select 1 from public.friendships f
        where f.status = 'accepted'
          and current_profile_id in (f.requester_profile_id, f.addressee_profile_id)
          and d.sender_profile_id in (f.requester_profile_id, f.addressee_profile_id)
      ) as is_friend,
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
    where d.sender_profile_id <> current_profile_id
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
    v.id, v.public_mascot_name, v.public_species_key, coalesce(v.public_portrait, ''),
    case when v.is_friend then 'friend' else 'public' end,
    case when v.is_friend then coalesce(v.owner_mock_key, v.sender_profile_id::text) end,
    case when v.is_friend then v.owner_name end,
    v.public_origin_latitude::double precision, v.public_origin_longitude::double precision,
    v.public_destination_latitude::double precision, v.public_destination_longitude::double precision,
    v.origin_public_region, v.destination_public_region,
    v.outbound_start_at, v.outbound_arrival_at, v.return_start_at, v.return_arrival_at,
    v.public_current_latitude, v.public_current_longitude, v.center_distance
  from visible v
  order by v.center_distance, v.id
  limit 10;
end;
$$;

revoke all on function public.get_nearby_postal_traffic(double precision, double precision, double precision, double precision, double precision, double precision) from public;
grant execute on function public.get_nearby_postal_traffic(double precision, double precision, double precision, double precision, double precision, double precision) to authenticated;
