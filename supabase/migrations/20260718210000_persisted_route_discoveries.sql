alter table public.deliveries
  add column route_discovery_version smallint;

create table public.route_reward_points (
  id uuid primary key,
  mock_key text not null unique,
  reward_item_id uuid not null references public.reward_items(id),
  latitude double precision not null check (latitude between -90 and 90),
  longitude double precision not null check (longitude between -180 and 180),
  eligibility_radius_km numeric(10, 2) not null check (eligibility_radius_km > 0),
  kind text not null check (kind in ('badge', 'postcard', 'stamp', 'souvenir', 'material', 'eventItem')),
  region_kind text not null check (region_kind in ('city', 'state', 'country', 'event')),
  region_label text not null,
  title_key text not null,
  description_key text not null,
  inventory_category public.inventory_category not null,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.delivery_route_discoveries (
  id uuid primary key,
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  route_reward_point_id uuid not null references public.route_reward_points(id),
  reward_item_id uuid not null references public.reward_items(id),
  route_progress numeric(8, 6) not null check (route_progress between 0 and 1),
  distance_from_route_km numeric(10, 4) not null check (distance_from_route_km >= 0),
  collected_at timestamptz,
  inventory_item_id uuid references public.inventory_items(id),
  created_at timestamptz not null default now(),
  constraint delivery_route_discoveries_delivery_point_unique
    unique (delivery_id, route_reward_point_id)
);

create index delivery_route_discoveries_delivery_id_idx
  on public.delivery_route_discoveries(delivery_id);

alter table public.route_reward_points enable row level security;
alter table public.delivery_route_discoveries enable row level security;

create policy "Route reward points are readable by authenticated players"
  on public.route_reward_points
  for select
  to authenticated
  using (true);

create policy "Route discoveries are readable by delivery participants"
  on public.delivery_route_discoveries
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.deliveries
      join public.profiles
        on profiles.id in (deliveries.sender_profile_id, deliveries.receiver_profile_id)
      where deliveries.id = delivery_route_discoveries.delivery_id
        and profiles.auth_user_id = auth.uid()
    )
  );

insert into public.reward_items (
  id, mock_key, name_key, description_key, rarity, thumbnail_asset_path
) values
  ('00000000-0000-4000-8000-000000000611', 'reward-londrina-postcard', 'map.rewards.londrinaPostcard.name', 'map.rewards.londrinaPostcard.description', 'common', null),
  ('00000000-0000-4000-8000-000000000612', 'reward-cambe-souvenir', 'map.rewards.cambeSouvenir.name', 'map.rewards.cambeSouvenir.description', 'common', null),
  ('00000000-0000-4000-8000-000000000613', 'reward-rolandia-badge', 'map.rewards.rolandiaBadge.name', 'map.rewards.rolandiaBadge.description', 'uncommon', null),
  ('00000000-0000-4000-8000-000000000614', 'reward-arapongas-material', 'map.rewards.arapongasMaterial.name', 'map.rewards.arapongasMaterial.description', 'uncommon', null),
  ('00000000-0000-4000-8000-000000000615', 'reward-apucarana-stamp', 'map.rewards.apucaranaStamp.name', 'map.rewards.apucaranaStamp.description', 'rare', null),
  ('00000000-0000-4000-8000-000000000616', 'reward-maringa-event', 'map.rewards.maringaEvent.name', 'map.rewards.maringaEvent.description', 'rare', null)
on conflict (mock_key) do update set
  name_key = excluded.name_key,
  description_key = excluded.description_key,
  rarity = excluded.rarity,
  thumbnail_asset_path = excluded.thumbnail_asset_path;

