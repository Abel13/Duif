-- Milestone 56: authoritative physical equipment, loadouts and journey snapshots.
create table public.equipment_catalog (
  id uuid primary key default gen_random_uuid(),
  catalog_key text not null unique,
  name_key text not null,
  description_key text not null,
  kind text not null check (kind in ('backpack','utility','cosmetic')),
  condition text check (condition in ('rain','night','wind')),
  seed_price integer check (seed_price is null or seed_price >= 0),
  max_uses integer check (max_uses is null or max_uses > 0),
  repair_seed_price integer check (repair_seed_price is null or repair_seed_price >= 0),
  slot_bonus integer not null default 0 check (slot_bonus >= 0),
  speed_multiplier numeric not null default 1 check (speed_multiplier between .6 and 1.25),
  mitigation_points numeric not null default 0 check (mitigation_points between 0 and .08),
  asset_key text,
  status text not null default 'active' check (status in ('active','hidden','retired')),
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  check ((kind='backpack' and max_uses is null and condition is null) or (kind='utility' and max_uses is not null and condition is not null) or kind='cosmetic')
);

create table public.equipment_instances (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  catalog_id uuid not null references public.equipment_catalog(id),
  uses_remaining integer check (uses_remaining is null or uses_remaining >= 0),
  equipped_mascot_id uuid references public.player_mascots(id) on delete set null,
  acquisition_key uuid not null default gen_random_uuid(),
  source text not null default 'shop',
  acquired_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(owner_profile_id, acquisition_key),
  unique(equipped_mascot_id, catalog_id)
);

create table public.mascot_loadouts (
  mascot_id uuid primary key references public.player_mascots(id) on delete cascade,
  backpack_instance_id uuid unique references public.equipment_instances(id) on delete set null,
  utility_instance_id uuid unique references public.equipment_instances(id) on delete set null,
  revision integer not null default 1 check (revision > 0),
  updated_at timestamptz not null default now(),
  check (backpack_instance_id is null or backpack_instance_id is distinct from utility_instance_id)
);

alter table public.deliveries add column equipment_snapshot jsonb not null default '{"version":1}'::jsonb;

create table public.delivery_equipment_activations (
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  equipment_instance_id uuid not null references public.equipment_instances(id),
  segment_id uuid not null references public.delivery_route_segments(id) on delete cascade,
  condition text not null,
  mitigation_points numeric not null,
  activated_at timestamptz not null default now(),
  primary key(delivery_id,equipment_instance_id)
);

create table public.equipment_purchase_requests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null,
  catalog_id uuid not null references public.equipment_catalog(id),
  instance_id uuid not null references public.equipment_instances(id),
  created_at timestamptz not null default now(),
  primary key(profile_id,request_id)
);

create index equipment_instances_owner_idx on public.equipment_instances(owner_profile_id,acquired_at desc);
alter table public.equipment_catalog enable row level security;
alter table public.equipment_instances enable row level security;
alter table public.mascot_loadouts enable row level security;
alter table public.delivery_equipment_activations enable row level security;
alter table public.equipment_purchase_requests enable row level security;
create policy "Active equipment catalog is readable" on public.equipment_catalog for select to authenticated using(status='active');
create policy "Owners read equipment instances" on public.equipment_instances for select to authenticated using(owner_profile_id=(select id from public.profiles where auth_user_id=auth.uid()));
create policy "Owners read mascot loadouts" on public.mascot_loadouts for select to authenticated using(exists(select 1 from public.player_mascots m join public.profiles p on p.id=m.owner_profile_id where m.id=mascot_id and p.auth_user_id=auth.uid()));
revoke all on public.equipment_purchase_requests,public.delivery_equipment_activations from anon,authenticated;

