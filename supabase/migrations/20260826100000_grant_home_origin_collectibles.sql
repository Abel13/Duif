-- Grant the active postcard and Brazilian state stamp for a completed player's
-- canonical home nest. The operation is backend-authoritative and idempotent.

insert into public.official_translation_keys(translation_key)
values ('inventory.sources.homeNest')
on conflict do nothing;

create or replace function public.grant_home_origin_collectibles(
  target_profile_id uuid,
  granted_at timestamptz default now()
)
returns jsonb
language plpgsql
security definer
set search_path=public,extensions,pg_temp
as $$
declare
  selected_profile public.profiles;
  selected_city public.geonames_cities;
  selected_boundary public.brazil_state_boundaries;
  selected_reward public.reward_items;
  postcard_key text;
  postcard_count integer:=0;
  stamp_count integer:=0;
begin
  perform pg_advisory_xact_lock(hashtextextended(target_profile_id::text,0));

  select profile.* into selected_profile
  from public.profiles profile
  join public.account_onboarding onboarding
    on onboarding.auth_user_id=profile.auth_user_id
  where profile.id=target_profile_id
    and onboarding.stage='completed';
  if selected_profile.id is null or selected_profile.home_city_geoname_id is null then
    return jsonb_build_object('postcardsGranted',0,'stateStampsGranted',0);
  end if;

  select city.* into selected_city
  from public.geonames_cities city
  where city.geoname_id=selected_profile.home_city_geoname_id
    and city.is_active;
  if selected_city.geoname_id is null then
    return jsonb_build_object('postcardsGranted',0,'stateStampsGranted',0);
  end if;

  select catalog.postcard_catalog_key into postcard_key
  from public.city_postcard_catalog catalog
  join public.official_postcards postcard
    on postcard.catalog_key=catalog.postcard_catalog_key
   and postcard.status='active'
  where catalog.geoname_id=selected_city.geoname_id
    and catalog.active;

  if postcard_key is not null then
    insert into public.profile_postcard_unlocks(
      profile_id,postcard_catalog_key,source,unlocked_at
    ) values(
      selected_profile.id,postcard_key,'home-nest',coalesce(granted_at,now())
    )
    on conflict(profile_id,postcard_catalog_key) do nothing;
    get diagnostics postcard_count=row_count;
  end if;

  if selected_city.country_code='BR'
    and selected_profile.home_latitude is not null
    and selected_profile.home_longitude is not null then
    select boundary.* into selected_boundary
    from public.brazil_state_boundaries boundary
    where boundary.active
      and st_covers(
        boundary.geometry,
        st_setsrid(st_makepoint(selected_profile.home_longitude,selected_profile.home_latitude),4326)
      )
    order by boundary.state_code
    limit 1;

    if selected_boundary.state_code is not null then
      select reward.* into selected_reward
      from public.reward_items reward
      where reward.id=selected_boundary.reward_item_id
        and reward.status='active';

      if selected_reward.id is not null and not exists(
        select 1 from public.inventory_items inventory
        where inventory.owner_profile_id=selected_profile.id
          and inventory.reward_item_id=selected_reward.id
      ) then
        insert into public.inventory_items(
          id,owner_profile_id,reward_item_id,name_key,description_key,rarity,
          category,source_key,thumbnail_asset_key,equipped,collected_at
        ) values(
          gen_random_uuid(),selected_profile.id,selected_reward.id,
          selected_reward.name_key,selected_reward.description_key,selected_reward.rarity,
          'stamps','inventory.sources.homeNest',selected_reward.thumbnail_asset_key,
          false,coalesce(granted_at,now())
        );
        stamp_count:=1;
      end if;
    end if;
  end if;

  return jsonb_build_object(
    'postcardsGranted',postcard_count,
    'stateStampsGranted',stamp_count
  );
end
$$;

