begin;

update public.profiles
set auth_user_id = case mock_key
  when 'player-current' then '10000000-0000-4000-8000-000000000001'::uuid
  when 'friend-lisbon' then '10000000-0000-4000-8000-000000000101'::uuid
  when 'friend-curitiba' then '10000000-0000-4000-8000-000000000102'::uuid
  else auth_user_id
end;

insert into public.deliveries (
  id, mock_key, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009501', 'delivery-test-londrina-maringa',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000401',
  -23.3045, -51.1696, 'locations.londrina', -23.4205, -51.9333,
  'locations.maringa', 82, 62, now() - interval '4 hours',
  now() - interval '3 hours', now() - interval '2 hours', now() - interval '1 hour',
  'returned', 'route-discovery-test', '{"discoveryRadiusMultiplier":1.15}'::jsonb
);

do $$
declare
  discovery_count integer;
  discovery_version smallint;
begin
  select route_discovery_version into discovery_version
  from public.deliveries where mock_key = 'delivery-test-londrina-maringa';

  select count(*) into discovery_count
  from public.delivery_route_discoveries
  where delivery_id = '00000000-0000-4000-8000-000000009501';

  if discovery_version <> 1 or discovery_count <> 6 then
    raise exception 'Expected version 1 and six persisted discoveries, got version %, count %',
      discovery_version, discovery_count;
  end if;
end;
$$;

insert into public.deliveries (
  id, mock_key, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009502', 'delivery-test-no-points',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000401',
  -77, 166, 'locations.londrina', -77.5, 167, 'locations.maringa', 50, 62,
  now(), now() + interval '1 hour', now() + interval '2 hours',
  now() + interval '3 hours', 'outbound', 'no-points-test',
  '{"discoveryRadiusMultiplier":1}'::jsonb
);

do $$
begin
  if (select route_discovery_version from public.deliveries
      where mock_key = 'delivery-test-no-points') <> 1
    or exists (
      select 1 from public.delivery_route_discoveries
      where delivery_id = '00000000-0000-4000-8000-000000009502'
    )
  then
    raise exception 'A new empty route must keep version 1 with no discoveries';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000102', true);

do $$
begin
  perform public.collect_delivery_reward('delivery-test-londrina-maringa');
  raise exception 'Third party unexpectedly collected sender cargo';
exception
  when insufficient_privilege then null;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000101', true);

do $$
begin
  perform public.collect_delivery_reward('delivery-test-londrina-maringa');
  raise exception 'Recipient unexpectedly collected sender cargo';
exception
  when insufficient_privilege then null;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

do $$
begin
  perform public.collect_delivery_reward('delivery-test-no-points');
  raise exception 'Cargo was collected before the mascot returned';
exception
  when invalid_parameter_value then null;
end;
$$;

do $$
declare
  first_result jsonb;
  repeated_result jsonb;
  route_inventory_count integer;
begin
  first_result := public.collect_delivery_reward('delivery-test-londrina-maringa');
  repeated_result := public.collect_delivery_reward('delivery-test-londrina-maringa');

  if jsonb_array_length(first_result -> 'routeInventoryItems') <> 6
    or jsonb_array_length(repeated_result -> 'routeInventoryItems') <> 6
  then
    raise exception 'Complete cargo was not returned idempotently';
  end if;

  select count(*) into route_inventory_count
  from public.inventory_items
  where mock_key like 'inventory-route-discovery-%';

  if route_inventory_count <> 6 then
    raise exception 'Expected six unique route inventory items, got %', route_inventory_count;
  end if;

  if not exists (
    select 1 from public.inventory_items
    where mock_key like 'inventory-route-discovery-%' and category = 'stamps'
  ) or not exists (
    select 1 from public.inventory_items
    where mock_key like 'inventory-route-discovery-%' and category = 'routeMarks'
  ) then
    raise exception 'Route inventory category mapping is incomplete';
  end if;
end;
$$;

rollback;
