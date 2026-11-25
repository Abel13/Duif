begin;
\ir player_fixtures.sql

do $$ begin
  if has_function_privilege('anon','public.purchase_aurora()','EXECUTE') then
    raise exception 'Anonymous purchase is possible';
  end if;
end $$;
insert into public.profile_seed_balances(profile_id,quantity)
values('00000000-0000-4000-8000-000000000001',499);
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ begin
  if (select price from public.get_aurora_offer()) is distinct from 500 then raise exception 'Invalid offer'; end if;
  begin
    perform public.purchase_aurora();
    raise exception 'Purchase with 499 seeds succeeded';
  exception when invalid_parameter_value then null; end;
end $$;
reset role;
update public.profile_seed_balances set quantity=500 where profile_id=public.current_profile_id();
set local role authenticated;
do $$
declare mascot uuid:=public.purchase_aurora();
begin
  if public.purchase_aurora() is distinct from mascot or (select owned from public.get_aurora_offer()) is not true
    or (select quantity from public.profile_seed_balances where profile_id=public.current_profile_id())<>0 then
    raise exception 'Purchase did not persist exactly once';
  end if;
  if (select level from public.player_mascots where id=mascot)<>1 then raise exception 'Wrong starting level'; end if;
end $$;
reset role;
update public.player_mascots set level=4 where template_id='00000000-0000-4000-8000-000000000205' and owner_profile_id=public.current_profile_id();
do $$ begin
  begin
    perform public.choose_mascot_individual_skill(public.purchase_aurora(),'skill-aurora-forager');
    raise exception 'Level four skill was selectable';
  exception when invalid_parameter_value then null; end;
end $$;
update public.player_mascots set level=5 where id=public.purchase_aurora();
select public.choose_mascot_individual_skill(public.purchase_aurora(),'skill-aurora-forager');

-- Control the dispatch forecast for every segment in this rolled-back test.
create or replace function public.virtual_travel_weather_v2(delivery_id uuid,leg text,segment_index integer,
  block_start timestamptz,latitude numeric,longitude numeric)
returns jsonb language sql immutable as $$
  select jsonb_build_object('category','clear','isDay',true,'weatherCode',0,'temperatureC',20,
    'windSpeedKmh',0,'windGustKmh',0,'observedAt',block_start)
$$;
create function pg_temp.fly_aurora(destination text) returns uuid language plpgsql as $$
declare journey uuid:=gen_random_uuid();
begin
  insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,
    origin_latitude,origin_longitude,origin_label_key,destination_latitude,destination_longitude,destination_label_key,
    distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed)
  values(journey,public.current_profile_id(),'00000000-0000-4000-8000-000000000101',public.purchase_aurora(),
    -23.3,-51.1,'test.origin',-23.4,-51.9,destination,100,50,now(),now()+interval '2 hours',
    now()+interval '125 minutes',now()+interval '245 minutes','preparing',journey::text);
  return journey;
