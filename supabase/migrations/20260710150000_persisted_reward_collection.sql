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
  inserted_inventory_item public.inventory_items;
  seed_total integer := 0;
  seed_index integer := 0;
  reward_count integer := 0;
  reward_offset integer := 0;
  character_index integer;
begin
  if current_auth_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select *
  into current_profile
  from public.profiles
  where auth_user_id = current_auth_user_id;

  if current_profile.id is null then
    raise exception 'Current profile not found' using errcode = '28000';
  end if;

  select *
  into selected_delivery
  from public.deliveries
  where mock_key = delivery_public_id
    or id::text = delivery_public_id
  limit 1;

  if selected_delivery.id is null then
    raise exception 'Delivery not found' using errcode = '22023';
  end if;

  if current_profile.id not in (
    selected_delivery.sender_profile_id,
    selected_delivery.receiver_profile_id
  ) then
    raise exception 'Delivery does not belong to current profile' using errcode = '42501';
  end if;

  if selected_delivery.status not in ('returned', 'completed')
    and (
      selected_delivery.return_arrival_at is null
      or selected_delivery.return_arrival_at > now()
    )
  then
    raise exception 'Delivery has not returned yet' using errcode = '22023';
  end if;

  select *
  into selected_reward
  from public.delivery_rewards
  where delivery_id = selected_delivery.id;

  if selected_reward.id is null then
    for character_index in 1..length(selected_delivery.reward_seed) loop
      seed_total := seed_total + ascii(substr(selected_delivery.reward_seed, character_index, 1));
    end loop;

    select count(*)::integer
    into reward_count
    from public.reward_items;

    if reward_count <= 0 then
      raise exception 'Reward catalog is empty' using errcode = '22023';
    end if;

    reward_offset := seed_total % reward_count;

    select *
    into selected_reward_item
    from public.reward_items
    order by id
    offset reward_offset
    limit 1;

    insert into public.delivery_rewards (
      id,
      mock_key,
      delivery_id,
      reward_item_id,
      xp_gained,
      collected_at
    ) values (
      gen_random_uuid(),
      concat('reward-', coalesce(selected_delivery.mock_key, selected_delivery.id::text)),
      selected_delivery.id,
      selected_reward_item.id,
      24 + (seed_total % 28),
      null
    )
    returning * into selected_reward;
  else
    select *
    into selected_reward_item
    from public.reward_items
    where id = selected_reward.reward_item_id;
  end if;

  if selected_reward_item.id is null then
    raise exception 'Reward item not found' using errcode = '22023';
  end if;

  if selected_reward.collected_at is null then
    update public.delivery_rewards
    set collected_at = now()
    where id = selected_reward.id
    returning * into selected_reward;
  end if;

  update public.deliveries
  set status = 'completed',
      updated_at = now()
  where id = selected_delivery.id
  returning * into selected_delivery;

  insert into public.inventory_items (
    id,
    owner_profile_id,
    reward_item_id,
    mock_key,
    name_key,
    description_key,
    rarity,
    category,
    source_key,
    thumbnail_asset_path,
    equipped,
    collected_at
  ) values (
    gen_random_uuid(),
    current_profile.id,
    selected_reward_item.id,
    concat('inventory-', selected_reward.mock_key),
    selected_reward_item.name_key,
    selected_reward_item.description_key,
    selected_reward_item.rarity,
    'keepsakes',
    'inventory.sources.routeReward',
    selected_reward_item.thumbnail_asset_path,
    false,
    coalesce(selected_reward.collected_at, now())
  )
  on conflict (mock_key) do update set
    collected_at = excluded.collected_at
  returning * into inserted_inventory_item;

  return jsonb_build_object(
    'delivery', to_jsonb(selected_delivery),
    'reward', to_jsonb(selected_reward),
    'rewardItem', to_jsonb(selected_reward_item),
    'inventoryItem', to_jsonb(inserted_inventory_item)
  );
end;
$$;

revoke all on function public.collect_delivery_reward(text) from public;
grant execute on function public.collect_delivery_reward(text) to authenticated;
