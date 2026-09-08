-- Replace viewport-authorized postal traffic with local encounters resolved from a
-- server-side nest or owned-mascot anchor, using admin encounter runtime settings.

create or replace function public.encounter_runtime_numeric(setting_key text, fallback numeric)
returns numeric
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select coalesce(
    nullif((select setting_value #>> '{}' from public.app_runtime_settings where setting_key = encounter_runtime_numeric.setting_key), '')::numeric,
    fallback
  );
$$;

revoke all on function public.encounter_runtime_numeric(text, numeric) from public, anon, authenticated;

create or replace function public.get_encounter_client_settings()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  return jsonb_build_object(
    'refreshMinutes', round(public.encounter_runtime_numeric('encounter.refreshMinutes', 5))::int,
    'resultLimit', round(public.encounter_runtime_numeric('encounter.resultLimit', 5))::int
  );
end;
$$;

revoke all on function public.get_encounter_client_settings() from public, anon;
grant execute on function public.get_encounter_client_settings() to authenticated;

drop function if exists public.get_nearby_postal_traffic(
  double precision,
  double precision,
  double precision,
  double precision,
  double precision,
  double precision
);

create function public.get_nearby_postal_traffic(
  anchor_kind text,
  target_mascot_id uuid default null
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
  nest_latitude double precision;
  nest_longitude double precision;
  anchor_latitude double precision;
  anchor_longitude double precision;
  radius_km numeric;
  result_limit integer;
  leg_progress double precision;
  origin_lat double precision;
  origin_lng double precision;
  destination_lat double precision;
  destination_lng double precision;
  outbound_start timestamptz;
  outbound_arrival timestamptz;
  return_start timestamptz;
  return_arrival timestamptz;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if anchor_kind is null or anchor_kind not in ('nest', 'mascot') then
    raise exception 'Invalid encounter anchor' using errcode = '22023';
  end if;

  select id, home_latitude, home_longitude
  into current_profile_id, nest_latitude, nest_longitude
  from public.profiles
  where auth_user_id = auth.uid();
  if current_profile_id is null then
    raise exception 'Current profile not found' using errcode = '28000';
  end if;

  if anchor_kind = 'nest' then
    if target_mascot_id is not null then
      raise exception 'Nest encounters do not accept a mascot id' using errcode = '22023';
    end if;
    if nest_latitude is null or nest_longitude is null
      or nest_latitude not between -90 and 90
      or nest_longitude not between -180 and 180 then
      raise exception 'Nest coordinates unavailable' using errcode = '22023';
    end if;
    anchor_latitude := nest_latitude;
    anchor_longitude := nest_longitude;
  else
    if target_mascot_id is null then
      raise exception 'Mascot encounters require a mascot id' using errcode = '22023';
    end if;

    select
      d.origin_latitude, d.origin_longitude, d.destination_latitude, d.destination_longitude,
      d.outbound_start_at, d.outbound_arrival_at, d.return_start_at, d.return_arrival_at
    into
      origin_lat, origin_lng, destination_lat, destination_lng,
      outbound_start, outbound_arrival, return_start, return_arrival
    from public.player_mascots pm
    join public.deliveries d on d.mascot_id = pm.id
    where pm.id = target_mascot_id
      and pm.owner_profile_id = current_profile_id
      and not d.is_tutorial
      and d.status not in ('available', 'returned', 'completed')
      and now() >= d.outbound_start_at
      and (d.return_arrival_at is null or now() < d.return_arrival_at)
    order by d.outbound_start_at desc
    limit 1;

    if origin_lat is null then
      raise exception 'Selected mascot is not on an active journey' using errcode = '22023';
    end if;

    if now() < outbound_arrival then
      leg_progress := greatest(0, least(1,
        extract(epoch from (now() - outbound_start)) /
        nullif(extract(epoch from (outbound_arrival - outbound_start)), 0)));
      anchor_latitude := origin_lat + (destination_lat - origin_lat) * leg_progress;
      anchor_longitude := mod((origin_lng +
        (mod((destination_lng - origin_lng + 540)::numeric, 360)::double precision - 180) *
        leg_progress + 540)::numeric, 360)::double precision - 180;
    elsif return_start is not null and now() >= return_start then
      leg_progress := greatest(0, least(1,
        extract(epoch from (now() - return_start)) /
        nullif(extract(epoch from (return_arrival - return_start)), 0)));
      anchor_latitude := destination_lat + (origin_lat - destination_lat) * leg_progress;
      anchor_longitude := mod((destination_lng +
        (mod((origin_lng - destination_lng + 540)::numeric, 360)::double precision - 180) *
        leg_progress + 540)::numeric, 360)::double precision - 180;
    else
      anchor_latitude := destination_lat;
      anchor_longitude := destination_lng;
    end if;
  end if;

  radius_km := public.encounter_runtime_numeric('encounter.radiusKm', 1000);
  result_limit := greatest(1, least(50, round(public.encounter_runtime_numeric('encounter.resultLimit', 5))::int));

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
        power(sin(radians(p.exact_current_latitude - anchor_latitude) / 2), 2) +
        cos(radians(anchor_latitude)) * cos(radians(p.exact_current_latitude)) *
        power(sin(radians(p.exact_current_longitude - anchor_longitude) / 2), 2)
      )) as center_distance
    from positioned p
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
  where v.center_distance <= radius_km
  order by v.center_distance, v.id
  limit result_limit;
end;
$$;

revoke all on function public.get_nearby_postal_traffic(text, uuid) from public, anon;
grant execute on function public.get_nearby_postal_traffic(text, uuid) to authenticated;