end $$;
do $$
declare journey uuid; second_journey uuid; chance numeric; base numeric; return_segment uuid;
begin
  journey:=pg_temp.fly_aurora('test.destination');
  select sum(base_chance_percent)*1.14 into base from public.seed_package_catalog
    where status='active' and min_distance_km<=200;
  select effective_chance into strict chance from public.delivery_seed_package_opportunities
    where delivery_id=journey and opportunity_index=0;
  if chance<>least(95,base*1.01) then raise exception 'Invalid seed chance: %',chance; end if;
  select id into strict return_segment from public.delivery_route_segments where delivery_id=journey and leg='return';
  if (select modifiers->>'skills' from public.delivery_route_segments where id=return_segment)::numeric<>1.005 then
    raise exception 'Missing daytime speed';
  end if;
  update public.delivery_route_segments set weather_snapshot=weather_snapshot||'{"category":"cloudy"}' where id=return_segment;
  if (select modifiers->>'skills' from public.delivery_route_segments where id=return_segment)::numeric<>1 then raise exception 'Cloud speed'; end if;
  update public.delivery_route_segments set weather_snapshot=weather_snapshot||'{"isDay":false,"category":"clear"}' where id=return_segment;
  if (select modifiers->>'skills' from public.delivery_route_segments where id=return_segment)::numeric<>1 then raise exception 'Night speed'; end if;
  update public.deliveries set status='returned' where id=journey;
  perform public.collect_delivery_reward(journey);
  perform public.collect_delivery_reward(journey);
  if not exists(select 1 from public.delivery_skill_awards where delivery_id=journey and skill_id='skill-aurora-forager') then
    raise exception 'Applied package chance received no XP';
  end if;
  perform public.choose_mascot_individual_skill(public.purchase_aurora(),'skill-aurora-pioneer');
  second_journey:=pg_temp.fly_aurora('test.destination');
  if (select travel_modifiers#>>'{skillContext,firstDestination}' from public.deliveries where id=second_journey)<>'false' then
    raise exception 'Repeated destination marked as new';
  end if;
end $$;
update public.player_mascots set level=10 where id=public.purchase_aurora();
do $$ begin
  begin
    perform public.choose_mascot_individual_skill(public.purchase_aurora(),'skill-aurora-nest-memory');
    raise exception 'Permanent choice was overwritten';
  exception when invalid_parameter_value then null; end;
end $$;

-- Start the collectible test with a controlled catalog and two equidistant candidates.
update public.route_reward_points set status='archived' where status='active';
update public.route_reward_points set status='active', latitude=-23.25,longitude=-51.1,eligibility_radius_km=5
  where catalog_key in ('route-reward-londrina-postcard','route-reward-cambe-souvenir');
update public.deliveries set status='completed' where mascot_id=public.purchase_aurora() and status<>'completed';
create function pg_temp.control_pioneer_roll() returns trigger language plpgsql as $$
begin
  perform setseed(current_setting('test.pioneer_seed')::double precision);
  return new;
end $$;
create trigger materialize_aurora_test_roll after insert on public.deliveries for each row
  execute function pg_temp.control_pioneer_roll();
do $$
declare draw double precision; journey uuid; chosen text;
begin
  for i in 1..10000 loop
    perform setseed(i/10000.0);
    draw:=random();
    if draw between .203 and .219 then
      perform set_config('test.pioneer_seed',(i/10000.0)::text,true);
      exit;
    end if;
  end loop;
  journey:=pg_temp.fly_aurora('new-first-level');
  if exists(select 1 from public.delivery_route_discoveries where delivery_id=journey) then raise exception 'Pioneer level 1 exceeded 20.2 percent'; end if;
  update public.deliveries set status='returned' where id=journey;
  perform public.collect_delivery_reward(journey);
  if not exists(select 1 from public.delivery_skill_awards where delivery_id=journey and skill_id='skill-aurora-pioneer') then raise exception 'Missed eligible roll did not earn XP'; end if;
  update public.mascot_skill_progression set level=10 where mascot_id=public.purchase_aurora() and skill_id='skill-aurora-pioneer';
  journey:=pg_temp.fly_aurora('new-max-level');
  select p.catalog_key into strict chosen from public.delivery_route_discoveries d
    join public.route_reward_points p on p.id=d.route_reward_point_id where d.delivery_id=journey;
  if chosen<>'route-reward-cambe-souvenir' then raise exception 'Incorrect nearest/tie winner: %',chosen; end if;
  update public.deliveries set status='returned' where id=journey;
  perform public.collect_delivery_reward(journey);
  perform public.collect_delivery_reward(journey);
  journey:=pg_temp.fly_aurora('new-max-level');
  if exists(select 1 from public.delivery_route_discoveries where delivery_id=journey) then raise exception 'Pioneer repeated gift'; end if;
end $$;
rollback;
