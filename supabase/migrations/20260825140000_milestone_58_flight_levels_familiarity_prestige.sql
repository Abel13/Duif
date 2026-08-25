-- Milestone 58: authoritative flight progression, canonical familiarity and visual prestige.

create table public.mascot_flight_level_rules (
  level integer primary key check(level between 1 and 20),
  max_one_way_km numeric not null check(max_one_way_km>0),
  natural_slots integer not null check(natural_slots between 3 and 7),
  rules_version integer not null default 58
);
insert into public.mascot_flight_level_rules(level,max_one_way_km,natural_slots) values
(1,25,3),(2,50,3),(3,100,3),(4,180,3),(5,300,4),(6,500,4),(7,800,4),(8,1200,4),(9,1800,4),(10,2500,5),
(11,3500,5),(12,4500,5),(13,6000,5),(14,7500,5),(15,9000,6),(16,11000,6),(17,13000,6),(18,15500,6),(19,18000,6),(20,20050,7);
alter table public.mascot_flight_level_rules enable row level security;
create policy "flight rules are readable" on public.mascot_flight_level_rules for select to authenticated using(true);

create table public.mascot_prestige_border_catalog (
  catalog_key text primary key check(catalog_key~'^prestige-[a-z0-9-]+$'),
  minimum_level integer not null check(minimum_level>=20),
  name_key text not null references public.official_translation_keys(translation_key),
  description_key text not null references public.official_translation_keys(translation_key),
  asset_key text not null,
  sort_order integer not null,
  status public.catalog_status not null default 'active'
);
create table public.mascot_prestige_selections (
  mascot_id uuid primary key references public.player_mascots(id) on delete cascade,
  border_catalog_key text not null references public.mascot_prestige_border_catalog(catalog_key),
  selected_at timestamptz not null default now(),
  selected_manually boolean not null default false
);
alter table public.mascot_prestige_border_catalog enable row level security;
alter table public.mascot_prestige_selections enable row level security;
create policy "prestige catalog is readable" on public.mascot_prestige_border_catalog for select to authenticated using(status='active');
create policy "players read own prestige" on public.mascot_prestige_selections for select using(mascot_id in(select id from public.player_mascots where owner_profile_id=public.current_profile_id()));

insert into public.official_translation_keys(translation_key) values
('prestige.firstHorizon.name'),('prestige.firstHorizon.description'),('prestige.routeAtlas.name'),('prestige.routeAtlas.description'),
('prestige.letterSky.name'),('prestige.letterSky.description'),('prestige.nestAmongStars.name'),('prestige.nestAmongStars.description') on conflict do nothing;
insert into public.mascot_prestige_border_catalog values
('prestige-first-horizon',20,'prestige.firstHorizon.name','prestige.firstHorizon.description','prestige.border.firstHorizon',20,'active'),
('prestige-route-atlas',30,'prestige.routeAtlas.name','prestige.routeAtlas.description','prestige.border.routeAtlas',30,'active'),
('prestige-letter-sky',40,'prestige.letterSky.name','prestige.letterSky.description','prestige.border.letterSky',40,'active'),
('prestige-nest-among-stars',50,'prestige.nestAmongStars.name','prestige.nestAmongStars.description','prestige.border.nestAmongStars',50,'active');

create table public.delivery_familiarity_completions (
  delivery_id uuid primary key references public.deliveries(id) on delete cascade,
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  route_pair_key text not null,
  completed_at timestamptz not null default now()
);

create or replace function public.m58_flight_rule(target_level integer) returns jsonb language sql immutable set search_path=public as $$
 select jsonb_build_object('level',greatest(1,target_level),'maxOneWayKm',max_one_way_km,'naturalSlots',natural_slots,'rulesVersion',58)
 from public.mascot_flight_level_rules where level=least(20,greatest(1,target_level))
$$;
create or replace function public.m58_route_pair_key(origin_identity text,destination_identity text) returns text language sql immutable set search_path=public as $$
 select least(origin_identity,destination_identity)||'|'||greatest(origin_identity,destination_identity)
