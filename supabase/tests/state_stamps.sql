begin;

\ir player_fixtures.sql

update public.player_mascots set level=20
where id in ('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000204');

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$
declare asset_count integer;
begin
  if (select count(*) from public.brazil_state_boundaries where active)<>27 then
    raise exception 'Expected all 26 states and Distrito Federal';
  end if;
  if exists(select 1 from public.brazil_state_boundaries
    where not extensions.st_isvalid(geometry) or extensions.st_srid(geometry)<>4326) then
    raise exception 'State boundary geometry is invalid';
  end if;
  select count(*) into asset_count from public.official_asset_versions version
  join public.official_assets asset on asset.id=version.asset_id
  where version.status='active' and asset.asset_key like 'stamp.state.%.front';
  if asset_count<>27 then raise exception 'Expected 27 active state stamp assets'; end if;
  if (select count(distinct state_code) from public.brazil_state_boundaries)<>27
    or exists(select 1 from public.brazil_state_boundaries boundary
      where boundary.name_key<>concat('postalTraffic.regions.',case boundary.state_code
        when 'AC' then 'acre' when 'AL' then 'alagoas' when 'AP' then 'amapa'
        when 'AM' then 'amazonas' when 'BA' then 'bahia' when 'CE' then 'ceara'
        when 'DF' then 'distritoFederal' when 'ES' then 'espiritoSanto' when 'GO' then 'goias'
        when 'MA' then 'maranhao' when 'MT' then 'matoGrosso' when 'MS' then 'matoGrossoDoSul'
        when 'MG' then 'minasGerais' when 'PA' then 'para' when 'PB' then 'paraiba'
        when 'PR' then 'parana' when 'PE' then 'pernambuco' when 'PI' then 'piaui'
        when 'RJ' then 'rioDeJaneiro' when 'RN' then 'rioGrandeDoNorte'
        when 'RS' then 'rioGrandeDoSul' when 'RO' then 'rondonia' when 'RR' then 'roraima'
        when 'SC' then 'santaCatarina' when 'SP' then 'saoPaulo' when 'SE' then 'sergipe'
        when 'TO' then 'tocantins' end,'Brazil')) then
    raise exception 'A state boundary has an invalid public region key';
  end if;
  if exists(select 1 from public.official_asset_versions version
    join public.official_assets asset on asset.id=version.asset_id
    where asset.asset_key like 'stamp.state.%.front' and version.status='active'
      and (version.mime_type<>'image/webp' or version.width<>171 or version.height<>256 or version.byte_size>61440)) then
    raise exception 'A state stamp asset violates its budget';
  end if;
end $$;

insert into public.deliveries(
  id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,
  origin_latitude,origin_longitude,origin_label_key,destination_latitude,
  destination_longitude,destination_label_key,distance_km,animal_speed_kmh,
  outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed
) values(
  '30000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203',
  '00000000-0000-4000-8000-000000000401',
  -25.4284,-49.2733,'locations.curitiba',-22.9068,-43.1729,'locations.rioDeJaneiro',
  680,62,now()-interval '6 hours',now()-interval '4 hours',now()-interval '3 hours',
  now()-interval '1 hour','returned','state-stamp-crossing-test'
);

