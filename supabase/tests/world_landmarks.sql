begin;

do $$
declare landmark public.world_landmark_catalog; asset_count integer; postcard_count integer;
begin
  select count(*) into asset_count from public.world_landmark_catalog where active;
  if asset_count<>50 then raise exception 'All 50 memorable places must be active, found %',asset_count; end if;
  if exists(select 1 from public.world_landmark_catalog where active and (rules_version<>1 or eligibility_radius_km<>25 or minimum_zoom<>8 or icon_size_px<>56 or sort_order not between 0 and 50)) then
    raise exception 'Memorable-place catalog contract is invalid';
  end if;
  if (select count(distinct sort_order) from public.world_landmark_catalog where active)<>50 then raise exception 'Memorable-place sort orders are incomplete'; end if;
  if exists(select 1 from public.world_landmark_catalog l left join public.official_assets a on a.asset_key=l.asset_key left join public.official_asset_versions v on v.asset_id=a.id and v.status='active' where l.active and (a.asset_type<>'landmarkArtwork' or v.mime_type<>'image/webp' or v.width<>256 or v.height<>256 or v.byte_size>61440 or v.metadata->>'kind'<>'landmarkArtwork')) then
    raise exception 'Memorable-place sticker asset contract is invalid';
  end if;
  select count(*) into postcard_count from public.world_landmark_catalog l join public.official_postcards p on p.catalog_key=l.postcard_catalog_key and p.status='active' join public.official_assets a on a.asset_key=p.artwork_asset_key join public.official_asset_versions v on v.asset_id=a.id and v.status='active' where l.active and p.availability='city' and a.asset_type='postcardArtwork' and v.mime_type='image/webp' and v.width=1200 and v.height=800 and v.metadata->>'kind'='postcardArtwork';
  if postcard_count<>50 then raise exception 'Memorable-place postcard pair is incomplete, found %',postcard_count; end if;
  if exists(select 1 from public.world_landmark_catalog l join public.official_postcards p on p.catalog_key=l.postcard_catalog_key join public.official_assets a on a.asset_key=p.artwork_asset_key join public.official_asset_versions v on v.asset_id=a.id and v.status='active' where l.active and l.sort_order>=5 and v.byte_size>184320) then raise exception 'Published memorable-place postcard exceeds the editorial budget'; end if;
  if to_regprocedure('public.reconcile_my_world_landmarks()') is null or to_regprocedure('public.acknowledge_world_landmark(text)') is null then raise exception 'Landmark RPCs are missing'; end if;
end $$;

do $$
declare owner record; receiver record; target public.world_landmark_catalog; delivery_id uuid; encounter record;
begin
  select m.id mascot_id,m.owner_profile_id profile_id into owner from public.player_mascots m where not exists(select 1 from public.deliveries d where d.mascot_id=m.id and d.status not in ('returned','completed')) limit 1;
  select id into receiver from public.profiles where id<>owner.profile_id limit 1;
  if owner.mascot_id is null or receiver.id is null then return; end if;
  for target in select * from public.world_landmark_catalog where active order by sort_order loop
    delivery_id:=gen_random_uuid();
    insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,destination_latitude,destination_longitude,destination_label_key,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,is_tutorial)
    values(delivery_id,owner.profile_id,receiver.id,owner.mascot_id,target.latitude-.5,target.longitude-.5,'tests.landmark.origin',target.latitude+.5,target.longitude+.5,'tests.landmark.destination',160,60,now()-interval '1 hour',now()+interval '1 hour',now()+interval '2 hours',now()+interval '4 hours','outbound','world-landmark-test',false);
    select e.* into strict encounter from public.delivery_landmark_encounters e where e.delivery_id=delivery_id and e.landmark_id=target.id;
    if encounter.distance_from_route_km>25 or encounter.route_progress<=0 or encounter.route_progress>=1 then raise exception 'Eligible passage was not materialized: %',target.catalog_key; end if;
    perform public.resolve_due_landmark_encounters(encounter.encounter_at-interval '1 second',owner.profile_id);
    perform public.resolve_due_landmark_encounters(encounter.encounter_at,owner.profile_id);
    perform public.resolve_due_landmark_encounters(encounter.encounter_at+interval '1 minute',owner.profile_id);
    if (select count(*) from public.profile_landmark_unlocks u where u.profile_id=owner.profile_id and u.landmark_id=target.id)<>1 then raise exception 'Landmark unlock is not idempotent: %',target.catalog_key; end if;
    if (select count(*) from public.profile_postcard_unlocks u where u.profile_id=owner.profile_id and u.postcard_catalog_key=target.postcard_catalog_key and u.source='memorable-place')<>1 then raise exception 'Paired postcard was not granted: %',target.catalog_key; end if;
  end loop;
end $$;

rollback;
