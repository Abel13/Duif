begin;

\ir player_fixtures.sql

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009601',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000401',
  -23.3045, -51.1696, 'locations.londrina',
  -23.3050, -51.1700, 'locations.londrina', 1,
  62, now() - interval '4 hours', now() - interval '3 hours',
  now() - interval '2 hours', now() - interval '1 hour',
  'returned', 'production-rpc-regression', '{}'::jsonb
);

insert into public.delivery_progression_awards (
  delivery_id, profile_id, mascot_id, reputation_xp, mascot_xp, skill_awards, inputs
) values (
  '00000000-0000-4000-8000-000000009601',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000203',
  10, 15, '[]'::jsonb, '{}'::jsonb
);

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

do $$
begin
  if public.get_delivery_progression_award(
    '00000000-0000-4000-8000-000000009601'
  ) is null then
    raise exception 'The owner could not read the delivery progression award';
  end if;
end;
$$;

rollback;
