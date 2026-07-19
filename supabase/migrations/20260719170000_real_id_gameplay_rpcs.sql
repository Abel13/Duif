drop function if exists public.create_delivery_from_selection(text, text, text, jsonb);
drop function if exists public.collect_delivery_reward(text);
drop function if exists public.get_accepted_friend_profiles();

create or replace function public.get_accepted_friend_profiles()
returns table (
  profile_id uuid, display_name text, postal_base_city text, postal_base_state text,
  postal_base_country text, friendship_level integer, exchange_count integer, favorite_note_key text
)
language plpgsql security definer set search_path = public, auth as $$
declare current_profile_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  select id into current_profile_id from public.profiles where auth_user_id = auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode = '28000'; end if;
  return query select
    friend_profile.id, friend_profile.display_name, friend_profile.postal_base_city,
    friend_profile.postal_base_state, friend_profile.postal_base_country,
    friendship.friendship_level, friendship.exchange_count, friendship.favorite_note_key
  from public.friendships friendship
  join public.profiles friend_profile on friend_profile.id = case
    when friendship.requester_profile_id = current_profile_id then friendship.addressee_profile_id
    else friendship.requester_profile_id end
  where friendship.status = 'accepted'
    and current_profile_id in (friendship.requester_profile_id, friendship.addressee_profile_id);
end;
$$;
revoke all on function public.get_accepted_friend_profiles() from public;
grant execute on function public.get_accepted_friend_profiles() to authenticated;