insert into public.route_reward_points (
  id, mock_key, reward_item_id, latitude, longitude, eligibility_radius_km,
  kind, region_kind, region_label, title_key, description_key, inventory_category,
  active, sort_order
) values
  ('00000000-0000-4000-8000-000000001001', 'route-reward-londrina-postcard', '00000000-0000-4000-8000-000000000611', -23.3045, -51.1696, 18, 'postcard', 'city', 'Londrina, PR, Brasil', 'map.rewards.londrinaPostcard.name', 'map.rewards.londrinaPostcard.description', 'keepsakes', true, 10),
  ('00000000-0000-4000-8000-000000001002', 'route-reward-cambe-souvenir', '00000000-0000-4000-8000-000000000612', -23.2758, -51.2797, 18, 'souvenir', 'state', 'Cambé, PR, Brasil', 'map.rewards.cambeSouvenir.name', 'map.rewards.cambeSouvenir.description', 'keepsakes', true, 20),
  ('00000000-0000-4000-8000-000000001003', 'route-reward-rolandia-badge', '00000000-0000-4000-8000-000000000613', -23.3103, -51.3692, 18, 'badge', 'country', 'Rolândia, PR, Brasil', 'map.rewards.rolandiaBadge.name', 'map.rewards.rolandiaBadge.description', 'routeMarks', true, 30),
  ('00000000-0000-4000-8000-000000001004', 'route-reward-arapongas-material', '00000000-0000-4000-8000-000000000614', -23.415, -51.4245, 20, 'material', 'country', 'Arapongas, PR, Brasil', 'map.rewards.arapongasMaterial.name', 'map.rewards.arapongasMaterial.description', 'keepsakes', true, 40),
  ('00000000-0000-4000-8000-000000001005', 'route-reward-apucarana-stamp', '00000000-0000-4000-8000-000000000615', -23.5508, -51.4608, 24, 'stamp', 'country', 'Apucarana, PR, Brasil', 'map.rewards.apucaranaStamp.name', 'map.rewards.apucaranaStamp.description', 'stamps', true, 50),
  ('00000000-0000-4000-8000-000000001006', 'route-reward-maringa-event', '00000000-0000-4000-8000-000000000616', -23.4205, -51.9333, 18, 'eventItem', 'event', 'Maringá, PR, Brasil', 'map.rewards.maringaEvent.name', 'map.rewards.maringaEvent.description', 'keepsakes', true, 60)
on conflict (mock_key) do update set
  reward_item_id = excluded.reward_item_id,
  latitude = excluded.latitude,
  longitude = excluded.longitude,
  eligibility_radius_km = excluded.eligibility_radius_km,
  kind = excluded.kind,
  region_kind = excluded.region_kind,
  region_label = excluded.region_label,
  title_key = excluded.title_key,
  description_key = excluded.description_key,
  inventory_category = excluded.inventory_category,
  active = excluded.active,
  sort_order = excluded.sort_order;

create or replace function public.materialize_delivery_route_discoveries()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  point_record public.route_reward_points;
  reference_latitude double precision;
  origin_x double precision;
  origin_y double precision;
  destination_x double precision;
  destination_y double precision;
  point_x double precision;
  point_y double precision;
  route_x double precision;
  route_y double precision;
  route_length_squared double precision;
  raw_progress double precision;
  route_progress_value double precision;
  closest_x double precision;
  closest_y double precision;
  distance_value double precision;
  radius_multiplier double precision := coalesce((new.travel_modifiers ->> 'discoveryRadiusMultiplier')::double precision, 1);
  earth_radius_km constant double precision := 6371;