insert into public.equipment_catalog(catalog_key,name_key,description_key,kind,condition,seed_price,max_uses,repair_seed_price,slot_bonus,speed_multiplier,mitigation_points,asset_key,sort_order) values
 ('backpack-small','functionalEquipment.smallBackpack.name','functionalEquipment.smallBackpack.description','backpack',null,150,null,null,1,.95,0,'equipment.functional.smallBackpack',10),
 ('backpack-medium','functionalEquipment.mediumBackpack.name','functionalEquipment.mediumBackpack.description','backpack',null,350,null,null,2,.90,0,'equipment.functional.mediumBackpack',20),
 ('backpack-large','functionalEquipment.largeBackpack.name','functionalEquipment.largeBackpack.description','backpack',null,700,null,null,3,.85,0,'equipment.functional.largeBackpack',30),
 ('utility-raincoat','functionalEquipment.raincoat.name','functionalEquipment.raincoat.description','utility','rain',200,10,80,0,1,.03,'equipment.functional.raincoat',40),
 ('utility-route-lantern','functionalEquipment.routeLantern.name','functionalEquipment.routeLantern.description','utility','night',200,10,80,0,1,.02,'equipment.functional.routeLantern',50),
 ('utility-wind-goggles','functionalEquipment.windGoggles.name','functionalEquipment.windGoggles.description','utility','wind',200,10,80,0,1,.02,'equipment.functional.windGoggles',60);

insert into public.equipment_catalog(catalog_key,name_key,description_key,kind,status,asset_key,metadata)
select legacy.catalog_key,legacy.name_key,legacy.description_key,'cosmetic','hidden',legacy.asset_key,jsonb_build_object('legacyId',legacy.legacy_id)
from (values
 ('legacy-canvas-postal-bag','equipment.canvasPostalBag.name','equipment.canvasPostalBag.description','equipment.icon.canvasPostalBag','equipment-nuvem-canvas-bag'),
 ('legacy-blue-route-scarf','equipment.blueRouteScarf.name','equipment.blueRouteScarf.description','equipment.icon.blueRouteScarf','equipment-nuvem-blue-scarf'),
 ('legacy-flight-goggles','equipment.flightGoggles.name','equipment.flightGoggles.description','equipment.icon.flightGoggles','equipment-trovao-flight-goggles'),
 ('legacy-urgent-badge','equipment.urgentBadge.name','equipment.urgentBadge.description','equipment.icon.urgentBadge','equipment-trovao-red-badge'),
 ('legacy-travel-cap','equipment.travelCap.name','equipment.travelCap.description','equipment.icon.travelCap','equipment-trovao-travel-cap'),
 ('legacy-feather-charm','equipment.featherCharm.name','equipment.featherCharm.description','equipment.icon.featherCharm','equipment-pipoca-feather-charm'),
 ('legacy-small-satchel','equipment.smallSatchel.name','equipment.smallSatchel.description','equipment.icon.smallSatchel','equipment-pipoca-small-satchel')
) legacy(catalog_key,name_key,description_key,asset_key,legacy_id);

insert into public.equipment_instances(owner_profile_id,catalog_id,uses_remaining,source,acquisition_key)
select distinct mascot.owner_profile_id,catalog.id,null::integer,'legacy-migration',md5(mascot.owner_profile_id::text||'|'||(item.value->>'id'))::uuid
from public.player_mascots mascot cross join lateral jsonb_array_elements(mascot.equipment) item(value)
join public.equipment_catalog catalog on catalog.metadata->>'legacyId'=item.value->>'id'
on conflict(owner_profile_id,acquisition_key) do nothing;
update public.player_mascots set equipment='[]'::jsonb where equipment<>'[]'::jsonb;
update public.mascot_templates set equipment='[]'::jsonb where equipment<>'[]'::jsonb;

insert into public.official_assets(asset_key,asset_type) values
 ('equipment.functional.smallBackpack','equipmentIcon'),('equipment.functional.mediumBackpack','equipmentIcon'),('equipment.functional.largeBackpack','equipmentIcon'),
 ('equipment.functional.raincoat','equipmentIcon'),('equipment.functional.routeLantern','equipmentIcon'),('equipment.functional.windGoggles','equipmentIcon') on conflict do nothing;
