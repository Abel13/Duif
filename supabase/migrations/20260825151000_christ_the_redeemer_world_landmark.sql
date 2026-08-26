alter table public.deliveries add column if not exists landmark_rules_version smallint;

insert into public.official_translation_keys(translation_key) values
  ('landmarks.christTheRedeemer.name'),
  ('landmarks.christTheRedeemer.description'),
  ('landmarks.christTheRedeemer.alt')
on conflict do nothing;

insert into public.official_assets(asset_key,asset_type)
values ('landmark.christTheRedeemer.artwork','landmarkArtwork')
on conflict (asset_key) do nothing;

insert into public.official_asset_versions(
  asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,
  alt_text_key,is_decorative,author,metadata
)
select id,1,'packaged','active','/assets/landmarks/christ-the-redeemer.webp',
  'image/webp',256,256,12772,'landmarks.christTheRedeemer.alt',false,'DUIF',
  jsonb_build_object('kind','landmarkArtwork','catalogKey','landmark.christ-the-redeemer','artDirection','postalWatercolorSticker')
from public.official_assets a where a.asset_key='landmark.christTheRedeemer.artwork'
and not exists(select 1 from public.official_asset_versions v where v.asset_id=a.id and v.version=1);

create table public.world_landmark_catalog (
  id uuid primary key default gen_random_uuid(),
  catalog_key text not null unique,
  rules_version smallint not null default 1 check (rules_version>0),
  name_key text not null references public.official_translation_keys(translation_key),
  description_key text not null references public.official_translation_keys(translation_key),
  asset_key text not null unique,
  latitude double precision not null check(latitude between -90 and 90),
  longitude double precision not null check(longitude between -180 and 180),
  eligibility_radius_km numeric(8,2) not null check(eligibility_radius_km>0),
  category text not null check(category in ('cultural','architectural','natural')),
  city text not null,
  region text,
  country_code text not null check(country_code ~ '^[A-Z]{2}$'),
  minimum_zoom numeric(4,2) not null default 5,
  icon_size_px integer not null default 56 check(icon_size_px between 24 and 128),
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

insert into public.world_landmark_catalog(
  catalog_key,name_key,description_key,asset_key,latitude,longitude,
  eligibility_radius_km,category,city,region,country_code,minimum_zoom,icon_size_px
) values (
  'landmark.christ-the-redeemer','landmarks.christTheRedeemer.name',
  'landmarks.christTheRedeemer.description','landmark.christTheRedeemer.artwork',
  -22.95192,-43.21049,25,'cultural','Rio de Janeiro','Rio de Janeiro','BR',5,56
);

create table public.delivery_landmark_encounters (
  id uuid primary key default gen_random_uuid(),
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  landmark_id uuid not null references public.world_landmark_catalog(id),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  rules_version smallint not null,
  route_progress numeric(9,8) not null check(route_progress between 0 and 1),
  distance_from_route_km numeric(10,4) not null check(distance_from_route_km>=0),
  encounter_at timestamptz not null,
  unlocked_at timestamptz,
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique(delivery_id,landmark_id)
);
create index delivery_landmark_encounters_due_idx on public.delivery_landmark_encounters(encounter_at) where unlocked_at is null;

create table public.profile_landmark_unlocks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  landmark_id uuid not null references public.world_landmark_catalog(id),
  first_delivery_id uuid not null references public.deliveries(id),
  encounter_id uuid not null references public.delivery_landmark_encounters(id),
  unlocked_at timestamptz not null,
  acknowledged_at timestamptz,
  primary key(profile_id,landmark_id)
);

alter table public.world_landmark_catalog enable row level security;
alter table public.delivery_landmark_encounters enable row level security;
alter table public.profile_landmark_unlocks enable row level security;
create policy "Players read their landmark unlocks" on public.profile_landmark_unlocks for select to authenticated
using(profile_id=(select id from public.profiles where auth_user_id=auth.uid()));
revoke all on public.world_landmark_catalog,public.delivery_landmark_encounters,public.profile_landmark_unlocks from anon,authenticated;
grant select on public.profile_landmark_unlocks to authenticated;

create or replace function public.materialize_delivery_landmark_encounters()
returns trigger language plpgsql security definer set search_path=public,extensions,pg_temp as $$
declare landmark record; route geometry; point geometry; progress double precision; distance_m double precision;
begin
  if new.is_tutorial then return new; end if;
  update public.deliveries set landmark_rules_version=1 where id=new.id;
  route:=st_makeline(st_setsrid(st_makepoint(new.origin_longitude,new.origin_latitude),4326),st_setsrid(st_makepoint(new.destination_longitude,new.destination_latitude),4326));
  for landmark in select * from public.world_landmark_catalog where active and rules_version=1 loop
    point:=st_setsrid(st_makepoint(landmark.longitude,landmark.latitude),4326);
    distance_m:=st_distance(point::geography,st_closestpoint(route,point)::geography);
    if distance_m<=landmark.eligibility_radius_km*1000 then
      progress:=least(1,greatest(0,st_linelocatepoint(route,point)));
      insert into public.delivery_landmark_encounters(delivery_id,landmark_id,owner_profile_id,rules_version,route_progress,distance_from_route_km,encounter_at,snapshot)
      values(new.id,landmark.id,new.sender_profile_id,1,progress,distance_m/1000,
        new.outbound_start_at+(new.outbound_arrival_at-new.outbound_start_at)*progress,
        jsonb_build_object('catalogKey',landmark.catalog_key,'latitude',landmark.latitude,'longitude',landmark.longitude,'eligibilityRadiusKm',landmark.eligibility_radius_km,'rulesVersion',1))
      on conflict(delivery_id,landmark_id) do nothing;
    end if;
  end loop;
  return new;
