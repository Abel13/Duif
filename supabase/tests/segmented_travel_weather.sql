begin;

do $$
declare mascot record; target_id uuid:=gen_random_uuid(); target_mascot_id uuid:=gen_random_uuid(); segment_total integer; distance_total numeric; first_weather jsonb; first_completed timestamptz; summary jsonb; invoke_definition text;
begin
  select pg_get_functiondef('public.invoke_weather_travel_edge_function()'::regprocedure) into invoke_definition;
  if invoke_definition not like '%duif_weather_resolver_cron_secret%' or invoke_definition not like '%X-Duif-Cron-Secret%' then raise exception 'weather resolver does not use its dedicated cron secret'; end if;
  if invoke_definition like '%duif_service_role_key%' or invoke_definition like '%''Authorization''%' then raise exception 'weather resolver still exposes service role authorization'; end if;
  select pm.id,pm.owner_profile_id,p.home_latitude,p.home_longitude into mascot from public.player_mascots pm join public.profiles p on p.id=pm.owner_profile_id limit 1;
  if mascot.id is null then raise exception 'mascot fixture required'; end if;
  insert into public.player_mascots(id,owner_profile_id,template_id,name,level,xp,next_level_xp,attributes,trait,equipment,skills,appearance)
  select target_mascot_id,owner_profile_id,template_id,'Weather Test',level,xp,next_level_xp,attributes,trait,equipment,skills,appearance from public.player_mascots where id=mascot.id;
  insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,destination_latitude,destination_longitude,destination_label_key,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed)
  values(target_id,mascot.owner_profile_id,mascot.owner_profile_id,target_mascot_id,mascot.home_latitude,mascot.home_longitude,'test.origin',mascot.home_latitude+1,mascot.home_longitude+1,'test.destination',120,20,now()-interval '1 hour',now()+interval '5 hours',now()+interval '35 minutes'+interval '5 hours',now()+interval '11 hours 35 minutes','completed','weather-test');
  select count(*),sum(distance_km) into segment_total,distance_total from public.delivery_route_segments where delivery_id=target_id and leg='outbound';
  if segment_total<1 or segment_total>24 or distance_total<>120 then raise exception 'invalid outbound segmentation: %, %',segment_total,distance_total; end if;
  if (select travel_rules_snapshot->>'version' from public.deliveries where id=target_id)<>'1' then raise exception 'missing rules snapshot'; end if;
  if (select travel_weather_summary ? 'estimatedArrivalAt' from public.deliveries where id=target_id) is not true then raise exception 'missing safe travel summary'; end if;
  if (select travel_weather_summary ?& array['isDay','conditionImpactMultiplier'] from public.deliveries where id=target_id) is not true then raise exception 'missing current day/night or mascot impact'; end if;
  select travel_weather_summary into summary from public.deliveries where id=target_id;
  if (summary->>'segmentCount')::integer<>segment_total or (summary->>'currentSegmentIndex')::integer not between 0 and segment_total-1 then raise exception 'summary mixed outbound and return segment counters: %',summary; end if;
  if has_table_privilege('authenticated','public.delivery_route_segments','select') or has_table_privilege('authenticated','public.weather_forecast_cache','select') then raise exception 'private travel details are exposed'; end if;
  perform public.resolve_delivery_route_segments(target_id,now()+interval '2 days');
  select weather_snapshot,completed_at into first_weather,first_completed from public.delivery_route_segments where delivery_id=target_id and leg='outbound' and segment_index=0;
  perform public.resolve_delivery_route_segments(target_id,now()+interval '3 days');
  if exists(select 1 from public.delivery_route_segments where delivery_id=target_id and leg='outbound' and segment_index=0 and (weather_snapshot<>first_weather or completed_at<>first_completed)) then raise exception 'completed snapshot changed'; end if;
  if exists(select 1 from public.delivery_route_segments where delivery_id=target_id and effective_speed_kmh/(select animal_speed_kmh from public.deliveries where id=target_id) not between .60 and 1.25) then raise exception 'speed clamp violated'; end if;
  if public.virtual_travel_weather(target_id,'outbound',2,timestamptz '2026-08-23 03:00Z',10,10)<>public.virtual_travel_weather(target_id,'outbound',2,timestamptz '2026-08-23 03:00Z',10,10) then raise exception 'virtual weather is not deterministic'; end if;
end $$;

set local role service_role;
select set_config('request.jwt.claim.role','service_role',true);
do $$ begin
  if public.apply_weather_forecast(10.0,20.0,date_bin(interval '3 hours',now()+interval '3 hours',timestamptz '2000-01-01'),1,true,10,15,'openMeteo')<0 then raise exception 'forecast application returned an invalid count'; end if;
end $$;
reset role;

rollback;