$$;
create or replace function public.m58_familiarity_payload(completed_count integer) returns jsonb language sql immutable set search_path=public as $$
 select case when completed_count>=20 then jsonb_build_object('state','mastered','completedCount',completed_count,'speedMultiplier',1.06,'nextAt',null)
 when completed_count>=8 then jsonb_build_object('state','familiar','completedCount',completed_count,'speedMultiplier',1.04,'nextAt',20)
 when completed_count>=3 then jsonb_build_object('state','known','completedCount',completed_count,'speedMultiplier',1.02,'nextAt',8)
 else jsonb_build_object('state','new','completedCount',completed_count,'speedMultiplier',1.00,'nextAt',3) end
$$;

create or replace function public.m58_materialize_route_and_validate() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare pet public.player_mascots; sender public.profiles; receiver public.profiles; origin_id text; destination_id text; pair_key text; rule jsonb; backpack_bonus integer:=0; familiarity_count integer:=0;
begin
 if new.is_tutorial then return new; end if;
 select * into pet from public.player_mascots where id=new.mascot_id;
 select * into sender from public.profiles where id=new.sender_profile_id;
 select * into receiver from public.profiles where id=new.receiver_profile_id;
 rule:=public.m58_flight_rule(pet.level);
 if new.distance_km>(rule->>'maxOneWayKm')::numeric then raise exception 'Route exceeds mascot flight range' using errcode='22023'; end if;
 select coalesce(c.slot_bonus,0) into backpack_bonus from public.mascot_loadouts l join public.equipment_instances i on i.id=l.backpack_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=pet.id;
 new.travel_slot_capacity:=(rule->>'naturalSlots')::integer+coalesce(backpack_bonus,0);
 if new.travel_slots_used>new.travel_slot_capacity then raise exception 'Travel capacity exceeded' using errcode='22023'; end if;
 origin_id:=case when sender.home_city_geoname_id is not null then 'city:'||sender.home_city_geoname_id else null end;
 destination_id:=case when new.correspondence_option_id is null and new.destination_place_label is not null then 'mission:'||new.destination_place_label when receiver.home_city_geoname_id is not null then 'city:'||receiver.home_city_geoname_id else null end;
 if origin_id is not null and destination_id is not null then
   pair_key:=public.m58_route_pair_key(origin_id,destination_id);
   new.route_identity:=jsonb_build_object('version',3,'origin',origin_id,'destination',destination_id,'pairKey',pair_key,'originSource','profileGeonameId','destinationSource',case when destination_id like 'mission:%' then 'missionCatalogKey' else 'profileGeonameId' end);
   select completed_count into familiarity_count from public.mascot_route_familiarity where mascot_id=pet.id and route_pair_key=pair_key;
   new.skill_context:=coalesce(new.skill_context,'{}')||jsonb_build_object('familiarity',coalesce(familiarity_count,0),'pairKey',pair_key);
 end if;
 return new;
end $$;
drop trigger if exists m58_materialize_route_and_validate_before_insert on public.deliveries;
create trigger m58_materialize_route_and_validate_before_insert before insert on public.deliveries for each row execute function public.m58_materialize_route_and_validate();

create or replace function public.resolve_delivery_travel_modifiers() returns trigger language plpgsql security definer set search_path=public,auth as $$
declare snapshot jsonb; requested_at timestamptz; outbound_duration interval; return_duration interval; destination_key text; count_value integer:=0; familiarity jsonb; familiarity_multiplier numeric:=1;
begin
 if new.travel_modifiers is not null then return new; end if;
 destination_key:=coalesce(new.destination_place_label,new.destination_label_key);
 snapshot:=public.preview_mascot_skill_modifiers(new.mascot_id,destination_key,new.distance_km);
 if coalesce((new.route_identity->>'version')::integer,0)=3 then
   select completed_count into count_value from public.mascot_route_familiarity where mascot_id=new.mascot_id and route_pair_key=new.route_identity->>'pairKey';
   familiarity:=public.m58_familiarity_payload(coalesce(count_value,0)); familiarity_multiplier:=(familiarity->>'speedMultiplier')::numeric;
   snapshot:=snapshot||jsonb_build_object('flightRulesVersion',58,'routeIdentity',new.route_identity,'familiarity',familiarity,
     'outboundSpeedMultiplier',least(1.25,(snapshot->>'outboundSpeedMultiplier')::numeric*familiarity_multiplier),
     'returnSpeedMultiplier',least(1.25,(snapshot->>'returnSpeedMultiplier')::numeric*familiarity_multiplier));
 end if;
 requested_at:=new.outbound_start_at;
 outbound_duration:=(new.distance_km/new.animal_speed_kmh/nullif((snapshot->>'outboundSpeedMultiplier')::numeric,0))*interval '1 hour';
 return_duration:=(new.distance_km/new.animal_speed_kmh/nullif((snapshot->>'returnSpeedMultiplier')::numeric,0))*interval '1 hour';
 new.travel_modifiers:=snapshot; new.outbound_start_at:=requested_at+((snapshot->>'preparationMinutes')::numeric*interval '1 minute'); new.outbound_arrival_at:=new.outbound_start_at+outbound_duration; new.return_start_at:=new.outbound_arrival_at+interval '5 minutes'; new.return_arrival_at:=new.return_start_at+return_duration; new.status:='preparing'; return new;
