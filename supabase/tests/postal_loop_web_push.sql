begin;

\ir player_fixtures.sql

insert into public.friendships (
  id, requester_profile_id, addressee_profile_id, status, friendship_level, exchange_count
) values (
  '00000000-0000-4000-8000-000000009710',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101', 'accepted', 1, 0
);

insert into public.push_preferences (
  profile_id, enabled, locale
) values
  ('00000000-0000-4000-8000-000000000001', true, 'pt-BR'),
  ('00000000-0000-4000-8000-000000000101', true, 'pt-BR');

update public.player_mascots
set level = 4
where id = '00000000-0000-4000-8000-000000000203';

insert into public.deliveries (
  id, sender_profile_id, receiver_profile_id, mascot_id,
  correspondence_option_id, origin_latitude, origin_longitude, origin_label_key,
  destination_latitude, destination_longitude, destination_label_key, distance_km,
  animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at,
  return_arrival_at, status, reward_seed, travel_modifiers, is_tutorial
) values (
  '00000000-0000-4000-8000-000000009711',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000401',
  -23.30451, -51.16961, 'private.origin', -23.42051, -51.93331,
  'private.destination', 40, 58,
  now() - interval '40 minutes',
  now() - interval '10 minutes',
  now() + interval '50 minutes',
  now() + interval '3 hours',
  'delivered', 'push-loop-test', '{}'::jsonb, false
);

-- Travel triggers rewrite ETAs on insert; pin the postal-loop schedule for enqueue tests.
update public.deliveries
set outbound_start_at = now() - interval '40 minutes',
    outbound_arrival_at = now() - interval '10 minutes',
    return_start_at = now() + interval '50 minutes',
    return_arrival_at = now() + interval '3 hours',
    status = 'delivered'
where id = '00000000-0000-4000-8000-000000009711';

do $$
declare
  count_value integer;
  title_value text;
begin
  select public.enqueue_postal_push_events(now()) into count_value;
  if count_value < 2 then
    raise exception 'Expected correspondence_arrived for sender and recipient';
  end if;

  select title into title_value
  from public.push_outbox
  where delivery_id = '00000000-0000-4000-8000-000000009711'
    and event_kind = 'correspondence_arrived'
    and audience = 'recipient';
  if title_value <> 'Correspondência chegou' or title_value ilike '%Sender%' then
    raise exception 'Recipient arrival copy leaked identity or was wrong';
  end if;

  select public.enqueue_postal_push_events(now()) into count_value;
  if count_value <> 0 then
    raise exception 'Enqueue must be idempotent';
  end if;
end;
$$;

-- Mid-window reminder while still preparing.
update public.deliveries
set outbound_arrival_at = now() - interval '35 minutes',
    return_start_at = now() + interval '25 minutes'
where id = '00000000-0000-4000-8000-000000009711';

do $$
declare count_value integer;
begin
  select public.enqueue_postal_push_events(now()) into count_value;
  if count_value < 2 then
    raise exception 'Expected return_prep_remaining for both parties';
  end if;
end;
$$;

-- Preferences off suppress new kinds.
update public.push_preferences
set return_departed = false
where profile_id = '00000000-0000-4000-8000-000000000101';

update public.deliveries
set return_start_at = now() - interval '1 minute',
    return_arrival_at = now() + interval '2 hours'
where id = '00000000-0000-4000-8000-000000009711';

do $$
declare
  recipient_count integer;
  sender_count integer;
begin
  perform public.enqueue_postal_push_events(now());
  select count(*) into recipient_count
  from public.push_outbox
  where delivery_id = '00000000-0000-4000-8000-000000009711'
    and event_kind = 'return_departed'
    and audience = 'recipient';
  select count(*) into sender_count
  from public.push_outbox
  where delivery_id = '00000000-0000-4000-8000-000000009711'
    and event_kind = 'return_departed'
    and audience = 'sender';
  if recipient_count <> 0 then
    raise exception 'Disabled preference must suppress recipient return_departed';
  end if;
  if sender_count <> 1 then
    raise exception 'Sender return_departed should still enqueue';
  end if;
end;
$$;

-- Ready for collection: recipient only with confirmed return reply.
update public.push_preferences
set return_departed = true, ready_for_collection = true
where profile_id in (
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101'
);

update public.deliveries
set return_arrival_at = now() - interval '1 minute'
where id = '00000000-0000-4000-8000-000000009711';

do $$
declare recipient_count integer;
begin
  perform public.enqueue_postal_push_events(now());
  select count(*) into recipient_count
  from public.push_outbox
  where delivery_id = '00000000-0000-4000-8000-000000009711'
    and event_kind = 'ready_for_collection'
    and audience = 'recipient';
  if recipient_count <> 0 then
    raise exception 'Recipient ready_for_collection requires a return reply';
  end if;
end;
$$;

insert into public.delivery_return_replies (
  delivery_id, sender_profile_id, receiver_profile_id, letter_text, departure_at, confirmed_at, metadata
) values (
  '00000000-0000-4000-8000-000000009711',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Obrigado pela carta.',
  now() - interval '30 minutes',
  now() - interval '40 minutes',
  '{}'::jsonb
);

do $$
declare
  recipient_count integer;
  sender_count integer;
begin
  perform public.enqueue_postal_push_events(now());
  select count(*) into recipient_count
  from public.push_outbox
  where delivery_id = '00000000-0000-4000-8000-000000009711'
    and event_kind = 'ready_for_collection'
    and audience = 'recipient';
  select count(*) into sender_count
  from public.push_outbox
  where delivery_id = '00000000-0000-4000-8000-000000009711'
    and event_kind = 'ready_for_collection'
    and audience = 'sender';
  if recipient_count <> 1 or sender_count <> 1 then
    raise exception 'Ready for collection should enqueue sender always and recipient with reply';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

do $$
declare prefs public.push_preferences;
begin
  prefs := public.upsert_push_preferences(false, true, true, true, true, 'en-US');
  if prefs.enabled or prefs.locale <> 'en-US' then
    raise exception 'upsert_push_preferences failed';
  end if;
end;
$$;

rollback;
