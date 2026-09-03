begin;

\ir player_fixtures.sql

insert into public.friendships (
  id, requester_profile_id, addressee_profile_id, status, friendship_level, exchange_count, level_started_at
) values (
  '00000000-0000-4000-8000-000000009801',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  'accepted',
  5,
  99,
  'epoch'::timestamptz
);

-- Three completed ida+volta cycles between the pair.
insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key,
  distance_km, animal_speed_kmh,
  outbound_start_at, outbound_arrival_at, return_start_at, return_arrival_at,
  status, reward_seed, is_tutorial
) values
(
  '00000000-0000-4000-8000-000000009811',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  -23.3, -51.1, 'private.origin', -23.4, -51.9, 'private.destination',
  80, 50,
  now() - interval '3 days', now() - interval '3 days' + interval '2 hours',
  now() - interval '3 days' + interval '3 hours', now() - interval '3 days' + interval '5 hours',
  'completed', 'friendship-cycle-1', false
),
(
  '00000000-0000-4000-8000-000000009812',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000204',
  -23.4, -51.9, 'private.origin', -23.3, -51.1, 'private.destination',
  80, 50,
  now() - interval '2 days', now() - interval '2 days' + interval '2 hours',
  now() - interval '2 days' + interval '3 hours', now() - interval '2 days' + interval '5 hours',
  'completed', 'friendship-cycle-2', false
),
(
  '00000000-0000-4000-8000-000000009813',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  -23.3, -51.1, 'private.origin', -23.4, -51.9, 'private.destination',
  80, 50,
  now() - interval '1 day', now() - interval '1 day' + interval '2 hours',
  now() - interval '1 day' + interval '3 hours', now() - interval '1 day' + interval '5 hours',
  'completed', 'friendship-cycle-3', false
),
-- Tutorial and incomplete deliveries must not count.
(
  '00000000-0000-4000-8000-000000009814',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  -23.3, -51.1, 'private.origin', -23.4, -51.9, 'private.destination',
  80, 50,
  now() - interval '12 hours', now() - interval '10 hours',
  now() - interval '9 hours', now() - interval '7 hours',
  'completed', 'friendship-cycle-tutorial', true
),
(
  '00000000-0000-4000-8000-000000009815',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  -23.3, -51.1, 'private.origin', -23.4, -51.9, 'private.destination',
  80, 50,
  now() - interval '6 hours', now() - interval '4 hours',
  now() - interval '3 hours', now() + interval '1 hour',
  'returning', 'friendship-cycle-open', false
);

do $$
begin
  if public.friendship_level_from_cycles(0) <> 1
    or public.friendship_level_from_cycles(2) <> 1
    or public.friendship_level_from_cycles(3) <> 2
    or public.friendship_level_from_cycles(8) <> 3
    or public.friendship_level_from_cycles(20) <> 4
    or public.friendship_level_from_cycles(50) <> 5 then
    raise exception 'Friendship level thresholds are incorrect';
  end if;
end;
$$;

do $$
declare
  friendship_record public.friendships;
begin
  friendship_record := public.refresh_friendship_progress(
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101'
  );
  if friendship_record.exchange_count <> 3 or friendship_record.friendship_level <> 2 then
    raise exception 'Legacy recalculation expected 3 cycles / level 2, got % / %',
      friendship_record.exchange_count, friendship_record.friendship_level;
  end if;
end;
$$;

-- Completing another cycle should advance progress via trigger.
update public.deliveries
set
  status = 'completed',
  return_arrival_at = now() - interval '1 minute'
where id = '00000000-0000-4000-8000-000000009815';

do $$
declare
  friendship_record public.friendships;
begin
  select * into friendship_record
  from public.friendships
  where id = '00000000-0000-4000-8000-000000009801';
  if friendship_record.exchange_count <> 4 or friendship_record.friendship_level <> 2 then
    raise exception 'Completion trigger expected 4 cycles / level 2, got % / %',
      friendship_record.exchange_count, friendship_record.friendship_level;
  end if;
end;
$$;

-- Re-accepting friendship resets the cycle window to level 1.
update public.friendships
set
  status = 'pending',
  friendship_level = 2,
  exchange_count = 4,
  updated_at = now()
where id = '00000000-0000-4000-8000-000000009801';

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000101', true);

do $$
declare
  result record;
  friendship_record public.friendships;
begin
  select * into result
  from public.respond_to_postal_friend_request('00000000-0000-4000-8000-000000009801', true);
  if result.accepted is not true then
    raise exception 'Expected friendship accept to succeed';
  end if;
  select * into friendship_record
  from public.friendships
  where id = '00000000-0000-4000-8000-000000009801';
  if friendship_record.friendship_level <> 1
    or friendship_record.exchange_count <> 0
    or friendship_record.level_started_at < now() - interval '1 minute' then
    raise exception 'Accept must restart friendship cycles at level 1';
  end if;
end;
$$;

rollback;
