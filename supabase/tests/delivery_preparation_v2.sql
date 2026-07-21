begin;

\ir player_fixtures.sql

do $$
declare
  neutral jsonb;
  trovao jsonb;
  capped jsonb;
begin
  neutral := public.derive_mascot_travel_modifiers(
    '{"orientation": 0, "luck": 0}'::jsonb,
    '{"effect": "deliveryReward"}'::jsonb,
    '[]'::jsonb,
    100
  );
  trovao := public.derive_mascot_travel_modifiers(
    '{"orientation": 0, "luck": 0}'::jsonb,
    '{"effect": "fastReturn"}'::jsonb,
    '[{"id":"skill-trovao-quick-dispatch","level":3}]'::jsonb,
    100
  );
  capped := public.derive_mascot_travel_modifiers(
    '{"orientation": 0, "luck": 0}'::jsonb,
    '{"effect": "fastReturn"}'::jsonb,
    '[{"id":"skill-trovao-quick-dispatch","level":10}]'::jsonb,
    100
  );

  if neutral ->> 'version' <> '2' or (neutral ->> 'preparationMinutes')::numeric <> 5 then
    raise exception 'Expected v2 five-minute preparation, got %', neutral;
  end if;
  if (trovao ->> 'preparationMinutes')::numeric <> 4.25 then
    raise exception 'Expected Trovão level 3 preparation of 4.25 minutes, got %', trovao;
  end if;
  if (capped ->> 'preparationMinutes')::numeric <> 4 then
    raise exception 'Quick Dispatch must retain its 20%% cap, got %', capped;
  end if;
end;
$$;

do $$
declare
  created public.deliveries;
begin
  insert into public.deliveries (
    id, sender_profile_id, receiver_profile_id, mascot_id, correspondence_option_id,
    origin_latitude, origin_longitude, origin_label_key,
    destination_latitude, destination_longitude, destination_label_key,
    distance_km, animal_speed_kmh, outbound_start_at, outbound_arrival_at,
    return_start_at, return_arrival_at, status, reward_seed
  ) values (
    '00000000-0000-4000-8000-000000009612',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000401',
    -23.3045, -51.1696, 'locations.londrina', -23.4205, -51.9333, 'locations.maringa',
    82, 62, '2026-07-21 12:00:00+00', '2026-07-21 13:00:00+00',
    '2026-07-21 13:30:00+00', '2026-07-21 14:30:00+00', 'preparing', 'new-preparation-v2'
  );

  select * into created from public.deliveries where id = '00000000-0000-4000-8000-000000009612';
  if created.travel_modifiers ->> 'version' <> '2'
    or (created.travel_modifiers ->> 'preparationMinutes')::numeric <> 5
    or created.outbound_start_at <> '2026-07-21 12:05:00+00'::timestamptz then
    raise exception 'New delivery did not materialize v2 timestamps: %', row_to_json(created);
  end if;
end;
$$;

-- A pre-existing v1 snapshot is read as-is; the migration never rewrites it.
do $$
declare
  legacy public.deliveries;
begin
  insert into public.deliveries (
    id, sender_profile_id, receiver_profile_id, mascot_id, correspondence_option_id,
    origin_latitude, origin_longitude, origin_label_key,
    destination_latitude, destination_longitude, destination_label_key,
    distance_km, animal_speed_kmh, outbound_start_at, outbound_arrival_at,
    return_start_at, return_arrival_at, status, reward_seed, travel_modifiers
  ) values (
    '00000000-0000-4000-8000-000000009611',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000204',
    '00000000-0000-4000-8000-000000000401',
    -23.3045, -51.1696, 'locations.londrina', -23.4205, -51.9333, 'locations.maringa',
    82, 62, now(), now() + interval '1 hour', now() + interval '90 minutes',
    now() + interval '150 minutes', 'preparing', 'legacy-preparation-v1',
    '{"version":1,"preparationMinutes":30,"outboundSpeedMultiplier":1,"returnSpeedMultiplier":1,"discoveryRadiusMultiplier":1,"rarityWeightMultiplier":1,"longRouteConsistency":1,"isLongRoute":false}'::jsonb
  );

  select * into legacy from public.deliveries where id = '00000000-0000-4000-8000-000000009611';
  if legacy.travel_modifiers ->> 'version' <> '1' or (legacy.travel_modifiers ->> 'preparationMinutes')::numeric <> 30 then
    raise exception 'Existing v1 snapshot was unexpectedly changed: %', legacy.travel_modifiers;
  end if;
end;
$$;

rollback;
