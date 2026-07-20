insert into public.official_translation_keys (translation_key) values
  ('tutorial.rewards.firstRouteStamp.name'), ('tutorial.rewards.firstRouteStamp.description')
on conflict (translation_key) do nothing;

insert into public.reward_items (
  id,catalog_key,name_key,description_key,rarity,thumbnail_asset_key,status
) values (
  '00000000-0000-4000-8000-000000000622','reward-tutorial-first-route-stamp',
  'tutorial.rewards.firstRouteStamp.name','tutorial.rewards.firstRouteStamp.description',
  'common','reward.thumbnail.wornRouteStamp','active'
) on conflict(catalog_key) do update set name_key=excluded.name_key,
  description_key=excluded.description_key,rarity=excluded.rarity,
  thumbnail_asset_key=excluded.thumbnail_asset_key,status=excluded.status;

create or replace function public.use_first_route_stamp_for_tutorial()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  if exists(select 1 from public.deliveries where id=new.delivery_id and is_tutorial) then
    update public.delivery_rewards set reward_item_id='00000000-0000-4000-8000-000000000622'
    where delivery_id=new.id;
  end if;
  return new;
end $$;

create trigger use_first_route_stamp_after_tutorial_delivery
after insert on public.delivery_rewards for each row
when (new.reward_item_id='00000000-0000-4000-8000-000000000601')
execute function public.use_first_route_stamp_for_tutorial();
