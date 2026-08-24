begin;
\ir player_fixtures.sql

do $$ begin
 if (select count(*) from public.equipment_catalog where status='active')<>8 then raise exception 'expected eight active functional equipment items'; end if;
 if exists(select 1 from public.equipment_catalog where kind='backpack' and (max_uses is not null or slot_bonus not between 1 and 3)) then raise exception 'invalid backpack contract'; end if;
 if exists(select 1 from public.equipment_catalog where kind='utility' and (max_uses<>10 or repair_seed_price<>80 or seed_price<>200)) then raise exception 'invalid utility economy'; end if;
 if (select count(*) from public.equipment_catalog where kind='cosmetic' and status='hidden')<>7 then raise exception 'legacy cosmetics were not preserved'; end if;
 if (select count(*) from public.equipment_catalog_effects)<>10 then raise exception 'declarative equipment effects missing'; end if;
 if (public.travel_environment_v2('cloudy',0,true,'winter',9.9)->'hazards'->>'cold')::numeric<>.02 then raise exception 'cold threshold mismatch'; end if;
 if (public.travel_environment_v2('clear',0,true,'summer',27)->'hazards'->>'strongSun')::numeric<>.01 then raise exception 'strong sun hazard mismatch'; end if;
end $$;

insert into public.profile_seed_balances(profile_id,quantity) values('00000000-0000-4000-8000-000000000001',1000);
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$
declare backpack uuid; utility uuid; first_result jsonb; second_result jsonb; equipped jsonb;
begin
 first_result:=public.purchase_equipment('backpack-small','30000000-0000-4000-8000-000000000001');
 second_result:=public.purchase_equipment('backpack-small','30000000-0000-4000-8000-000000000001');
 if first_result->>'instanceId'<>second_result->>'instanceId' or (select quantity from public.profile_seed_balances where profile_id='00000000-0000-4000-8000-000000000001')<>850 then raise exception 'purchase is not idempotent'; end if;
 perform public.purchase_equipment('utility-raincoat','30000000-0000-4000-8000-000000000002');
 perform public.purchase_equipment('utility-crimson-courier-scarf','30000000-0000-4000-8000-000000000005');
 perform public.purchase_equipment('utility-meadow-post-cap','30000000-0000-4000-8000-000000000006');
 if (select count(*) from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.owner_profile_id='00000000-0000-4000-8000-000000000001' and c.catalog_key in ('utility-crimson-courier-scarf','utility-meadow-post-cap'))<>2 then raise exception 'thermal utilities were not purchased as physical instances'; end if;
 select i.id into backpack from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where c.catalog_key='backpack-small' and i.owner_profile_id='00000000-0000-4000-8000-000000000001';
 select i.id into utility from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where c.catalog_key='utility-raincoat' and i.owner_profile_id='00000000-0000-4000-8000-000000000001';
 equipped:=public.set_mascot_loadout('00000000-0000-4000-8000-000000000203',backpack,utility,1,'30000000-0000-4000-8000-000000000003');
 if public.set_mascot_loadout('00000000-0000-4000-8000-000000000203',backpack,utility,1,'30000000-0000-4000-8000-000000000003')<>equipped then raise exception 'loadout retry changed its result'; end if;
end $$;

reset role;
insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,destination_latitude,destination_longitude,destination_label_key,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed)
values('40000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000203',-23.3,-51.1,'test.origin',-23.4,-51.9,'test.destination',20,20,now(),now()+interval '1 hour',now()+interval '91 minutes',now()+interval '151 minutes','preparing','equipment-test');

do $$
declare segment_id uuid; utility_id uuid; uses integer;
begin
 if (select travel_slot_capacity from public.deliveries where id='40000000-0000-4000-8000-000000000001')<>4 then raise exception 'backpack slot snapshot was not applied'; end if;
 if abs((select animal_speed_kmh from public.deliveries where id='40000000-0000-4000-8000-000000000001')-19)>.001 then raise exception 'backpack speed tradeoff was not applied'; end if;
 if (select equipment_snapshot->'backpack'->>'catalogKey' from public.deliveries where id='40000000-0000-4000-8000-000000000001')<>'backpack-small' then raise exception 'loadout snapshot missing'; end if;
 select id into segment_id from public.delivery_route_segments where delivery_id='40000000-0000-4000-8000-000000000001' order by estimated_start_at limit 1;
 update public.delivery_route_segments set weather_snapshot=jsonb_build_object('weatherCode',61,'category','rain','isDay',true,'windSpeedKmh',5,'windGustKmh',8,'temperatureC',20,'observedAt',now()),modifiers=jsonb_set(modifiers,'{hazards}',jsonb_build_object('wet',.04)),state='active' where id=segment_id;
 select i.id,i.uses_remaining into utility_id,uses from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where c.catalog_key='utility-raincoat' and i.owner_profile_id='00000000-0000-4000-8000-000000000001';
 if uses<>9 or (select count(*) from public.delivery_equipment_activations where delivery_id='40000000-0000-4000-8000-000000000001')<>1 then raise exception 'utility did not consume exactly one use'; end if;
 update public.delivery_route_segments set effective_speed_kmh=effective_speed_kmh where id=segment_id;
 if (select uses_remaining from public.equipment_instances where id=utility_id)<>9 then raise exception 'utility consumed twice'; end if;
 update public.equipment_instances set uses_remaining=0,equipped_mascot_id=null where id=utility_id;
 update public.mascot_loadouts set utility_instance_id=null where mascot_id='00000000-0000-4000-8000-000000000203';
end $$;

update public.deliveries set status='completed' where id='40000000-0000-4000-8000-000000000001';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$
declare utility uuid; first_result jsonb; second_result jsonb;
begin
 select i.id into utility from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where c.catalog_key='utility-raincoat' and i.owner_profile_id='00000000-0000-4000-8000-000000000001';
 first_result:=public.repair_equipment(utility,'30000000-0000-4000-8000-000000000004'); second_result:=public.repair_equipment(utility,'30000000-0000-4000-8000-000000000004');
 if first_result<>second_result or (select uses_remaining from public.equipment_instances where id=utility)<>10 then raise exception 'repair is not idempotent'; end if;
 if (select quantity from public.profile_seed_balances where profile_id='00000000-0000-4000-8000-000000000001')<>170 then raise exception 'equipment economy debited an unexpected amount'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000102',true);
do $$ begin if exists(select 1 from public.equipment_instances) then raise exception 'equipment RLS leaked another owner inventory'; end if; end $$;
rollback;
