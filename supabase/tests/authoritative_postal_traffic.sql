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
  settings jsonb;
begin
  settings := public.get_encounter_client_settings();
  if (settings ->> 'refreshMinutes')::int <> 5 or (settings ->> 'resultLimit')::int <> 5 then
    raise exception 'Expected default encounter client settings';
  end if;

  select * into result
  from public.get_nearby_postal_traffic('nest');

  if result.traffic_id <> '00000000-0000-4000-8000-000000009601'::uuid
    or result.visibility <> 'friend'
    or result.friend_name is null
    or result.mascot_level is null
    or coalesce(result.trait_name_key, '') = ''
    or result.friendship_state <> 'friend' then
    raise exception 'Expected sanitized friend encounter from nest anchor';
  end if;
  if result.origin_latitude = -23.30451 or result.origin_longitude = -51.16961 then
    raise exception 'Private route endpoint leaked without regionalization';
  end if;
  if result.origin_region like '%Londrina%' or result.destination_region like '%Maringá%' then
    raise exception 'City name leaked in regional route labels';
  end if;
end;
$$;

do $$
begin
  if exists (
    select 1
    from public.get_nearby_postal_traffic('nest')
    where traffic_id = '00000000-0000-4000-8000-000000009601'::uuid
  ) is false then
    raise exception 'Nest anchor must keep nearby encounters stable without a camera viewport';
  end if;
end;
$$;

-- Far delivery must be excluded by radius, not by an imaginary camera pan.
-- Keep the hop short enough for flight-range validation while placing it far from Londrina.
insert into public.player_mascots (
  id, owner_profile_id, template_id, name, level, xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
)
select '00000000-0000-4000-8000-000000000206', '00000000-0000-4000-8000-000000000102',
  id, 'Amazonia mascot', base_level, base_xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
from public.mascot_templates where catalog_key = 'mascot-nuvem';

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009603',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000206',
  '00000000-0000-4000-8000-000000000401',
  -3.1190, -60.0217, 'private.origin', -3.4500, -60.1000, 'private.destination', 40, 58,
  now() - interval '30 minutes', now() + interval '30 minutes',
  now() + interval '1 hour', now() + interval '2 hours', 'outbound',
  'traffic-far-amazonia', '{}'::jsonb
);

do $$
begin
  if exists (
    select 1 from public.get_nearby_postal_traffic('nest')
    where traffic_id = '00000000-0000-4000-8000-000000009603'::uuid
  ) then
    raise exception 'Far delivery must stay outside nest radius without viewport authorization';
  end if;
end;
$$;

-- Admin radius must bind eligibility around the nest.
update public.app_runtime_settings
set setting_value = '10'::jsonb
where setting_key = 'encounter.radiusKm';

do $$
begin
  if exists (
    select 1 from public.get_nearby_postal_traffic('nest')
    where traffic_id = '00000000-0000-4000-8000-000000009601'::uuid
  ) then
    raise exception 'Encounter radiusKm setting was ignored';
  end if;
end;
$$;

update public.app_runtime_settings
set setting_value = '1000'::jsonb
where setting_key = 'encounter.radiusKm';

-- Own traveling mascot as encounter anchor should still see nearby friend traffic.
update public.player_mascots
set level = 4
where id = '00000000-0000-4000-8000-000000000203';

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009604',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000401',
  -23.30451, -51.16961, 'private.origin', -23.42051, -51.93331,
  'private.destination', 82, 58, now() - interval '30 minutes',
  now() + interval '30 minutes', now() + interval '1 hour',
  now() + interval '2 hours', 'outbound', 'own-mascot-anchor', '{}'::jsonb
);

do $$
begin
  if not exists (
    select 1
    from public.get_nearby_postal_traffic('mascot', '00000000-0000-4000-8000-000000000203')
    where traffic_id = '00000000-0000-4000-8000-000000009601'::uuid
  ) then
    raise exception 'Mascot anchor must resolve nearby encounters from authoritative position';
  end if;
end;
$$;

do $$
begin
  perform public.get_nearby_postal_traffic('viewport');
  raise exception 'Invalid encounter anchor was accepted';
exception when invalid_parameter_value then null;
end;
$$;

do $$
begin
  perform public.get_nearby_postal_traffic('mascot', null);
  raise exception 'Mascot anchor without id was accepted';
exception when invalid_parameter_value then null;
end;
$$;

-- Admin result limit must bind encounter output.
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);
update public.app_runtime_settings
set setting_value = '1'::jsonb
where setting_key = 'encounter.resultLimit';

insert into public.player_mascots (
  id, owner_profile_id, template_id, name, level, xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
)
select '00000000-0000-4000-8000-000000000205', '00000000-0000-4000-8000-000000000102',
  id, 'Third mascot', base_level, base_xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
from public.mascot_templates where catalog_key = 'mascot-trovao';

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers
) values (
  '00000000-0000-4000-8000-000000009605',
  '00000000-0000-4000-8000-000000000102',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000205',
  '00000000-0000-4000-8000-000000000401',
  -23.35, -51.20, 'private.origin', -23.40, -51.80,
  'private.destination', 60, 58, now() - interval '20 minutes',
  now() + interval '40 minutes', now() + interval '1 hour',
  now() + interval '2 hours', 'outbound', 'traffic-limit-extra', '{}'::jsonb
);

do $$
declare
  encounter_count integer;
begin
  select count(*) into encounter_count from public.get_nearby_postal_traffic('nest');
  if encounter_count <> 1 then
    raise exception 'Encounter resultLimit setting was ignored';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '', true);
do $$
begin
  perform public.get_nearby_postal_traffic('nest');
  raise exception 'Anonymous encounter query was accepted';
exception when invalid_authorization_specification then null;
end;
$$;

rollback;