insert into public.official_translation_keys(translation_key) values
 ('functionalEquipment.smallBackpack.name'),('functionalEquipment.mediumBackpack.name'),('functionalEquipment.largeBackpack.name'),
 ('functionalEquipment.raincoat.name'),('functionalEquipment.routeLantern.name'),('functionalEquipment.windGoggles.name') on conflict do nothing;
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select asset.id,1,'packaged','active',values.path,'image/webp',192,192,values.bytes,values.alt,false,'DUIF',jsonb_build_object('kind','equipmentIcon')
from (values
 ('equipment.functional.smallBackpack','/assets/equipment/functional/small-backpack.webp',4310,'functionalEquipment.smallBackpack.name'),
 ('equipment.functional.mediumBackpack','/assets/equipment/functional/medium-backpack.webp',4056,'functionalEquipment.mediumBackpack.name'),
 ('equipment.functional.largeBackpack','/assets/equipment/functional/large-backpack.webp',5620,'functionalEquipment.largeBackpack.name'),
 ('equipment.functional.raincoat','/assets/equipment/functional/raincoat.webp',5270,'functionalEquipment.raincoat.name'),
 ('equipment.functional.routeLantern','/assets/equipment/functional/route-lantern.webp',5320,'functionalEquipment.routeLantern.name'),
 ('equipment.functional.windGoggles','/assets/equipment/functional/wind-goggles.webp',4772,'functionalEquipment.windGoggles.name')
) values(key,path,bytes,alt) join public.official_assets asset on asset.asset_key=values.key
on conflict(asset_id,version) do nothing;

create or replace function public.current_profile_id() returns uuid language sql stable security definer set search_path=public,auth as $$ select id from public.profiles where auth_user_id=auth.uid() $$;