do $$
declare codes text[]; state_discovery record;
begin
  select array_agg(boundary.state_code order by boundary.state_code) into codes
  from public.delivery_route_discoveries discovery
  join public.brazil_state_boundaries boundary on boundary.reward_item_id=discovery.reward_item_id
  where discovery.delivery_id='30000000-0000-4000-8000-000000000001';
  if codes is distinct from array['PR','RJ','SP']::text[] then
    raise exception 'Expected PR, RJ and SP, got %',codes;
  end if;
  for state_discovery in
    select discovery.*,boundary.geometry from public.delivery_route_discoveries discovery
    join public.brazil_state_boundaries boundary on boundary.reward_item_id=discovery.reward_item_id
    where discovery.delivery_id='30000000-0000-4000-8000-000000000001'
  loop
    if state_discovery.route_progress not between 0 and 1
      or state_discovery.encounter_latitude is null or state_discovery.encounter_longitude is null
      or not extensions.st_intersects(state_discovery.geometry,
        extensions.st_setsrid(extensions.st_makepoint(state_discovery.encounter_longitude,state_discovery.encounter_latitude),4326)) then
      raise exception 'State entry point is not explainable: %',to_jsonb(state_discovery);
    end if;
  end loop;
  if (select count(*) from public.profile_state_stamp_reservations
      where profile_id='00000000-0000-4000-8000-000000000001')<>3 then
    raise exception 'State reservations were not materialized once per profile';
  end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

update public.deliveries set return_start_at=now()-interval '2 minutes',
  return_arrival_at=now()-interval '1 minute',status='returned'
where id='30000000-0000-4000-8000-000000000001';

do $$
declare result jsonb;
begin
  result:=public.collect_delivery_reward('30000000-0000-4000-8000-000000000001');
  if (select count(*) from public.inventory_items item join public.reward_items reward on reward.id=item.reward_item_id
      where item.owner_profile_id='00000000-0000-4000-8000-000000000001'
        and reward.catalog_key in ('state-stamp.parana','state-stamp.rio-de-janeiro','state-stamp.sao-paulo'))<>3 then
    raise exception 'Returned state stamps were not added to inventory';
  end if;
  if exists(select 1 from public.profile_state_stamp_reservations
    where profile_id='00000000-0000-4000-8000-000000000001' and collected_at is null) then
    raise exception 'Collected state reservations were not settled';
  end if;
  perform public.collect_delivery_reward('30000000-0000-4000-8000-000000000001');
  if (select count(*) from public.inventory_items item join public.reward_items reward on reward.id=item.reward_item_id
      where item.owner_profile_id='00000000-0000-4000-8000-000000000001'
        and reward.catalog_key like 'state-stamp.%')<>3 then
    raise exception 'Repeated collection duplicated state stamps';
  end if;
end $$;

insert into public.deliveries(
  id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,
  origin_latitude,origin_longitude,origin_label_key,destination_latitude,
  destination_longitude,destination_label_key,distance_km,animal_speed_kmh,
  outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed
) values(
  '30000000-0000-4000-8000-000000000002',
  '00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000401',
  -25.4284,-49.2733,'locations.curitiba',-22.9068,-43.1729,'locations.rioDeJaneiro',
  680,62,now(),now()+interval '2 hours',now()+interval '3 hours',now()+interval '5 hours',
  'outbound','state-stamp-no-farming-test'
);

do $$ begin
  if exists(select 1 from public.delivery_route_discoveries discovery
    join public.reward_items reward on reward.id=discovery.reward_item_id
    where discovery.delivery_id='30000000-0000-4000-8000-000000000002'
      and reward.catalog_key like 'state-stamp.%') then
    raise exception 'Owned state stamps were materialized again';
  end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000101',true);

insert into public.deliveries(
  id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,
  origin_latitude,origin_longitude,origin_label_key,destination_latitude,
  destination_longitude,destination_label_key,distance_km,animal_speed_kmh,
  outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,is_tutorial
) values(
  '30000000-0000-4000-8000-000000000003',
  '00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000204','00000000-0000-4000-8000-000000000401',
  -25.4284,-49.2733,'locations.curitiba',-22.9068,-43.1729,'locations.rioDeJaneiro',
  680,62,now(),now()+interval '2 hours',now()+interval '3 hours',now()+interval '5 hours',
  'outbound','state-stamp-tutorial-exclusion',true
);

do $$ begin
  if exists(select 1 from public.profile_state_stamp_reservations
    where delivery_id='30000000-0000-4000-8000-000000000003') then
    raise exception 'Tutorial delivery reserved state stamps';
  end if;
end $$;

rollback;