create or replace function public.grant_home_origin_collectibles_from_onboarding()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
declare selected_profile_id uuid;
begin
  if new.stage<>'completed' then return new; end if;
  select id into selected_profile_id from public.profiles where auth_user_id=new.auth_user_id;
  if selected_profile_id is not null then
    perform public.grant_home_origin_collectibles(
      selected_profile_id,coalesce(new.completed_at,new.updated_at,now())
    );
  end if;
  return new;
end
$$;

create or replace function public.grant_home_origin_collectibles_from_profile()
returns trigger
language plpgsql
security definer
set search_path=public,pg_temp
as $$
begin
  if exists(
    select 1 from public.account_onboarding onboarding
    where onboarding.auth_user_id=new.auth_user_id and onboarding.stage='completed'
  ) then
    perform public.grant_home_origin_collectibles(new.id,now());
  end if;
  return new;
end
$$;

create trigger grant_home_origin_collectibles_after_onboarding
after insert or update on public.account_onboarding
for each row execute function public.grant_home_origin_collectibles_from_onboarding();

create trigger grant_home_origin_collectibles_after_profile
after insert or update on public.profiles
for each row execute function public.grant_home_origin_collectibles_from_profile();

-- A home-origin state stamp is already owned and must not be materialized again
-- when a later route crosses the same state.
create or replace function public.materialize_delivery_state_stamp_discoveries()
returns trigger language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare
  boundary record;
  route geometry;
  crossing geometry;
  entry_point geometry;
  progress double precision;
  discovery_id uuid;
  reserved_count integer;
begin
  if new.is_tutorial then return new; end if;
  route:=st_makeline(
    st_setsrid(st_makepoint(new.origin_longitude,new.origin_latitude),4326),
    st_setsrid(st_makepoint(new.destination_longitude,new.destination_latitude),4326)
  );

  for boundary in
    select * from public.brazil_state_boundaries where active order by state_code
  loop
    crossing:=st_intersection(route,boundary.geometry);
    if not st_isempty(crossing) and not exists(
      select 1 from public.inventory_items inventory
      where inventory.owner_profile_id=new.sender_profile_id
        and inventory.reward_item_id=boundary.reward_item_id
    ) then
      select dumped.geom,st_linelocatepoint(route,dumped.geom)
      into entry_point,progress
      from st_dumppoints(crossing) dumped
      order by st_linelocatepoint(route,dumped.geom)
      limit 1;

      insert into public.profile_state_stamp_reservations(
        profile_id,state_code,delivery_id,encountered_at
      ) values(
        new.sender_profile_id,boundary.state_code,new.id,
        new.outbound_start_at+(new.outbound_arrival_at-new.outbound_start_at)*progress
      )
      on conflict(profile_id,state_code) do nothing;
      get diagnostics reserved_count=row_count;

      if reserved_count=1 then
        discovery_id:=gen_random_uuid();
        insert into public.delivery_route_discoveries(
          id,delivery_id,route_reward_point_id,reward_item_id,route_progress,
          distance_from_route_km,encounter_latitude,encounter_longitude
        ) values(
          discovery_id,new.id,boundary.route_reward_point_id,boundary.reward_item_id,
          round(progress::numeric,6),0,st_y(entry_point),st_x(entry_point)
        );
      end if;
    end if;
  end loop;
  return new;
end
$$;

-- Backfill every already completed nest. Repeated migration-safe calls grant nothing twice.
do $$
declare profile_record record;
begin
  for profile_record in
    select profile.id,coalesce(onboarding.completed_at,onboarding.updated_at,now()) as granted_at
    from public.profiles profile
    join public.account_onboarding onboarding on onboarding.auth_user_id=profile.auth_user_id
    where onboarding.stage='completed'
  loop
    perform public.grant_home_origin_collectibles(profile_record.id,profile_record.granted_at);
  end loop;
end
$$;

revoke all on function public.grant_home_origin_collectibles(uuid,timestamptz),
  public.grant_home_origin_collectibles_from_onboarding(),
  public.grant_home_origin_collectibles_from_profile()
from public,anon,authenticated;