end $$;

drop trigger if exists m57_record_route_familiarity_on_completion on public.deliveries;
create or replace function public.m58_record_route_familiarity() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare inserted_count integer;
begin
 if new.status='completed' and old.status is distinct from 'completed' and not new.is_tutorial and coalesce((new.route_identity->>'version')::integer,0)=3 then
   insert into public.delivery_familiarity_completions(delivery_id,mascot_id,route_pair_key,completed_at) values(new.id,new.mascot_id,new.route_identity->>'pairKey',now()) on conflict do nothing;
   get diagnostics inserted_count=row_count;
   if inserted_count=1 then insert into public.mascot_route_familiarity(mascot_id,route_pair_key,completed_count,last_completed_at) values(new.mascot_id,new.route_identity->>'pairKey',1,now()) on conflict(mascot_id,route_pair_key) do update set completed_count=public.mascot_route_familiarity.completed_count+1,last_completed_at=excluded.last_completed_at; end if;
 end if; return new;
end $$;
create trigger m58_record_route_familiarity_on_completion after update of status on public.deliveries for each row execute function public.m58_record_route_familiarity();

-- Safe historical identities: current registered city must still match the immutable label.
update public.deliveries d set route_identity=jsonb_build_object('version',3,'origin','city:'||s.home_city_geoname_id,'destination','city:'||r.home_city_geoname_id,'pairKey',public.m58_route_pair_key('city:'||s.home_city_geoname_id,'city:'||r.home_city_geoname_id),'originSource','verifiedProfileGeonameId','destinationSource','verifiedProfileGeonameId')
from public.profiles s,public.profiles r where d.sender_profile_id=s.id and d.receiver_profile_id=r.id and s.home_city_geoname_id is not null and r.home_city_geoname_id is not null and d.correspondence_option_id is not null and d.origin_place_label ilike '%'||s.postal_base_city||'%' and d.destination_place_label ilike '%'||r.postal_base_city||'%';
insert into public.delivery_familiarity_completions(delivery_id,mascot_id,route_pair_key,completed_at)
select id,mascot_id,route_identity->>'pairKey',coalesce(updated_at,now()) from public.deliveries where status='completed' and not is_tutorial and coalesce((route_identity->>'version')::integer,0)=3 on conflict do nothing;
insert into public.mascot_route_familiarity(mascot_id,route_pair_key,completed_count,last_completed_at)
select mascot_id,route_pair_key,count(*),max(completed_at) from public.delivery_familiarity_completions group by mascot_id,route_pair_key on conflict(mascot_id,route_pair_key) do update set completed_count=excluded.completed_count,last_completed_at=excluded.last_completed_at;

create or replace function public.select_mascot_prestige_border(target_mascot_id uuid,target_border_catalog_key text) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare pet public.player_mascots; border public.mascot_prestige_border_catalog;
begin select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id() for update; if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
 select * into border from public.mascot_prestige_border_catalog where catalog_key=target_border_catalog_key and status='active'; if border.catalog_key is null or pet.level<border.minimum_level then raise exception 'Prestige border is locked' using errcode='22023'; end if;
 insert into public.mascot_prestige_selections values(pet.id,border.catalog_key,now(),true) on conflict(mascot_id) do update set border_catalog_key=excluded.border_catalog_key,selected_at=now(),selected_manually=true;
 return jsonb_build_object('catalogKey',border.catalog_key,'minimumLevel',border.minimum_level,'nameKey',border.name_key,'descriptionKey',border.description_key,'assetKey',border.asset_key);
