begin;

\ir player_fixtures.sql

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009611',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000204',
  '00000000-0000-4000-8000-000000000401',
  -23.30451, -51.16961, 'private.origin', -23.42051, -51.93331,
  'private.destination', 82, 58, now() - interval '30 minutes',
  now() + interval '30 minutes', now() + interval '1 hour',
  now() + interval '2 hours', 'outbound', 'traffic-friend-request', '{}'::jsonb
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

do $$
declare
  result record;
begin
  select * into result from public.request_friendship_from_postal_traffic('00000000-0000-4000-8000-000000009611');
  if result.outcome <> 'sent' or result.request_id is null then
    raise exception 'Expected friendship request from visible traffic';
  end if;
  select * into result from public.request_friendship_from_postal_traffic('00000000-0000-4000-8000-000000009611');
  if result.outcome <> 'alreadyPending' then
    raise exception 'Expected idempotent pending friendship from traffic';
  end if;
end;
$$;

do $$
declare
  traffic record;
begin
  select * into traffic
  from public.get_nearby_postal_traffic(-23.36, -51.55, -23.0, -51.0, -23.8, -52.1)
  where traffic_id = '00000000-0000-4000-8000-000000009611';
  if traffic.visibility <> 'public' or traffic.friendship_state <> 'outgoing' then
    raise exception 'Expected outgoing friendship state on public traffic card';
  end if;
  if traffic.mascot_level is null or coalesce(traffic.trait_name_key, '') = '' then
    raise exception 'Expected mascot level and trait on traffic card';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000101', true);
do $$
declare
  result record;
begin
  select * into result from public.request_friendship_from_postal_traffic('00000000-0000-4000-8000-000000009611');
  if result.outcome <> 'unavailable' then
    raise exception 'Owner must not request friendship from their own traffic delivery';
  end if;
end;
$$;

rollback;