begin
  for point_record in
    select * from public.route_reward_points where active order by sort_order, id
  loop
    reference_latitude := radians((new.origin_latitude + new.destination_latitude + point_record.latitude) / 3);
    origin_x := earth_radius_km * radians(new.origin_longitude) * cos(reference_latitude);
    origin_y := earth_radius_km * radians(new.origin_latitude);
    destination_x := earth_radius_km * radians(new.destination_longitude) * cos(reference_latitude);
    destination_y := earth_radius_km * radians(new.destination_latitude);
    point_x := earth_radius_km * radians(point_record.longitude) * cos(reference_latitude);
    point_y := earth_radius_km * radians(point_record.latitude);
    route_x := destination_x - origin_x;
    route_y := destination_y - origin_y;
    route_length_squared := route_x * route_x + route_y * route_y;

    if route_length_squared <= 0 then
      route_progress_value := 0;
      distance_value := sqrt(power(point_x - origin_x, 2) + power(point_y - origin_y, 2));
    else
      raw_progress := ((point_x - origin_x) * route_x + (point_y - origin_y) * route_y) / route_length_squared;
      route_progress_value := least(1, greatest(0, raw_progress));
      closest_x := origin_x + route_x * route_progress_value;
      closest_y := origin_y + route_y * route_progress_value;
      distance_value := sqrt(power(point_x - closest_x, 2) + power(point_y - closest_y, 2));
    end if;

    if distance_value <= point_record.eligibility_radius_km * greatest(1, radius_multiplier) then
      insert into public.delivery_route_discoveries (
        id, delivery_id, route_reward_point_id, reward_item_id,
        route_progress, distance_from_route_km
      ) values (
        gen_random_uuid(), new.id, point_record.id, point_record.reward_item_id,
        round(route_progress_value::numeric, 6), round(distance_value::numeric, 4)
      )
      on conflict (delivery_id, route_reward_point_id) do nothing;
    end if;
  end loop;

  update public.deliveries
  set route_discovery_version = 1
  where id = new.id;

  return new;
end;
$$;

create trigger materialize_delivery_route_discoveries_after_insert
after insert on public.deliveries
for each row execute function public.materialize_delivery_route_discoveries();

create or replace function public.collect_delivery_reward(delivery_public_id text)
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_auth_user_id uuid := auth.uid();
  current_profile public.profiles;
  selected_delivery public.deliveries;
  selected_reward public.delivery_rewards;
  selected_reward_item public.reward_items;
  primary_inventory_item public.inventory_items;
  route_inventory_item public.inventory_items;
  discovery_record record;
  route_inventory_items jsonb := '[]'::jsonb;
  seed_total integer := 0;
  reward_count integer := 0;
  reward_offset integer := 0;
  character_index integer;
