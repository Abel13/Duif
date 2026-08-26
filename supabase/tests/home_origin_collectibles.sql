begin;

\ir player_fixtures.sql

insert into auth.users(id,email,aud,role,created_at,updated_at) values
  ('10000000-0000-4000-8000-000000000001','home-sender@example.test','authenticated','authenticated',now(),now()),
  ('10000000-0000-4000-8000-000000000101','home-recipient@example.test','authenticated','authenticated',now(),now()),
  ('10000000-0000-4000-8000-000000000102','home-incomplete@example.test','authenticated','authenticated',now(),now())
on conflict(id) do nothing;

update public.profiles set
  home_city_geoname_id=3458449,
  home_latitude=-23.3045,
  home_longitude=-51.1696
where id='00000000-0000-4000-8000-000000000001';

insert into public.account_onboarding(
  auth_user_id,stage,display_name,completed_at
) values(
  '10000000-0000-4000-8000-000000000001','completed','Sender',now()-interval '1 day'
) on conflict(auth_user_id) do update set
  stage='completed',display_name=excluded.display_name,completed_at=excluded.completed_at;

do $$
declare
  parana_reward_id uuid;
  first_result jsonb;
  second_result jsonb;
begin
  select reward_item_id into strict parana_reward_id
  from public.brazil_state_boundaries where state_code='PR' and active;

  if (select count(*) from public.profile_postcard_unlocks
      where profile_id='00000000-0000-4000-8000-000000000001'
        and postcard_catalog_key='postcard-city-3458449'
        and source='home-nest')<>1 then
    raise exception 'Completed Londrina nest did not receive its city postcard';
  end if;

  if (select count(*) from public.inventory_items
      where owner_profile_id='00000000-0000-4000-8000-000000000001'
        and reward_item_id=parana_reward_id
        and source_key='inventory.sources.homeNest')<>1 then
    raise exception 'Completed Londrina nest did not receive the Parana stamp';
  end if;

  first_result:=public.grant_home_origin_collectibles(
    '00000000-0000-4000-8000-000000000001',now()
  );
  second_result:=public.grant_home_origin_collectibles(
    '00000000-0000-4000-8000-000000000001',now()
  );
  if first_result<>jsonb_build_object('postcardsGranted',0,'stateStampsGranted',0)
    or second_result<>jsonb_build_object('postcardsGranted',0,'stateStampsGranted',0) then
    raise exception 'Repeated home grants were not idempotent: %, %',first_result,second_result;
  end if;
end $$;

update public.profiles set
  home_city_geoname_id=1819729,
  home_latitude=22.3193,
  home_longitude=114.1694
where id='00000000-0000-4000-8000-000000000101';

insert into public.account_onboarding(
  auth_user_id,stage,display_name,completed_at
) values(
  '10000000-0000-4000-8000-000000000101','completed','Recipient',now()
) on conflict(auth_user_id) do update set
  stage='completed',display_name=excluded.display_name,completed_at=excluded.completed_at;

do $$
begin
  if not exists(select 1 from public.profile_postcard_unlocks
    where profile_id='00000000-0000-4000-8000-000000000101'
      and postcard_catalog_key='postcard-city-1819729') then
    raise exception 'Completed Hong Kong nest did not receive its city postcard';
  end if;
  if exists(select 1 from public.inventory_items item
    join public.brazil_state_boundaries boundary on boundary.reward_item_id=item.reward_item_id
    where item.owner_profile_id='00000000-0000-4000-8000-000000000101') then
    raise exception 'A non-Brazilian nest received a Brazilian state stamp';
  end if;
end $$;

update public.profiles set
  home_city_geoname_id=3457952,
  home_latitude=-20.2573,
  home_longitude=-42.0334
where id='00000000-0000-4000-8000-000000000102';

insert into public.account_onboarding(auth_user_id,stage,display_name)
values('10000000-0000-4000-8000-000000000102','nestSetup','Third party')
on conflict(auth_user_id) do update set stage='nestSetup',display_name=excluded.display_name;

do $$
begin
  if exists(select 1 from public.profile_postcard_unlocks
    where profile_id='00000000-0000-4000-8000-000000000102')
    or exists(select 1 from public.inventory_items item
      join public.brazil_state_boundaries boundary on boundary.reward_item_id=item.reward_item_id
        and boundary.active
      where item.owner_profile_id='00000000-0000-4000-8000-000000000102') then
    raise exception 'An incomplete nest received home-origin collectibles';
  end if;
end $$;

update public.player_mascots set level=20
where id='00000000-0000-4000-8000-000000000203';

select set_config(
  'request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true
);

insert into public.deliveries(
  id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,
  origin_latitude,origin_longitude,origin_label_key,destination_latitude,
  destination_longitude,destination_label_key,distance_km,animal_speed_kmh,
  outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed
) values(
  '30000000-0000-4000-8000-000000000090',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000401',
  -25.4284,-49.2733,'locations.curitiba',-22.9068,-43.1729,'locations.rioDeJaneiro',
  680,62,now(),now()+interval '2 hours',now()+interval '3 hours',
  now()+interval '5 hours','outbound','home-stamp-no-duplicate-route'
);

do $$
begin
  if exists(
    select 1 from public.delivery_route_discoveries discovery
    join public.brazil_state_boundaries boundary on boundary.reward_item_id=discovery.reward_item_id
    where discovery.delivery_id='30000000-0000-4000-8000-000000000090'
      and boundary.state_code='PR'
  ) then
    raise exception 'The home state stamp was materialized again during a route';
  end if;
end $$;

rollback;
