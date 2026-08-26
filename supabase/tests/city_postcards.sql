begin;

\ir player_fixtures.sql

update public.player_mascots set level=20
where id in ('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000204');

do $$
begin
  if (select count(*) from public.city_postcard_catalog where active)<>4 then
    raise exception 'Expected four active city postcards';
  end if;
  if (select count(*) from public.official_postcards
      where catalog_key in ('postcard-city-3457952','postcard-city-3458449','postcard-city-3456166','postcard-city-1819729')
        and availability='city' and status='active')<>4 then
    raise exception 'City postcards are not active in the official catalog';
  end if;
  if (select count(*) from public.official_asset_versions version
      join public.official_assets asset on asset.id=version.asset_id
      where asset.asset_key like 'postcard.city.%.front' and version.status='active'
        and version.mime_type='image/webp' and version.width=1200 and version.height=800
        and version.byte_size<=184320)<>4 then
    raise exception 'A city postcard asset is absent or violates its budget';
  end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

insert into public.deliveries(
  id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,
  origin_latitude,origin_longitude,origin_label_key,destination_latitude,
  destination_longitude,destination_label_key,distance_km,animal_speed_kmh,
  outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,
  reward_seed,route_identity
) values(
  '31000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000401',
  -20.25806,-42.03361,'locations.manhuacu',-23.31028,-51.16278,'locations.londrina',
  900,62,now()-interval '6 hours',now()-interval '4 hours',now()-interval '3 hours',now()-interval '1 hour',
  'returned','city-postcard-londrina',jsonb_build_object(
    'version',3,'origin','city:3457952','destination','city:3458449',
    'pairKey','city:3457952|city:3458449'
  )
);

update public.deliveries set status='completed'
where id='31000000-0000-4000-8000-000000000001';

do $$
declare owned_keys text[];
begin
  if not exists(select 1 from public.profile_postcard_unlocks
    where profile_id='00000000-0000-4000-8000-000000000001'
      and postcard_catalog_key='postcard-city-3458449'
      and source='completed-city-visit') then
    raise exception 'Completed canonical city visit did not unlock its postcard';
  end if;
  select array_agg(catalog_key order by catalog_key) into owned_keys
  from public.list_owned_postcards();
  if not ('postcard-city-3458449'=any(owned_keys)) then
    raise exception 'Unlocked city postcard is absent from the owned catalog';
  end if;
  update public.deliveries set status='completed'
  where id='31000000-0000-4000-8000-000000000001';
  if (select count(*) from public.profile_postcard_unlocks
      where profile_id='00000000-0000-4000-8000-000000000001'
        and postcard_catalog_key='postcard-city-3458449')<>1 then
    raise exception 'Repeated completion duplicated a city postcard unlock';
  end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000101',true);

insert into public.deliveries(
  id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,
  origin_latitude,origin_longitude,origin_label_key,destination_latitude,
  destination_longitude,destination_label_key,distance_km,animal_speed_kmh,
  outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,
  reward_seed,route_identity,is_tutorial
) values
  ('31000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000204','00000000-0000-4000-8000-000000000401',-22.28194,-42.53111,'locations.novaFriburgo',22.27832,114.17469,'locations.hongKong',18000,62,now()-interval '6 hours',now()-interval '4 hours',now()-interval '3 hours',now()-interval '1 hour','returned','city-postcard-tutorial',jsonb_build_object('version',3,'origin','city:3456166','destination','city:1819729','pairKey','city:1819729|city:3456166'),true);

update public.deliveries set status='completed'
where id='31000000-0000-4000-8000-000000000002';

insert into public.deliveries(
  id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,
  origin_latitude,origin_longitude,origin_label_key,destination_latitude,
  destination_longitude,destination_label_key,distance_km,animal_speed_kmh,
  outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,
  reward_seed,route_identity
) values(
  '31000000-0000-4000-8000-000000000003','00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000204','00000000-0000-4000-8000-000000000401',-22.28194,-42.53111,'locations.novaFriburgo',22.27832,114.17469,'locations.hongKong',18000,62,now()-interval '6 hours',now()-interval '4 hours',now()-interval '3 hours',now()-interval '1 hour','returned','city-postcard-legacy',jsonb_build_object('version',2,'destinationLabel','Hong Kong')
);

update public.deliveries set status='completed'
where id='31000000-0000-4000-8000-000000000003';

do $$
begin
  if exists(select 1 from public.profile_postcard_unlocks
    where profile_id='00000000-0000-4000-8000-000000000101'
      and postcard_catalog_key='postcard-city-1819729') then
    raise exception 'Tutorial or ambiguous legacy delivery unlocked a city postcard';
  end if;
end $$;

rollback;