begin
  if current_auth_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into current_profile
  from public.profiles
  where auth_user_id = current_auth_user_id;

  if current_profile.id is null then
    raise exception 'Current profile not found' using errcode = '28000';
  end if;

  select * into selected_delivery
  from public.deliveries
  where mock_key = delivery_public_id or id::text = delivery_public_id
  limit 1
  for update;

  if selected_delivery.id is null then
    raise exception 'Delivery not found' using errcode = '22023';
  end if;

  if current_profile.id <> selected_delivery.sender_profile_id then
    raise exception 'Only the mascot owner may collect this delivery' using errcode = '42501';
  end if;

  if selected_delivery.status not in ('returned', 'completed')
    and (selected_delivery.return_arrival_at is null or selected_delivery.return_arrival_at > now())
  then
    raise exception 'Delivery has not returned yet' using errcode = '22023';
  end if;

  select * into selected_reward
  from public.delivery_rewards
  where delivery_id = selected_delivery.id;

  if selected_reward.id is null then
    for character_index in 1..length(selected_delivery.reward_seed) loop
      seed_total := seed_total + ascii(substr(selected_delivery.reward_seed, character_index, 1));
    end loop;

    select count(*)::integer into reward_count
    from public.reward_items
    where mock_key in (
      'reward-worn-route-stamp',
      'reward-blue-airmail-label',
      'reward-golden-compass-pin'
    );
    if reward_count <= 0 then
      raise exception 'Reward catalog is empty' using errcode = '22023';
    end if;
    reward_offset := seed_total % reward_count;

    select * into selected_reward_item
    from public.reward_items
    where mock_key in (
      'reward-worn-route-stamp',
      'reward-blue-airmail-label',
      'reward-golden-compass-pin'
    )
    order by id offset reward_offset limit 1;

    insert into public.delivery_rewards (
      id, mock_key, delivery_id, reward_item_id, xp_gained, collected_at
    ) values (
      gen_random_uuid(), concat('reward-', coalesce(selected_delivery.mock_key, selected_delivery.id::text)),
      selected_delivery.id, selected_reward_item.id, 24 + (seed_total % 28), now()
    ) returning * into selected_reward;
  else
    select * into selected_reward_item
    from public.reward_items where id = selected_reward.reward_item_id;

    if selected_reward.collected_at is null then
      update public.delivery_rewards set collected_at = now()
      where id = selected_reward.id returning * into selected_reward;
    end if;
  end if;

  if selected_reward_item.id is null then
    raise exception 'Reward item not found' using errcode = '22023';
  end if;

  insert into public.inventory_items (
    id, owner_profile_id, reward_item_id, mock_key, name_key, description_key,
    rarity, category, source_key, thumbnail_asset_path, equipped, collected_at
  ) values (
    gen_random_uuid(), current_profile.id, selected_reward_item.id,
    concat('inventory-', selected_reward.mock_key), selected_reward_item.name_key,
    selected_reward_item.description_key, selected_reward_item.rarity, 'keepsakes',
    'inventory.sources.routeReward', selected_reward_item.thumbnail_asset_path, false,
    coalesce(selected_reward.collected_at, now())
  ) on conflict (mock_key) do update set collected_at = excluded.collected_at
  returning * into primary_inventory_item;

  for discovery_record in
    select
      discovery.id as discovery_id,
      discovery.collected_at as discovery_collected_at,
      point.inventory_category,
      item.id as route_reward_item_id,
      item.name_key,
      item.description_key,
      item.rarity,
      item.thumbnail_asset_path
    from public.delivery_route_discoveries discovery
    join public.route_reward_points point on point.id = discovery.route_reward_point_id
    join public.reward_items item on item.id = discovery.reward_item_id
    where discovery.delivery_id = selected_delivery.id
    order by discovery.route_progress, discovery.id
  loop
    insert into public.inventory_items (
      id, owner_profile_id, reward_item_id, mock_key, name_key, description_key,
      rarity, category, source_key, thumbnail_asset_path, equipped, collected_at
    ) values (
      gen_random_uuid(), current_profile.id, discovery_record.route_reward_item_id,
      concat('inventory-route-discovery-', discovery_record.discovery_id),
      discovery_record.name_key, discovery_record.description_key,
      discovery_record.rarity, discovery_record.inventory_category,
      'inventory.sources.routeReward', discovery_record.thumbnail_asset_path, false,
      coalesce(discovery_record.discovery_collected_at, now())
    ) on conflict (mock_key) do update set collected_at = excluded.collected_at
    returning * into route_inventory_item;

    update public.delivery_route_discoveries
    set collected_at = coalesce(collected_at, route_inventory_item.collected_at),
        inventory_item_id = route_inventory_item.id
    where id = discovery_record.discovery_id;
  end loop;

  select coalesce(jsonb_agg(to_jsonb(inventory_item) order by discovery.route_progress), '[]'::jsonb)
  into route_inventory_items
  from public.delivery_route_discoveries discovery
  join public.inventory_items inventory_item on inventory_item.id = discovery.inventory_item_id
  where discovery.delivery_id = selected_delivery.id;

  update public.deliveries
  set status = 'completed', updated_at = now()
  where id = selected_delivery.id
  returning * into selected_delivery;

  return jsonb_build_object(
    'delivery', to_jsonb(selected_delivery),
    'reward', to_jsonb(selected_reward),
    'rewardItem', to_jsonb(selected_reward_item),
    'inventoryItem', to_jsonb(primary_inventory_item),
    'routeInventoryItems', route_inventory_items
  );
end;
$$;

revoke all on function public.materialize_delivery_route_discoveries() from public;
revoke all on function public.collect_delivery_reward(text) from public;
grant execute on function public.collect_delivery_reward(text) to authenticated;