create or replace function public.create_delivery_from_selection(
  mascot_id uuid, friend_profile_id uuid, correspondence_catalog_key text, content_payload jsonb
)
returns public.deliveries language plpgsql security definer set search_path = public, auth as $$
declare
  current_profile public.profiles;
  selected_friend public.profiles;
  selected_mascot public.player_mascots;
  selected_correspondence public.correspondence_options;
  inserted_delivery public.deliveries;
  distance_value numeric(10,2);
  speed_value numeric(10,2);
  outbound_start timestamptz := now();
  payload_type text := content_payload ->> 'type';
  sticker_ids_value text[] := array[]::text[];
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if content_payload is null or jsonb_typeof(content_payload) <> 'object' then
    raise exception 'Invalid correspondence content' using errcode = '22023';
  end if;
  select * into current_profile from public.profiles where auth_user_id = auth.uid();
  if current_profile.id is null then raise exception 'Current profile not found' using errcode = '28000'; end if;
  select * into selected_mascot from public.player_mascots
    where id = mascot_id and owner_profile_id = current_profile.id;
  if selected_mascot.id is null then raise exception 'Mascot not found for current profile' using errcode = '42501'; end if;
  select * into selected_friend from public.profiles where id = friend_profile_id;
  if selected_friend.id is null then raise exception 'Friend profile not found' using errcode = '22023'; end if;
  if not exists (select 1 from public.friendships where status = 'accepted' and
    ((requester_profile_id = current_profile.id and addressee_profile_id = selected_friend.id) or
     (addressee_profile_id = current_profile.id and requester_profile_id = selected_friend.id))) then
    raise exception 'Friendship not accepted' using errcode = '42501';
  end if;
  select * into selected_correspondence from public.correspondence_options
    where catalog_key = correspondence_catalog_key and status = 'active';
  if selected_correspondence.id is null or payload_type is distinct from selected_correspondence.type::text then
    raise exception 'Correspondence option not available' using errcode = '22023';
  end if;
  if selected_correspondence.type = 'letter' and
    (nullif(btrim(content_payload ->> 'letterText'), '') is null or char_length(btrim(content_payload ->> 'letterText')) > 500) then
    raise exception 'Letter text must be between 1 and 500 characters' using errcode = '22023';
  elsif selected_correspondence.type = 'postcard' and
    ((content_payload ->> 'postcardVariant') not in ('city','event','photo') or char_length(coalesce(content_payload ->> 'postcardMessage','')) > 180) then
    raise exception 'Invalid postcard content' using errcode = '22023';
  elsif selected_correspondence.type = 'sticker' then
    if jsonb_typeof(content_payload -> 'stickerIds') <> 'array' then raise exception 'Invalid sticker content' using errcode = '22023'; end if;
    select coalesce(array_agg(value), array[]::text[]) into sticker_ids_value
      from jsonb_array_elements_text(content_payload -> 'stickerIds') value;
    if cardinality(sticker_ids_value) not between 1 and 3 then raise exception 'Invalid sticker count' using errcode = '22023'; end if;
  elsif selected_correspondence.type = 'smallGift' and char_length(coalesce(content_payload ->> 'giftNote','')) > 180 then
    raise exception 'Gift note must be 180 characters or less' using errcode = '22023';
  end if;
  distance_value := round((6371 * 2 * asin(least(1, sqrt(
    power(sin(radians((selected_friend.home_latitude-current_profile.home_latitude)/2)),2) +
    cos(radians(current_profile.home_latitude))*cos(radians(selected_friend.home_latitude))*
    power(sin(radians((selected_friend.home_longitude-current_profile.home_longitude)/2)),2)
  ))))::numeric, 2);
  speed_value := (28 + coalesce((selected_mascot.attributes->>'speed')::numeric,0)*4 +
    coalesce((selected_mascot.attributes->>'stamina')::numeric,0)*2)::numeric(10,2);
  insert into public.deliveries (
    id, sender_profile_id, receiver_profile_id, mascot_id, correspondence_option_id,
    origin_latitude, origin_longitude, origin_label_key, destination_latitude,
    destination_longitude, destination_label_key, distance_km, animal_speed_kmh,
    outbound_start_at, outbound_arrival_at, return_start_at, return_arrival_at, status, reward_seed
  ) values (
    gen_random_uuid(), current_profile.id, selected_friend.id, selected_mascot.id, selected_correspondence.id,
    current_profile.home_latitude, current_profile.home_longitude, current_profile.home_label_key,
    selected_friend.home_latitude, selected_friend.home_longitude, selected_friend.home_label_key,
    distance_value, speed_value, outbound_start,
    outbound_start + ((distance_value/speed_value)*interval '1 hour'),
    outbound_start + ((distance_value/speed_value)*interval '1 hour') + interval '30 minutes',
    outbound_start + ((distance_value/speed_value)*interval '2 hours') + interval '30 minutes',
    'outbound', concat(selected_mascot.id, '-', selected_friend.id, '-', selected_correspondence.catalog_key)
  ) returning * into inserted_delivery;
  insert into public.delivery_correspondence_contents (
    id, delivery_id, correspondence_type, letter_text, postcard_message, postcard_variant,
    sticker_ids, gift_note, metadata
  ) values (
    gen_random_uuid(), inserted_delivery.id, selected_correspondence.type,
    case when selected_correspondence.type='letter' then btrim(content_payload->>'letterText') end,
    case when selected_correspondence.type='postcard' then nullif(btrim(content_payload->>'postcardMessage'),'') end,
    case when selected_correspondence.type='postcard' then content_payload->>'postcardVariant' end,
    case when selected_correspondence.type='sticker' then sticker_ids_value else array[]::text[] end,
    case when selected_correspondence.type='smallGift' then nullif(btrim(content_payload->>'giftNote'),'') end,
    jsonb_build_object('createdBy','create_delivery_from_selection')
  );
  return inserted_delivery;
end;
$$;
revoke all on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) from public;
grant execute on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) to authenticated;

create or replace function public.materialize_delivery_route_discoveries()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  point_record public.route_reward_points;
  reference_latitude double precision; origin_x double precision; origin_y double precision;
  destination_x double precision; destination_y double precision; point_x double precision; point_y double precision;
  route_x double precision; route_y double precision; route_length_squared double precision;
  route_progress_value double precision; closest_x double precision; closest_y double precision; distance_value double precision;
  radius_multiplier double precision := coalesce((new.travel_modifiers->>'discoveryRadiusMultiplier')::double precision,1);
  earth_radius_km constant double precision := 6371;
