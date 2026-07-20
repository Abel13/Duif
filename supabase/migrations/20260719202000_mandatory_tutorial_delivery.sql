create type public.tutorial_instruction_step as enum (
  'preparing', 'outbound', 'discovery', 'destination', 'returning', 'returned', 'collection'
);

alter table public.deliveries add column is_tutorial boolean not null default false;
create unique index deliveries_one_tutorial_per_sender_idx
  on public.deliveries(sender_profile_id) where is_tutorial;

alter table public.account_onboarding
  add column tutorial_delivery_id uuid references public.deliveries(id),
  add column tutorial_instruction_step public.tutorial_instruction_step,
  add column tutorial_collected_at timestamptz;

insert into public.official_translation_keys (translation_key) values
  ('tutorial.locations.nest'), ('tutorial.locations.station'), ('tutorial.locations.route'),
  ('tutorial.rewards.inauguralPostcard.name'), ('tutorial.rewards.inauguralPostcard.description')
on conflict (translation_key) do nothing;

insert into public.reward_items (
  id, catalog_key, name_key, description_key, rarity, thumbnail_asset_key, status
) values (
  '00000000-0000-4000-8000-000000000621', 'reward-tutorial-inaugural-postcard',
  'tutorial.rewards.inauguralPostcard.name', 'tutorial.rewards.inauguralPostcard.description',
  'common', 'shop.thumbnail.coastalTownPostcard', 'active'
) on conflict (catalog_key) do update set
  name_key=excluded.name_key, description_key=excluded.description_key,
  rarity=excluded.rarity, thumbnail_asset_key=excluded.thumbnail_asset_key, status=excluded.status;

insert into public.route_reward_points (
  id, catalog_key, reward_item_id, latitude, longitude, eligibility_radius_km,
  kind, region_kind, region_label_key, title_key, description_key,
  inventory_category, status, sort_order
) values (
  '00000000-0000-4000-8000-000000000721', 'route-tutorial-inaugural-postcard',
  '00000000-0000-4000-8000-000000000621', -23.30725, -51.13980, 2,
  'postcard', 'event', 'tutorial.locations.route',
  'tutorial.rewards.inauguralPostcard.name', 'tutorial.rewards.inauguralPostcard.description',
  'keepsakes', 'active', -100
) on conflict (catalog_key) do update set
  reward_item_id=excluded.reward_item_id, latitude=excluded.latitude, longitude=excluded.longitude,
  eligibility_radius_km=excluded.eligibility_radius_km, kind=excluded.kind,
  region_kind=excluded.region_kind, region_label_key=excluded.region_label_key,
  title_key=excluded.title_key, description_key=excluded.description_key,
  inventory_category=excluded.inventory_category, status=excluded.status, sort_order=excluded.sort_order;

create or replace function public.start_or_resume_tutorial_delivery()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare
  current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding;
  profile_record public.profiles; mascot_record public.player_mascots; delivery_record public.deliveries;
  reward_record public.delivery_rewards; started_at timestamptz:=clock_timestamp();
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
  if onboarding_record.auth_user_id is null or onboarding_record.stage<>'tutorial' then raise exception 'Tutorial is not available' using errcode='22023'; end if;
  select * into strict profile_record from public.profiles where auth_user_id=current_user_id;
  select * into strict mascot_record from public.player_mascots where owner_profile_id=profile_record.id and is_starter;

  if onboarding_record.tutorial_delivery_id is not null then
    select * into strict delivery_record from public.deliveries where id=onboarding_record.tutorial_delivery_id;
    return jsonb_build_object('onboarding',to_jsonb(onboarding_record),'delivery',to_jsonb(delivery_record),'mascot',to_jsonb(mascot_record));
  end if;

  insert into public.deliveries (
    id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,
    origin_label_key,destination_latitude,destination_longitude,destination_label_key,
    distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,
    return_arrival_at,status,reward_seed,travel_modifiers,route_discovery_version,is_tutorial,created_at
  ) values (
    gen_random_uuid(),profile_record.id,profile_record.id,mascot_record.id,-23.3045,-51.1696,
    'tutorial.locations.nest',-23.3100,-51.1100,'tutorial.locations.station',6.15,60,
    started_at+interval '1 minute',started_at+interval '8 minutes',started_at+interval '9 minutes',
    started_at+interval '16 minutes','preparing','tutorial-first-route',
    jsonb_build_object('version',1,'preparationMinutes',1,'outboundSpeedMultiplier',1,
      'returnSpeedMultiplier',1,'discoveryRadiusMultiplier',1,'rarityWeightMultiplier',1,
      'longRouteConsistency',1,'isLongRoute',false),1,true,started_at
  ) returning * into delivery_record;

  delete from public.delivery_route_discoveries where delivery_id=delivery_record.id;
  insert into public.delivery_route_discoveries (
    id,delivery_id,route_reward_point_id,reward_item_id,route_progress,distance_from_route_km
  ) values (
    gen_random_uuid(),delivery_record.id,'00000000-0000-4000-8000-000000000721',
    '00000000-0000-4000-8000-000000000621',0.5,0
  );
  insert into public.delivery_rewards(id,delivery_id,reward_item_id,xp_gained)
  select gen_random_uuid(),delivery_record.id,id,0 from public.reward_items
  where catalog_key='reward-tutorial-first-route-stamp' returning * into reward_record;
  update public.account_onboarding set tutorial_delivery_id=delivery_record.id,updated_at=now()
  where auth_user_id=current_user_id returning * into onboarding_record;
  return jsonb_build_object('onboarding',to_jsonb(onboarding_record),'delivery',to_jsonb(delivery_record),'mascot',to_jsonb(mascot_record));
