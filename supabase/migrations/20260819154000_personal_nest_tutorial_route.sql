-- Move nest activation before the tutorial and materialize a private route from it.
create or replace function public.complete_nest_setup(selected_latitude double precision, selected_longitude double precision, selected_city_geoname_id bigint)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding; profile_record public.profiles; city_record public.geonames_cities; region_name text; lat_step double precision:=2.0/111.32; lon_step double precision; normalized_lat double precision; normalized_lon double precision;
begin
 if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
 select * into strict profile_record from public.profiles where auth_user_id=current_user_id for update;
 if onboarding_record.stage='tutorial' then return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record)); end if;
 if onboarding_record.stage<>'nestSetup' then raise exception 'Nest setup is unavailable' using errcode='22023'; end if;
 select * into city_record from public.geonames_cities where geoname_id=selected_city_geoname_id and is_active;
 if city_record.geoname_id is null then raise exception 'Selected nest city is unavailable' using errcode='22023'; end if;
 select name into region_name from public.geonames_admin1_regions where country_code=city_record.country_code and admin1_code=city_record.admin1_code and is_active;
 normalized_lat:=round(selected_latitude/lat_step)*lat_step; lon_step:=2.0/(111.32*greatest(cos(radians(selected_latitude)),.05)); normalized_lon:=round(selected_longitude/lon_step)*lon_step;
 update public.profiles set home_latitude=normalized_lat,home_longitude=normalized_lon,home_label_key='onboarding.privateNestLabel',home_city_geoname_id=city_record.geoname_id,postal_base_street='',postal_base_neighborhood='',postal_base_city=city_record.name,postal_base_state=coalesce(region_name,''),postal_base_country=city_record.country_code,updated_at=now() where id=profile_record.id returning * into profile_record;
 update public.account_onboarding set stage='tutorial',updated_at=now() where auth_user_id=current_user_id returning * into onboarding_record;
 return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record));
end $$;

-- Provisioning now waits for the player to choose their private nest before tutorial travel.
do $$ declare definition text; begin
 select pg_get_functiondef(p.oid) into definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='provision_initial_mascot';
 definition:=replace(definition,'if onboarding_record.stage = ''tutorial'' then','if onboarding_record.stage in (''nestSetup'',''tutorial'',''completed'') then');
 definition:=replace(definition,'update public.account_onboarding set stage = ''tutorial'', updated_at = now()','update public.account_onboarding set stage = ''nestSetup'', updated_at = now()');
 execute definition;
end $$;

create or replace function public.start_or_resume_tutorial_delivery()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding; profile_record public.profiles; mascot_record public.player_mascots; delivery_record public.deliveries; started_at timestamptz:=clock_timestamp(); bearing double precision; distance_km constant double precision:=6.15; angular_distance double precision:=distance_km/6371; destination_latitude double precision; destination_longitude double precision;
begin
 if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update; if onboarding_record.stage<>'tutorial' then raise exception 'Tutorial is not available' using errcode='22023'; end if;
 select * into strict profile_record from public.profiles where auth_user_id=current_user_id; select * into strict mascot_record from public.player_mascots where owner_profile_id=profile_record.id and is_starter;
 if onboarding_record.tutorial_delivery_id is not null then select * into strict delivery_record from public.deliveries where id=onboarding_record.tutorial_delivery_id; return jsonb_build_object('onboarding',to_jsonb(onboarding_record),'delivery',to_jsonb(delivery_record),'mascot',to_jsonb(mascot_record)); end if;
 bearing:=radians(mod(abs(hashtext(profile_record.id::text||'-tutorial-v2')),360));
 destination_latitude:=degrees(asin(sin(radians(profile_record.home_latitude))*cos(angular_distance)+cos(radians(profile_record.home_latitude))*sin(angular_distance)*cos(bearing)));
 destination_longitude:=degrees(radians(profile_record.home_longitude)+atan2(sin(bearing)*sin(angular_distance)*cos(radians(profile_record.home_latitude)),cos(angular_distance)-sin(radians(profile_record.home_latitude))*sin(radians(destination_latitude))));
 insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,destination_latitude,destination_longitude,destination_label_key,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,travel_modifiers,route_discovery_version,is_tutorial,created_at) values(gen_random_uuid(),profile_record.id,profile_record.id,mascot_record.id,profile_record.home_latitude,profile_record.home_longitude,'tutorial.locations.nest',destination_latitude,destination_longitude,'tutorial.locations.route',distance_km,60,started_at+interval '1 minute',started_at+interval '8 minutes',started_at+interval '9 minutes',started_at+interval '16 minutes','preparing',concat('tutorial-v2-',profile_record.id),jsonb_build_object('version',1,'preparationMinutes',1,'outboundSpeedMultiplier',1,'returnSpeedMultiplier',1,'discoveryRadiusMultiplier',1,'rarityWeightMultiplier',1,'longRouteConsistency',1,'isLongRoute',false),1,true,started_at) returning * into delivery_record;
 delete from public.delivery_route_discoveries where delivery_id=delivery_record.id; insert into public.delivery_route_discoveries(id,delivery_id,route_reward_point_id,reward_item_id,route_progress,distance_from_route_km) values(gen_random_uuid(),delivery_record.id,'00000000-0000-4000-8000-000000000721','00000000-0000-4000-8000-000000000621',.5,0);
 insert into public.delivery_rewards(id,delivery_id,reward_item_id,xp_gained) select gen_random_uuid(),delivery_record.id,id,0 from public.reward_items where catalog_key='reward-tutorial-first-route-stamp'; update public.account_onboarding set tutorial_delivery_id=delivery_record.id,updated_at=now() where auth_user_id=current_user_id returning * into onboarding_record;
 return jsonb_build_object('onboarding',to_jsonb(onboarding_record),'delivery',to_jsonb(delivery_record),'mascot',to_jsonb(mascot_record));
end $$;

-- Completing the tutorial now activates the already-selected nest.
do $$ declare definition text; begin
 select pg_get_functiondef(p.oid) into definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname='collect_tutorial_delivery';
 definition:=replace(definition,'onboarding_record.stage=''nestSetup'' and onboarding_record.tutorial_collected_at is not null','onboarding_record.stage=''completed'' and onboarding_record.tutorial_collected_at is not null');
 definition:=replace(definition,'set stage=''nestSetup'',tutorial_collected_at=coalesce(tutorial_collected_at,now()),updated_at=now()','set stage=''completed'',tutorial_collected_at=coalesce(tutorial_collected_at,now()),completed_at=coalesce(completed_at,now()),updated_at=now()'); execute definition; end $$;
