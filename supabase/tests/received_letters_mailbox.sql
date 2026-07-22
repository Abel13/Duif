begin;

\ir player_fixtures.sql

insert into public.player_mascots (
  id, owner_profile_id, template_id, name, level, xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
)
select '00000000-0000-4000-8000-000000009903', '00000000-0000-4000-8000-000000000001',
  id, 'Mailbox test mascot', base_level, base_xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
from public.mascot_templates where catalog_key = 'mascot-pipoca';

insert into public.player_mascots (
  id, owner_profile_id, template_id, name, level, xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
)
select '00000000-0000-4000-8000-000000009904', '00000000-0000-4000-8000-000000000001',
  id, 'Mailbox arrived mascot', base_level, base_xp, next_level_xp,
  attributes, trait, equipment, skills, appearance
from public.mascot_templates where catalog_key = 'mascot-pipoca';

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id, origin_latitude, origin_longitude,
  origin_label_key, origin_place_label, destination_latitude, destination_longitude,
  destination_label_key, destination_place_label, distance_km, animal_speed_kmh,
  outbound_start_at, outbound_arrival_at, return_start_at, return_arrival_at, status, reward_seed,
  is_tutorial
) values
  ('00000000-0000-4000-8000-000000009901', '00000000-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000009904',
   -23.3, -51.1, 'locations.londrina', 'Londrina, Paraná • BR', -23.4, -51.9,
   'locations.maringa', 'Maringá, Paraná • BR', 100, 40, now() - interval '1 hour',
   now() + interval '1 minute', now() + interval '31 minutes', now() + interval '2 hours',
   'outbound', 'mailbox-future', false),
  ('00000000-0000-4000-8000-000000009902', '00000000-0000-4000-8000-000000000001',
   '00000000-0000-4000-8000-000000000101', '00000000-0000-4000-8000-000000009903',
   -23.3, -51.1, 'locations.londrina', 'Londrina, Paraná • BR', -23.4, -51.9,
   'locations.maringa', 'Maringá, Paraná • BR', 100, 40, now() - interval '2 hours',
   now() - interval '1 minute', now() + interval '29 minutes', now() + interval '1 hour',
   'returning', 'mailbox-arrived', false);

-- The insert trigger materializes normal travel timestamps. Make this fixture's two arrival
-- moments explicit so the availability boundary remains deterministic.
update public.deliveries
set outbound_start_at = now() - interval '1 hour', outbound_arrival_at = now() + interval '1 minute',
  return_start_at = now() + interval '31 minutes', return_arrival_at = now() + interval '2 hours', status = 'outbound'
where id = '00000000-0000-4000-8000-000000009901';
update public.deliveries
set outbound_start_at = now() - interval '2 hours', outbound_arrival_at = now() - interval '1 minute',
  return_start_at = now() + interval '29 minutes', return_arrival_at = now() + interval '1 hour', status = 'returning'
where id = '00000000-0000-4000-8000-000000009902';

insert into public.delivery_correspondence_contents (
  id, delivery_id, correspondence_type, letter_text
) values
  ('00000000-0000-4000-8000-000000009911', '00000000-0000-4000-8000-000000009901', 'letter', 'Not yet.'),
  ('00000000-0000-4000-8000-000000009912', '00000000-0000-4000-8000-000000009902', 'letter', 'Arrived safely.');

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000101', true);

do $$
declare count_value integer;
begin
  select count(*) into count_value from public.list_received_letters()
  where delivery_id in ('00000000-0000-4000-8000-000000009901', '00000000-0000-4000-8000-000000009902');
  if count_value <> 1 then raise exception 'Mailbox exposed a letter before arrival'; end if;
  if not exists (select 1 from public.list_received_letters() where letter_text = 'Arrived safely.' and origin_label = 'Londrina, Paraná • BR') then
    raise exception 'Mailbox did not return the arrived letter snapshot';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000102', true);
do $$ begin
  if exists (select 1 from public.list_received_letters()
    where delivery_id in ('00000000-0000-4000-8000-000000009901', '00000000-0000-4000-8000-000000009902')) then
    raise exception 'Mailbox exposed another player''s letters';
  end if;
end $$;

reset role;
rollback;