end; $$;

create or replace function public.acknowledge_tutorial_instruction(requested_step public.tutorial_instruction_step)
returns public.account_onboarding language plpgsql security definer set search_path=public,auth as $$
declare
  current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding;
  delivery_record public.deliveries; allowed_step public.tutorial_instruction_step; available_at timestamptz;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
  if onboarding_record.auth_user_id is null or onboarding_record.stage<>'tutorial' or onboarding_record.tutorial_delivery_id is null then
    raise exception 'Tutorial delivery is not active' using errcode='22023'; end if;
  if onboarding_record.tutorial_instruction_step=requested_step then return onboarding_record; end if;
  select * into strict delivery_record from public.deliveries where id=onboarding_record.tutorial_delivery_id and is_tutorial;
  if onboarding_record.tutorial_instruction_step is null then allowed_step:='preparing';
  else allowed_step:=case onboarding_record.tutorial_instruction_step
    when 'preparing' then 'outbound'::public.tutorial_instruction_step
    when 'outbound' then 'discovery'::public.tutorial_instruction_step
    when 'discovery' then 'destination'::public.tutorial_instruction_step
    when 'destination' then 'returning'::public.tutorial_instruction_step
    when 'returning' then 'returned'::public.tutorial_instruction_step
    when 'returned' then 'collection'::public.tutorial_instruction_step else null end; end if;
  if requested_step is distinct from allowed_step then raise exception 'Invalid tutorial instruction transition' using errcode='22023'; end if;
  available_at:=case requested_step
    when 'preparing' then delivery_record.created_at
    when 'outbound' then delivery_record.outbound_start_at
    when 'discovery' then delivery_record.outbound_start_at+(delivery_record.outbound_arrival_at-delivery_record.outbound_start_at)/2
    when 'destination' then delivery_record.outbound_arrival_at
    when 'returning' then delivery_record.return_start_at
    when 'returned' then delivery_record.return_arrival_at
    when 'collection' then delivery_record.return_arrival_at end;
  if clock_timestamp()<available_at then raise exception 'Tutorial instruction is not available yet' using errcode='22023'; end if;
  update public.account_onboarding set tutorial_instruction_step=requested_step,updated_at=now()
  where auth_user_id=current_user_id returning * into onboarding_record;
  return onboarding_record;
end; $$;