end $$;
create trigger materialize_delivery_landmarks_after_insert after insert on public.deliveries
for each row execute function public.materialize_delivery_landmark_encounters();

create or replace function public.refresh_pending_landmark_encounters()
returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  if new.outbound_start_at is distinct from old.outbound_start_at or new.outbound_arrival_at is distinct from old.outbound_arrival_at then
    update public.delivery_landmark_encounters e set encounter_at=new.outbound_start_at+(new.outbound_arrival_at-new.outbound_start_at)*e.route_progress
    where e.delivery_id=new.id and e.unlocked_at is null and e.encounter_at>now();
  end if;
  return new;
end $$;
create trigger refresh_pending_landmarks_after_timing_update after update of outbound_start_at,outbound_arrival_at on public.deliveries
for each row execute function public.refresh_pending_landmark_encounters();

create or replace function public.resolve_due_landmark_encounters(reference_time timestamptz default now(), selected_profile_id uuid default null)
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare encounter record; resolved integer:=0;
begin
  for encounter in select e.* from public.delivery_landmark_encounters e join public.deliveries d on d.id=e.delivery_id
    where e.unlocked_at is null and e.encounter_at<=reference_time and reference_time>=d.outbound_start_at
      and (selected_profile_id is null or e.owner_profile_id=selected_profile_id) for update of e skip locked loop
    insert into public.profile_landmark_unlocks(profile_id,landmark_id,first_delivery_id,encounter_id,unlocked_at)
    values(encounter.owner_profile_id,encounter.landmark_id,encounter.delivery_id,encounter.id,encounter.encounter_at)
    on conflict(profile_id,landmark_id) do nothing;
    update public.delivery_landmark_encounters set unlocked_at=encounter.encounter_at where id=encounter.id;
    resolved:=resolved+1;
  end loop;
  return resolved;
end $$;

alter function public.resolve_travel_progress(timestamptz) rename to resolve_travel_progress_before_landmarks;
create or replace function public.resolve_travel_progress(reference_time timestamptz default now()) returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare total integer;
begin
  total:=public.resolve_travel_progress_before_landmarks(reference_time);
  perform public.resolve_due_landmark_encounters(reference_time,null);
  return total;
end $$;

create or replace function public.reconcile_my_world_landmarks()
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid; result jsonb;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  if me is null then raise exception 'Profile not found' using errcode='42501'; end if;
  perform public.resolve_due_landmark_encounters(now(),me);
  select jsonb_build_object(
    'landmarks',coalesce(jsonb_agg(jsonb_build_object(
      'catalogKey',l.catalog_key,'nameKey',l.name_key,'descriptionKey',l.description_key,
      'assetKey',l.asset_key,'category',l.category,'city',l.city,'region',l.region,
      'countryCode',l.country_code,'latitude',l.latitude,'longitude',l.longitude,
      'minimumZoom',l.minimum_zoom,'iconSizePx',l.icon_size_px,'unlockedAt',u.unlocked_at,
      'announcementPending',u.acknowledged_at is null
    ) order by u.unlocked_at),'[]'::jsonb)
  ) into result from public.profile_landmark_unlocks u join public.world_landmark_catalog l on l.id=u.landmark_id
  where u.profile_id=me and l.active;
  return result;
end $$;

create or replace function public.acknowledge_world_landmark(target_catalog_key text)
returns boolean language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid; changed integer;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  update public.profile_landmark_unlocks u set acknowledged_at=coalesce(acknowledged_at,now())
  from public.world_landmark_catalog l where u.profile_id=me and u.landmark_id=l.id and l.catalog_key=target_catalog_key;
  get diagnostics changed=row_count; return changed>0;
end $$;

revoke all on function public.materialize_delivery_landmark_encounters(),public.refresh_pending_landmark_encounters(),public.resolve_due_landmark_encounters(timestamptz,uuid),public.resolve_travel_progress_before_landmarks(timestamptz),public.resolve_travel_progress(timestamptz),public.reconcile_my_world_landmarks(),public.acknowledge_world_landmark(text) from public,anon,authenticated;
grant execute on function public.resolve_travel_progress(timestamptz) to service_role;
grant execute on function public.reconcile_my_world_landmarks(),public.acknowledge_world_landmark(text) to authenticated;
