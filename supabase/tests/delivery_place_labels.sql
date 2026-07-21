begin;

\ir player_fixtures.sql

insert into public.friendships (
  id, requester_profile_id, addressee_profile_id, status, friendship_level, exchange_count
) values (
  '00000000-0000-4000-8000-000000009751',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101', 'accepted', 1, 0
);

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000000001', true);

do $$
declare
  created_delivery public.deliveries;
  saved_origin text;
  saved_destination text;
begin
  select * into created_delivery from public.create_delivery_from_selection(
    '00000000-0000-4000-8000-000000000203',
    '00000000-0000-4000-8000-000000000101',
    'correspondence-letter',
    '{"type":"letter","letterText":"A postal hello."}'::jsonb
  );

  if created_delivery.origin_place_label <> 'Londrina, Paraná • Brasil'
    or created_delivery.destination_place_label <> 'Maringá, Paraná • Brasil' then
    raise exception 'Delivery did not snapshot public places: %, %',
      created_delivery.origin_place_label, created_delivery.destination_place_label;
  end if;

  saved_origin := created_delivery.origin_place_label;
  saved_destination := created_delivery.destination_place_label;
  update public.profiles
  set postal_base_city = 'Changed city', postal_base_state = 'Changed state', postal_base_country = 'ZZ'
  where id in ('00000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000101');

  if (select origin_place_label from public.deliveries where id = created_delivery.id) <> saved_origin
    or (select destination_place_label from public.deliveries where id = created_delivery.id) <> saved_destination then
    raise exception 'Delivery place snapshots changed after a nest update';
  end if;

  begin
    perform public.create_delivery_from_selection(
      '00000000-0000-4000-8000-000000000203',
      '00000000-0000-4000-8000-000000000101',
      'correspondence-letter',
      '{"type":"letter","letterText":"A duplicate postal hello."}'::jsonb
    );
    raise exception 'A mascot was allowed to start a concurrent delivery';
  exception when check_violation then null;
  end;

  if (select count(*) from public.deliveries where mascot_id = created_delivery.mascot_id and status <> 'completed') <> 1 then
    raise exception 'Concurrent delivery prevention did not preserve exactly one open delivery';
  end if;
end;
$$;

rollback;