create or replace function public.purchase_equipment(target_catalog_key text,request_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare actor_profile_id uuid:=public.current_profile_id(); item public.equipment_catalog; existing uuid; created uuid; balance integer;
begin
 if actor_profile_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select instance_id into existing from public.equipment_purchase_requests r where r.profile_id=actor_profile_id and r.request_id=purchase_equipment.request_id;
 if existing is not null then return jsonb_build_object('instanceId',existing,'idempotent',true); end if;
 select * into item from public.equipment_catalog where catalog_key=target_catalog_key and status='active' and kind in ('backpack','utility') for share;
 if item.id is null then raise exception 'Equipment unavailable' using errcode='22023'; end if;
 insert into public.profile_seed_balances(profile_id,quantity) values(actor_profile_id,0) on conflict do nothing;
 select quantity into balance from public.profile_seed_balances where profile_seed_balances.profile_id=actor_profile_id for update;
 if balance<item.seed_price then raise exception 'Insufficient Seeds' using errcode='P0001'; end if;
 update public.profile_seed_balances set quantity=quantity-item.seed_price,updated_at=now() where profile_seed_balances.profile_id=actor_profile_id;
 insert into public.equipment_instances(owner_profile_id,catalog_id,uses_remaining,acquisition_key) values(actor_profile_id,item.id,item.max_uses,request_id) returning id into created;
 insert into public.equipment_purchase_requests values(actor_profile_id,request_id,item.id,created,now());
 return jsonb_build_object('instanceId',created,'seedBalance',balance-item.seed_price,'idempotent',false);
end $$;

create or replace function public.set_mascot_loadout(target_mascot_id uuid,backpack_instance_id uuid,utility_instance_id uuid,expected_revision integer default null) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare profile_id uuid:=public.current_profile_id(); current_revision integer; candidate record;
begin
 if not exists(select 1 from public.player_mascots where id=target_mascot_id and owner_profile_id=profile_id) then raise exception 'Mascot not found' using errcode='42501'; end if;
 if exists(select 1 from public.deliveries where mascot_id=target_mascot_id and status<>'completed') then raise exception 'Mascot has an open delivery' using errcode='55000'; end if;
 insert into public.mascot_loadouts(mascot_id) values(target_mascot_id) on conflict do nothing;
 select revision into current_revision from public.mascot_loadouts where mascot_id=target_mascot_id for update;
 if expected_revision is not null and expected_revision<>current_revision then raise exception 'Loadout changed' using errcode='40001'; end if;
 for candidate in select requested.id,catalog.kind,requested.owner_profile_id,requested.uses_remaining,requested.equipped_mascot_id from public.equipment_instances requested join public.equipment_catalog catalog on catalog.id=requested.catalog_id where requested.id in (backpack_instance_id,utility_instance_id) for update of requested loop
   if candidate.owner_profile_id<>profile_id or (candidate.equipped_mascot_id is not null and candidate.equipped_mascot_id<>target_mascot_id) then raise exception 'Equipment unavailable' using errcode='42501'; end if;
   if candidate.kind='utility' and candidate.uses_remaining=0 then raise exception 'Equipment needs repair' using errcode='55000'; end if;
 end loop;
 if backpack_instance_id is not null and not exists(select 1 from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=backpack_instance_id and i.owner_profile_id=profile_id and c.kind='backpack') then raise exception 'Invalid backpack' using errcode='22023'; end if;
 if utility_instance_id is not null and not exists(select 1 from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=utility_instance_id and i.owner_profile_id=profile_id and c.kind='utility') then raise exception 'Invalid utility' using errcode='22023'; end if;
 update public.equipment_instances set equipped_mascot_id=null,updated_at=now() where equipped_mascot_id=target_mascot_id;
 update public.equipment_instances set equipped_mascot_id=target_mascot_id,updated_at=now() where id in (backpack_instance_id,utility_instance_id);
 update public.mascot_loadouts loadout set backpack_instance_id=set_mascot_loadout.backpack_instance_id,utility_instance_id=set_mascot_loadout.utility_instance_id,revision=loadout.revision+1,updated_at=now() where loadout.mascot_id=set_mascot_loadout.target_mascot_id returning loadout.revision into current_revision;
 return jsonb_build_object('mascotId',target_mascot_id,'revision',current_revision,'backpackInstanceId',backpack_instance_id,'utilityInstanceId',utility_instance_id);
end $$;

create or replace function public.repair_equipment(target_instance_id uuid,request_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare profile_id uuid:=public.current_profile_id(); item record; balance integer;
begin
 select i.*,c.max_uses,c.repair_seed_price,c.kind into item from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=target_instance_id and i.owner_profile_id=profile_id for update;
 if item.id is null then raise exception 'Equipment not found' using errcode='42501'; end if;
 if item.kind<>'utility' or item.uses_remaining<>0 then raise exception 'Equipment cannot be repaired' using errcode='55000'; end if;
 select quantity into balance from public.profile_seed_balances where profile_seed_balances.profile_id=profile_id for update;
 if coalesce(balance,0)<item.repair_seed_price then raise exception 'Insufficient Seeds' using errcode='P0001'; end if;
 update public.profile_seed_balances set quantity=quantity-item.repair_seed_price,updated_at=now() where profile_seed_balances.profile_id=profile_id;
 update public.equipment_instances set uses_remaining=item.max_uses,updated_at=now() where id=target_instance_id;
 return jsonb_build_object('instanceId',target_instance_id,'usesRemaining',item.max_uses,'seedBalance',balance-item.repair_seed_price);
end $$;

create or replace function public.apply_delivery_equipment_snapshot() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare backpack record; utility record; revision_value integer:=1;
begin
 if new.is_tutorial then return new; end if;
 select l.revision into revision_value from public.mascot_loadouts l where l.mascot_id=new.mascot_id;
 select c.catalog_key,c.slot_bonus,c.speed_multiplier,i.id into backpack from public.mascot_loadouts l join public.equipment_instances i on i.id=l.backpack_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=new.mascot_id;
 select c.catalog_key,c.condition,c.mitigation_points,c.max_uses,i.id,i.uses_remaining into utility from public.mascot_loadouts l join public.equipment_instances i on i.id=l.utility_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=new.mascot_id and i.uses_remaining>0;
 new.equipment_snapshot:=jsonb_build_object('version',1,'loadoutRevision',coalesce(revision_value,1),'backpack',case when backpack.id is null then null else jsonb_build_object('instanceId',backpack.id,'catalogKey',backpack.catalog_key,'slotBonus',backpack.slot_bonus,'speedMultiplier',backpack.speed_multiplier) end,'utility',case when utility.id is null then null else jsonb_build_object('instanceId',utility.id,'catalogKey',utility.catalog_key,'condition',utility.condition,'mitigationPoints',utility.mitigation_points,'usesAtDispatch',utility.uses_remaining) end);
 if backpack.id is not null then new.travel_slot_capacity:=new.travel_slot_capacity+backpack.slot_bonus; new.animal_speed_kmh:=new.animal_speed_kmh*backpack.speed_multiplier; end if;
 return new;
end $$;
create trigger apply_delivery_equipment_snapshot_before_insert before insert on public.deliveries for each row execute function public.apply_delivery_equipment_snapshot();

create or replace function public.apply_segment_equipment() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare delivery record; utility jsonb; category text; is_day boolean; live_day boolean; wind numeric; condition_name text; mitigation numeric:=0; leg_multiplier numeric:=1; climate numeric; inserted_count integer;
begin
 select d.animal_speed_kmh,d.equipment_snapshot,d.travel_modifiers,d.is_tutorial into delivery from public.deliveries d where d.id=new.delivery_id;
 if delivery.is_tutorial then return new; end if;
 utility:=delivery.equipment_snapshot->'utility'; if utility is null or utility='null'::jsonb then return new; end if;
 category:=new.weather_snapshot->>'category';
 select daylight.is_day into live_day from public.delivery_route_daylight_windows daylight where daylight.segment_id=new.id and daylight.ended_at is null order by daylight.started_at desc limit 1;
 is_day:=coalesce(live_day,(new.weather_snapshot->>'isDay')::boolean,true); wind:=coalesce((new.weather_snapshot->>'windSpeedKmh')::numeric,0); condition_name:=utility->>'condition';
 mitigation:=case when condition_name='rain' and category in ('fogDrizzle','rain','heavyFreezingRain','thunderstorm') then (utility->>'mitigationPoints')::numeric when condition_name='night' and not is_day then least(.02,(utility->>'mitigationPoints')::numeric) when condition_name='wind' and wind>=30 then least(case when wind>=50 then .04 else .02 end,(utility->>'mitigationPoints')::numeric) else 0 end;
 climate:=least(1.25,public.travel_effective_multiplier(category,wind,is_day,new.modifiers->>'season')+mitigation);
 leg_multiplier:=coalesce((delivery.travel_modifiers->>(case when new.leg='outbound' then 'outboundSpeedMultiplier' else 'returnSpeedMultiplier' end))::numeric,1);
 new.modifiers:=jsonb_set(jsonb_set(new.modifiers,'{equipment}',to_jsonb(1+mitigation)),'{equipmentMitigationPoints}',to_jsonb(mitigation));
 new.effective_speed_kmh:=greatest(delivery.animal_speed_kmh*.60,least(delivery.animal_speed_kmh*1.25,delivery.animal_speed_kmh*leg_multiplier*climate));
 if mitigation>0 and new.state='active' and (tg_op='INSERT' or old.state is distinct from 'active') then
   insert into public.delivery_equipment_activations(delivery_id,equipment_instance_id,segment_id,condition,mitigation_points) values(new.delivery_id,(utility->>'instanceId')::uuid,new.id,condition_name,mitigation) on conflict do nothing;
   get diagnostics inserted_count=row_count;
   if inserted_count=1 then update public.equipment_instances set uses_remaining=greatest(0,uses_remaining-1),updated_at=now() where id=(utility->>'instanceId')::uuid; end if;
 end if;
 return new;
end $$;
create trigger apply_segment_equipment_before_write before insert or update of weather_snapshot,state,effective_speed_kmh on public.delivery_route_segments for each row execute function public.apply_segment_equipment();

alter function public.create_delivery_from_selection(uuid,uuid,text,jsonb) rename to create_delivery_from_selection_legacy_equipment;
revoke all on function public.create_delivery_from_selection_legacy_equipment(uuid,uuid,text,jsonb) from public,anon,authenticated;
create or replace function public.create_delivery_from_selection(mascot_id uuid,friend_profile_id uuid,correspondence_catalog_key text,content_payload jsonb) returns public.deliveries language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare expected integer; actual integer; created public.deliveries;
begin
 if not exists(select 1 from public.player_mascots m join public.profiles p on p.id=m.owner_profile_id where m.id=mascot_id and p.auth_user_id=auth.uid()) then raise exception 'Mascot not found' using errcode='42501'; end if;
 expected:=nullif(content_payload->>'equipmentLoadoutRevision','')::integer;
 select coalesce(revision,1) into actual from public.mascot_loadouts where mascot_loadouts.mascot_id=create_delivery_from_selection.mascot_id;
 actual:=coalesce(actual,1);
 if expected is not null and expected<>actual then raise exception 'Loadout changed' using errcode='40001'; end if;
 created:=public.create_delivery_from_selection_legacy_equipment(mascot_id,friend_profile_id,correspondence_catalog_key,content_payload-'equipmentLoadoutRevision');
 return created;
end $$;
revoke all on function public.create_delivery_from_selection(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.create_delivery_from_selection(uuid,uuid,text,jsonb) to authenticated;

create or replace function public.preview_mascot_loadout(target_mascot_id uuid,backpack_instance_id uuid,utility_instance_id uuid,weather_category text default null,wind_speed_kmh numeric default 0,is_day boolean default true) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare profile_id uuid:=public.current_profile_id(); mascot public.player_mascots; backpack record; utility record; current_loadout public.mascot_loadouts; capacity integer; speed numeric; mitigation numeric:=0;
begin
 select * into mascot from public.player_mascots where id=target_mascot_id and owner_profile_id=profile_id; if mascot.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
 select * into current_loadout from public.mascot_loadouts where mascot_id=target_mascot_id;
 select c.* into backpack from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=backpack_instance_id and i.owner_profile_id=profile_id and c.kind='backpack';
 select c.* into utility from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=utility_instance_id and i.owner_profile_id=profile_id and c.kind='utility' and i.uses_remaining>0;
 capacity:=3+coalesce(backpack.slot_bonus,0); speed:=coalesce((mascot.attributes->>'speed')::numeric,1)*coalesce(backpack.speed_multiplier,1);
 mitigation:=case when utility.condition='rain' and weather_category in ('fogDrizzle','rain','heavyFreezingRain','thunderstorm') then utility.mitigation_points when utility.condition='night' and not is_day then least(.02,utility.mitigation_points) when utility.condition='wind' and wind_speed_kmh>=30 then least(case when wind_speed_kmh>=50 then .04 else .02 end,utility.mitigation_points) else 0 end;
 return jsonb_build_object('mascotId',target_mascot_id,'revision',coalesce(current_loadout.revision,1),'speedMultiplier',coalesce(backpack.speed_multiplier,1),'slotCapacity',capacity,'mitigationPoints',mitigation,'condition',utility.condition,'forecastMayChange',true);
end $$;

revoke all on function public.purchase_equipment(text,uuid),public.set_mascot_loadout(uuid,uuid,uuid,integer),public.repair_equipment(uuid,uuid),public.preview_mascot_loadout(uuid,uuid,uuid,text,numeric,boolean) from public,anon;
grant execute on function public.purchase_equipment(text,uuid),public.set_mascot_loadout(uuid,uuid,uuid,integer),public.repair_equipment(uuid,uuid),public.preview_mascot_loadout(uuid,uuid,uuid,text,numeric,boolean) to authenticated;
grant select on public.equipment_catalog,public.equipment_instances,public.mascot_loadouts to authenticated;
grant select on public.profile_seed_balances to authenticated;