create or replace function public.collect_tutorial_delivery()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare
  current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding;
  profile_record public.profiles; delivery_record public.deliveries; reward_record public.delivery_rewards;
  primary_item public.inventory_items; route_item public.inventory_items; discovery_record public.delivery_route_discoveries;
  primary_reward public.reward_items; route_reward public.reward_items;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
  if onboarding_record.auth_user_id is null then raise exception 'Tutorial is not available' using errcode='22023'; end if;
  if onboarding_record.stage='nestSetup' and onboarding_record.tutorial_collected_at is not null then
    select * into strict delivery_record from public.deliveries where id=onboarding_record.tutorial_delivery_id;
    select * into strict reward_record from public.delivery_rewards where delivery_id=delivery_record.id;
    select * into strict primary_item from public.inventory_items where delivery_reward_id=reward_record.id;
    select * into strict discovery_record from public.delivery_route_discoveries where delivery_id=delivery_record.id;
    select * into strict route_item from public.inventory_items where id=discovery_record.inventory_item_id;
    return jsonb_build_object('onboarding',to_jsonb(onboarding_record),'delivery',to_jsonb(delivery_record),'primaryInventoryItem',to_jsonb(primary_item),'routeInventoryItem',to_jsonb(route_item));
  end if;
  if onboarding_record.stage<>'tutorial' or onboarding_record.tutorial_instruction_step<>'collection' then
    raise exception 'Tutorial instructions are incomplete' using errcode='22023'; end if;
  select * into strict profile_record from public.profiles where auth_user_id=current_user_id;
  select * into strict delivery_record from public.deliveries where id=onboarding_record.tutorial_delivery_id and is_tutorial for update;
  if clock_timestamp()<delivery_record.return_arrival_at then raise exception 'Tutorial delivery has not returned' using errcode='22023'; end if;
  select * into strict reward_record from public.delivery_rewards where delivery_id=delivery_record.id;
  select * into strict primary_reward from public.reward_items where id=reward_record.reward_item_id;
  select * into strict discovery_record from public.delivery_route_discoveries where delivery_id=delivery_record.id;
  select * into strict route_reward from public.reward_items where id=discovery_record.reward_item_id;
  insert into public.inventory_items(id,owner_profile_id,reward_item_id,delivery_reward_id,name_key,description_key,rarity,category,source_key,thumbnail_asset_key,equipped)
  values(gen_random_uuid(),profile_record.id,primary_reward.id,reward_record.id,primary_reward.name_key,primary_reward.description_key,primary_reward.rarity,'stamps','inventory.sources.routeReward',primary_reward.thumbnail_asset_key,false)
  on conflict(delivery_reward_id) do update set collected_at=public.inventory_items.collected_at returning * into primary_item;
  if discovery_record.inventory_item_id is null then
    insert into public.inventory_items(id,owner_profile_id,reward_item_id,name_key,description_key,rarity,category,source_key,thumbnail_asset_key,equipped)
    values(gen_random_uuid(),profile_record.id,route_reward.id,route_reward.name_key,route_reward.description_key,route_reward.rarity,'keepsakes','inventory.sources.routeReward',route_reward.thumbnail_asset_key,false)
    returning * into route_item;
    update public.delivery_route_discoveries set collected_at=route_item.collected_at,inventory_item_id=route_item.id
    where id=discovery_record.id;
  else select * into strict route_item from public.inventory_items where id=discovery_record.inventory_item_id; end if;
  update public.delivery_rewards set collected_at=coalesce(collected_at,now()) where id=reward_record.id;
  update public.deliveries set status='completed',updated_at=now() where id=delivery_record.id returning * into delivery_record;
  update public.account_onboarding set stage='nestSetup',tutorial_collected_at=coalesce(tutorial_collected_at,now()),updated_at=now()
  where auth_user_id=current_user_id returning * into onboarding_record;
  return jsonb_build_object('onboarding',to_jsonb(onboarding_record),'delivery',to_jsonb(delivery_record),'primaryInventoryItem',to_jsonb(primary_item),'routeInventoryItem',to_jsonb(route_item));
end; $$;

revoke all on function public.start_or_resume_tutorial_delivery() from public;
revoke all on function public.acknowledge_tutorial_instruction(public.tutorial_instruction_step) from public;
revoke all on function public.collect_tutorial_delivery() from public;
grant execute on function public.start_or_resume_tutorial_delivery() to authenticated;
grant execute on function public.acknowledge_tutorial_instruction(public.tutorial_instruction_step) to authenticated;
grant execute on function public.collect_tutorial_delivery() to authenticated;

do $$ declare definition text; begin
  select pg_get_functiondef(p.oid) into definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='collect_delivery_reward' and pg_get_function_identity_arguments(p.oid)='delivery_id uuid';
  definition:=replace(definition,
    'if selected_delivery.id is null then raise exception ''Delivery not found'' using errcode=''22023''; end if;',
    'if selected_delivery.id is null then raise exception ''Delivery not found'' using errcode=''22023''; end if; if selected_delivery.is_tutorial then raise exception ''Tutorial delivery requires tutorial collection'' using errcode=''22023''; end if;');
  execute definition;
end $$;

do $$ declare definition text; begin
  select pg_get_functiondef(p.oid) into definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='advance_account_onboarding';
  definition:=replace(definition,'when ''tutorial'' then ''nestSetup''::public.onboarding_stage','');
  execute definition;
end $$;