end $$;
create or replace function public.get_mascot_flight_state(target_mascot_id uuid) returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare pet public.player_mascots; selected text; rule jsonb; borders jsonb;
begin select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=public.current_profile_id(); if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
 select border_catalog_key into selected from public.mascot_prestige_selections where mascot_id=pet.id;
 if selected is null then select catalog_key into selected from public.mascot_prestige_border_catalog where status='active' and minimum_level<=pet.level order by minimum_level desc limit 1; end if;
 select coalesce(jsonb_agg(jsonb_build_object('catalogKey',catalog_key,'minimumLevel',minimum_level,'nameKey',name_key,'descriptionKey',description_key,'assetKey',asset_key,'unlocked',minimum_level<=pet.level,'selected',catalog_key=selected) order by sort_order),'[]') into borders from public.mascot_prestige_border_catalog where status='active';
 rule:=public.m58_flight_rule(pet.level); return jsonb_build_object('level',pet.level,'xp',pet.xp,'nextLevelXp',pet.next_level_xp,'maxOneWayKm',rule->'maxOneWayKm','naturalSlots',rule->'naturalSlots','functionalCapReached',pet.level>=20,'selectedBorderKey',selected,'borders',borders);
end $$;
create or replace function public.preview_mascot_flight(target_mascot_id uuid,target_profile_id uuid) returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare pet public.player_mascots; me public.profiles; friend public.profiles; distance_value numeric; rule jsonb; pair_key text; count_value integer:=0; familiarity jsonb; required_level integer;
begin select * into me from public.profiles where auth_user_id=auth.uid(); select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=me.id; select * into friend from public.profiles where id=target_profile_id; if pet.id is null or friend.id is null then raise exception 'Flight preview unavailable' using errcode='42501'; end if;
 distance_value:=round((6371*2*asin(least(1,sqrt(power(sin(radians((friend.home_latitude-me.home_latitude)/2)),2)+cos(radians(me.home_latitude))*cos(radians(friend.home_latitude))*power(sin(radians((friend.home_longitude-me.home_longitude)/2)),2)))))::numeric,2); rule:=public.m58_flight_rule(pet.level);
 if me.home_city_geoname_id is not null and friend.home_city_geoname_id is not null then pair_key:=public.m58_route_pair_key('city:'||me.home_city_geoname_id,'city:'||friend.home_city_geoname_id); select completed_count into count_value from public.mascot_route_familiarity where mascot_id=pet.id and route_pair_key=pair_key; end if;
 select min(level) into required_level from public.mascot_flight_level_rules where max_one_way_km>=distance_value;
 familiarity:=public.m58_familiarity_payload(coalesce(count_value,0)); return jsonb_build_object('rulesVersion',58,'distanceKm',distance_value,'eligible',distance_value<=(rule->>'maxOneWayKm')::numeric,'requiredLevel',required_level,'maxOneWayKm',rule->'maxOneWayKm','naturalSlots',rule->'naturalSlots','routePairKey',pair_key,'familiarity',familiarity);
end $$;

insert into public.mascot_prestige_selections(mascot_id,border_catalog_key,selected_manually)
select m.id,b.catalog_key,false from public.player_mascots m join lateral(select catalog_key from public.mascot_prestige_border_catalog where minimum_level<=m.level and status='active' order by minimum_level desc limit 1)b on true on conflict do nothing;
update public.player_mascots set next_level_xp=public.progression_next_level_xp('mascot',level);

revoke all on function public.m58_flight_rule(integer),public.m58_route_pair_key(text,text),public.m58_familiarity_payload(integer) from public,anon,authenticated;
revoke all on function public.get_mascot_flight_state(uuid),public.preview_mascot_flight(uuid,uuid),public.select_mascot_prestige_border(uuid,text) from public,anon;
grant execute on function public.get_mascot_flight_state(uuid),public.preview_mascot_flight(uuid,uuid),public.select_mascot_prestige_border(uuid,text) to authenticated;
