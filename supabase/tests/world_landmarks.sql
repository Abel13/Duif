begin;

do $$
declare landmark public.world_landmark_catalog; asset_version record; catalog_count integer; asset_count integer;
begin
  select count(*) into catalog_count from public.world_landmark_catalog
  where catalog_key in ('landmark.christ-the-redeemer','landmark.masp') and active;
  if catalog_count<>2 then raise exception 'Both memorable places must be active'; end if;
  select * into strict landmark from public.world_landmark_catalog where catalog_key='landmark.christ-the-redeemer';
  if landmark.eligibility_radius_km<>25 or landmark.minimum_zoom<>8 or landmark.icon_size_px<>56
    or landmark.postcard_catalog_key<>'postcard-landmark-christ-the-redeemer' then raise exception 'Christ catalog contract is invalid'; end if;
  select * into strict landmark from public.world_landmark_catalog where catalog_key='landmark.masp';
  if landmark.eligibility_radius_km<>25 or landmark.minimum_zoom<>8 or landmark.icon_size_px<>56
    or landmark.postcard_catalog_key<>'postcard-landmark-masp' then raise exception 'MASP catalog contract is invalid'; end if;
  select v.* into strict asset_version from public.official_asset_versions v join public.official_assets a on a.id=v.asset_id where a.asset_key='landmark.christTheRedeemer.artwork' and v.status='active';
  if asset_version.mime_type<>'image/webp' or asset_version.width<>256 or asset_version.height<>256 or asset_version.byte_size>61440 then raise exception 'Landmark asset exceeds its contract'; end if;
  select count(*) into asset_count from public.official_asset_versions v join public.official_assets a on a.id=v.asset_id
  where v.status='active' and a.asset_key in ('landmark.christTheRedeemer.artwork','landmark.masp.artwork','postcard.landmark.christTheRedeemer.front','postcard.landmark.masp.front');
  if asset_count<>4 then raise exception 'Memorable place asset pair is incomplete'; end if;
  if exists(select 1 from public.official_asset_versions v join public.official_assets a on a.id=v.asset_id
    where v.status='active' and a.asset_key like 'postcard.landmark.%' and (v.width<>1200 or v.height<>800 or v.byte_size>262144)) then
    raise exception 'Memorable-place postcard exceeds its contract';
  end if;
  if to_regprocedure('public.reconcile_my_world_landmarks()') is null or to_regprocedure('public.acknowledge_world_landmark(text)') is null then raise exception 'Landmark RPCs are missing'; end if;
end $$;

do $$
declare owner record; receiver record; delivery_id uuid:=gen_random_uuid(); encounter record; unlocked_count integer;
begin
  select m.id mascot_id,m.owner_profile_id profile_id into owner from public.player_mascots m
  where not exists(select 1 from public.deliveries d where d.mascot_id=m.id and d.status not in ('returned','completed')) limit 1;
  select id into receiver from public.profiles where id<>owner.profile_id limit 1;
  if owner.mascot_id is null or receiver.id is null then return; end if;
  insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,destination_latitude,destination_longitude,destination_label_key,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,is_tutorial)
  values(delivery_id,owner.profile_id,receiver.id,owner.mascot_id,-22.95192,-43.50,'tests.landmark.origin',-22.95192,-42.95,'tests.landmark.destination',56,60,now()-interval '1 hour',now()+interval '1 hour',now()+interval '2 hours',now()+interval '4 hours','outbound','world-landmark-test',false);
  select e.* into strict encounter from public.delivery_landmark_encounters e where e.delivery_id=delivery_id;
  if encounter.distance_from_route_km>25 or encounter.route_progress<=0 or encounter.route_progress>=1 then raise exception 'Eligible passage was not materialized: %',to_jsonb(encounter); end if;
  perform public.resolve_due_landmark_encounters(encounter.encounter_at-interval '1 second',owner.profile_id);
  if exists(select 1 from public.profile_landmark_unlocks where profile_id=owner.profile_id and landmark_id=encounter.landmark_id) then raise exception 'Landmark unlocked before passage'; end if;
  perform public.resolve_due_landmark_encounters(encounter.encounter_at,owner.profile_id);
  perform public.resolve_due_landmark_encounters(encounter.encounter_at+interval '1 minute',owner.profile_id);
  select count(*) into unlocked_count from public.profile_landmark_unlocks where profile_id=owner.profile_id and landmark_id=encounter.landmark_id;
  if unlocked_count<>1 then raise exception 'Landmark unlock is not idempotent'; end if;
  if not exists(select 1 from public.profile_postcard_unlocks u
    where u.profile_id=owner.profile_id and u.postcard_catalog_key='postcard-landmark-christ-the-redeemer'
      and u.source='memorable-place') then raise exception 'Paired postcard was not granted'; end if;
  if (select count(*) from public.profile_postcard_unlocks u
    where u.profile_id=owner.profile_id and u.postcard_catalog_key='postcard-landmark-christ-the-redeemer')<>1 then
    raise exception 'Paired postcard grant is not idempotent';
  end if;
  if exists(select 1 from public.inventory_items where owner_profile_id=owner.profile_id and source_key='landmark.christ-the-redeemer') then raise exception 'Informational landmark created inventory'; end if;
end $$;

rollback;
