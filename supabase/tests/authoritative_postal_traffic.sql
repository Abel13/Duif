begin;

\ir player_fixtures.sql

insert into public.friendships (
  id, requester_profile_id, addressee_profile_id, status, friendship_level, exchange_count
) values (
  '00000000-0000-4000-8000-000000009700',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101', 'accepted', 1, 0
);

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009601',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000204',
  '00000000-0000-4000-8000-000000000401',
  -23.30451, -51.16961, 'private.origin', -23.42051, -51.93331,
  'private.destination', 82, 58, now() - interval '30 minutes',
  now() + interval '30 minutes', now() + interval '1 hour',
  now() + interval '2 hours', 'outbound', 'traffic-test', '{}'::jsonb
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

do $$
declare
  result record;
begin
  select * into result
  from public.get_nearby_postal_traffic(-23.36, -51.55, -23.0, -51.0, -23.8, -52.1);

  if result.traffic_id <> '00000000-0000-4000-8000-000000009601'::uuid
    or result.visibility <> 'friend'
    or result.friend_name is null then
    raise exception 'Expected sanitized friend traffic result';
  end if;
  if result.origin_latitude = -23.30451 or result.origin_longitude = -51.16961 then
    raise exception 'Private route endpoint leaked without regionalization';
  end if;
  if result.origin_region like '%Londrina%' or result.destination_region like '%Maringá%' then
    raise exception 'City name leaked in regional route labels';
  end if;
end;
$$;

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009602',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000204',
  '00000000-0000-4000-8000-000000000401',
  0, 179, 'private.origin', 0, -179, 'private.destination', 222, 58,
  now() - interval '30 minutes', now() + interval '30 minutes',
  now() + interval '1 hour', now() + interval '2 hours', 'outbound',
  'traffic-antimeridian-test', '{}'::jsonb
);

do $$
begin
  if not exists (
    select 1 from public.get_nearby_postal_traffic(0, 180, 10, -170, -10, 170)
    where traffic_id = '00000000-0000-4000-8000-000000009602'::uuid
  ) then
    raise exception 'Antimeridian viewport did not return its crossing route';
  end if;
end;
$$;

do $$
begin
  perform public.get_nearby_postal_traffic(91, 0, 10, 10, -10, -10);
  raise exception 'Invalid latitude was accepted';
exception when invalid_parameter_value then null;
end;
$$;

select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  perform public.get_nearby_postal_traffic(0, 0, 10, 10, -10, -10);
  raise exception 'Anonymous traffic query was accepted';
exception when invalid_authorization_specification then null;
end;
$$;

rollback;