begin
  for point_record in select * from public.route_reward_points where status='active' order by sort_order,id loop
    reference_latitude:=radians((new.origin_latitude+new.destination_latitude+point_record.latitude)/3);
    origin_x:=earth_radius_km*radians(new.origin_longitude)*cos(reference_latitude); origin_y:=earth_radius_km*radians(new.origin_latitude);
    destination_x:=earth_radius_km*radians(new.destination_longitude)*cos(reference_latitude); destination_y:=earth_radius_km*radians(new.destination_latitude);
    point_x:=earth_radius_km*radians(point_record.longitude)*cos(reference_latitude); point_y:=earth_radius_km*radians(point_record.latitude);
    route_x:=destination_x-origin_x; route_y:=destination_y-origin_y; route_length_squared:=route_x*route_x+route_y*route_y;
    if route_length_squared<=0 then route_progress_value:=0; distance_value:=sqrt(power(point_x-origin_x,2)+power(point_y-origin_y,2));
    else route_progress_value:=least(1,greatest(0,((point_x-origin_x)*route_x+(point_y-origin_y)*route_y)/route_length_squared));
      closest_x:=origin_x+route_x*route_progress_value; closest_y:=origin_y+route_y*route_progress_value;
      distance_value:=sqrt(power(point_x-closest_x,2)+power(point_y-closest_y,2)); end if;
    if distance_value<=point_record.eligibility_radius_km*greatest(1,radius_multiplier) then
      insert into public.delivery_route_discoveries(id,delivery_id,route_reward_point_id,reward_item_id,route_progress,distance_from_route_km)
      values(gen_random_uuid(),new.id,point_record.id,point_record.reward_item_id,round(route_progress_value::numeric,6),round(distance_value::numeric,4))
      on conflict(delivery_id,route_reward_point_id) do nothing; end if;
  end loop;
  update public.deliveries set route_discovery_version=1 where id=new.id;
  return new;
end;
$$;

create or replace function public.collect_delivery_reward(delivery_id uuid)
returns jsonb language plpgsql security definer set search_path = public, auth as $$
declare
  current_profile public.profiles; selected_delivery public.deliveries; selected_reward public.delivery_rewards;
  selected_reward_item public.reward_items; primary_inventory_item public.inventory_items;
  route_inventory_item public.inventory_items; discovery_record record; route_inventory_items jsonb := '[]'::jsonb;
  seed_total integer:=0; reward_count integer; reward_offset integer; character_index integer;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select * into current_profile from public.profiles where auth_user_id=auth.uid();
  select * into selected_delivery from public.deliveries where id=delivery_id for update;
  if selected_delivery.id is null then raise exception 'Delivery not found' using errcode='22023'; end if;
  if current_profile.id is distinct from selected_delivery.sender_profile_id then raise exception 'Only the mascot owner may collect' using errcode='42501'; end if;
  if selected_delivery.status not in ('returned','completed') and
    (selected_delivery.return_arrival_at is null or selected_delivery.return_arrival_at>now()) then
    raise exception 'Delivery has not returned yet' using errcode='22023'; end if;
  select reward.* into selected_reward
  from public.delivery_rewards as reward
  where reward.delivery_id = selected_delivery.id;
  if selected_reward.id is null then
    for character_index in 1..length(selected_delivery.reward_seed) loop seed_total:=seed_total+ascii(substr(selected_delivery.reward_seed,character_index,1)); end loop;
    select count(*) into reward_count from public.reward_items where status='active' and catalog_key in
      ('reward-worn-route-stamp','reward-blue-airmail-label','reward-golden-compass-pin');
    if reward_count=0 then raise exception 'Reward catalog is empty' using errcode='22023'; end if;
    reward_offset:=seed_total%reward_count;
    select * into selected_reward_item from public.reward_items where status='active' and catalog_key in
      ('reward-worn-route-stamp','reward-blue-airmail-label','reward-golden-compass-pin') order by id offset reward_offset limit 1;
    insert into public.delivery_rewards(id,delivery_id,reward_item_id,xp_gained,collected_at)
      values(gen_random_uuid(),selected_delivery.id,selected_reward_item.id,24+(seed_total%28),now()) returning * into selected_reward;
  else
    select * into selected_reward_item from public.reward_items where id=selected_reward.reward_item_id;
    update public.delivery_rewards set collected_at=coalesce(collected_at,now()) where id=selected_reward.id returning * into selected_reward;
  end if;
  insert into public.inventory_items(
    id,owner_profile_id,reward_item_id,delivery_reward_id,name_key,description_key,rarity,category,source_key,thumbnail_asset_path,equipped,collected_at
  ) values(gen_random_uuid(),current_profile.id,selected_reward_item.id,selected_reward.id,selected_reward_item.name_key,
    selected_reward_item.description_key,selected_reward_item.rarity,'keepsakes','inventory.sources.routeReward',selected_reward_item.thumbnail_asset_path,false,selected_reward.collected_at)
  on conflict(delivery_reward_id) do update set collected_at=excluded.collected_at returning * into primary_inventory_item;
  for discovery_record in select d.*,p.inventory_category,i.name_key,i.description_key,i.rarity,i.thumbnail_asset_path
    from public.delivery_route_discoveries d join public.route_reward_points p on p.id=d.route_reward_point_id
    join public.reward_items i on i.id=d.reward_item_id where d.delivery_id=selected_delivery.id order by d.route_progress,d.id loop
    if discovery_record.inventory_item_id is null then
      insert into public.inventory_items(id,owner_profile_id,reward_item_id,name_key,description_key,rarity,category,source_key,thumbnail_asset_path,equipped,collected_at)
      values(gen_random_uuid(),current_profile.id,discovery_record.reward_item_id,discovery_record.name_key,discovery_record.description_key,
        discovery_record.rarity,discovery_record.inventory_category,'inventory.sources.routeReward',discovery_record.thumbnail_asset_path,false,coalesce(discovery_record.collected_at,now()))
      returning * into route_inventory_item;
      update public.delivery_route_discoveries set collected_at=coalesce(collected_at,route_inventory_item.collected_at),inventory_item_id=route_inventory_item.id where id=discovery_record.id;
    end if;
  end loop;
  select coalesce(jsonb_agg(to_jsonb(i) order by d.route_progress),'[]'::jsonb) into route_inventory_items
    from public.delivery_route_discoveries d join public.inventory_items i on i.id=d.inventory_item_id where d.delivery_id=selected_delivery.id;
  update public.deliveries set status='completed',updated_at=now() where id=selected_delivery.id returning * into selected_delivery;
  return jsonb_build_object('delivery',to_jsonb(selected_delivery),'reward',to_jsonb(selected_reward),
    'rewardItem',to_jsonb(selected_reward_item),'inventoryItem',to_jsonb(primary_inventory_item),'routeInventoryItems',route_inventory_items);
end;
$$;
revoke all on function public.collect_delivery_reward(uuid) from public;
grant execute on function public.collect_delivery_reward(uuid) to authenticated;

do $$
declare traffic_definition text;
begin
  select pg_get_functiondef(p.oid) into traffic_definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_nearby_postal_traffic';
  traffic_definition := replace(traffic_definition,
    'owner_profile.mock_key as owner_mock_key',
    'owner_profile.id::text as owner_public_id');
  traffic_definition := replace(traffic_definition,
    'coalesce(v.owner_mock_key, v.sender_profile_id::text)',
    'v.owner_public_id');
  execute traffic_definition;
end;
$$;
