-- Keep every client mutation safely retryable and install the dispatch revision guard
-- even in environments where the preceding migration was applied incrementally.
create table public.equipment_mutation_requests (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  request_id uuid not null,
  mutation_kind text not null check(mutation_kind in ('loadout','repair')),
  result jsonb not null,
  created_at timestamptz not null default now(),
  primary key(profile_id,request_id)
);
alter table public.equipment_mutation_requests enable row level security;
revoke all on public.equipment_mutation_requests from public,anon,authenticated;

create or replace function public.set_mascot_loadout(target_mascot_id uuid,backpack_instance_id uuid,utility_instance_id uuid,expected_revision integer,request_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare actor_profile_id uuid:=public.current_profile_id(); current_revision integer; candidate record; saved jsonb;
begin
 select result into saved from public.equipment_mutation_requests r where r.profile_id=actor_profile_id and r.request_id=set_mascot_loadout.request_id and mutation_kind='loadout';
 if saved is not null then return saved; end if;
 if not exists(select 1 from public.player_mascots where id=target_mascot_id and owner_profile_id=actor_profile_id) then raise exception 'Mascot not found' using errcode='42501'; end if;
 if exists(select 1 from public.deliveries where mascot_id=target_mascot_id and status<>'completed') then raise exception 'Mascot has an open delivery' using errcode='55000'; end if;
 insert into public.mascot_loadouts(mascot_id) values(target_mascot_id) on conflict do nothing;
 select revision into current_revision from public.mascot_loadouts where mascot_id=target_mascot_id for update;
 if expected_revision is not null and expected_revision<>current_revision then raise exception 'Loadout changed' using errcode='40001'; end if;
 for candidate in select requested.id,catalog.kind,requested.owner_profile_id,requested.uses_remaining,requested.equipped_mascot_id from public.equipment_instances requested join public.equipment_catalog catalog on catalog.id=requested.catalog_id where requested.id in (backpack_instance_id,utility_instance_id) for update of requested loop
   if candidate.owner_profile_id<>actor_profile_id or (candidate.equipped_mascot_id is not null and candidate.equipped_mascot_id<>target_mascot_id) then raise exception 'Equipment unavailable' using errcode='42501'; end if;
   if candidate.kind='utility' and candidate.uses_remaining=0 then raise exception 'Equipment needs repair' using errcode='55000'; end if;
 end loop;
 if backpack_instance_id is not null and not exists(select 1 from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=backpack_instance_id and i.owner_profile_id=actor_profile_id and c.kind='backpack') then raise exception 'Invalid backpack' using errcode='22023'; end if;
 if utility_instance_id is not null and not exists(select 1 from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=utility_instance_id and i.owner_profile_id=actor_profile_id and c.kind='utility') then raise exception 'Invalid utility' using errcode='22023'; end if;
 update public.equipment_instances set equipped_mascot_id=null,updated_at=now() where equipped_mascot_id=target_mascot_id;
 update public.equipment_instances set equipped_mascot_id=target_mascot_id,updated_at=now() where id in (backpack_instance_id,utility_instance_id);
 update public.mascot_loadouts loadout set backpack_instance_id=set_mascot_loadout.backpack_instance_id,utility_instance_id=set_mascot_loadout.utility_instance_id,revision=loadout.revision+1,updated_at=now() where loadout.mascot_id=set_mascot_loadout.target_mascot_id returning loadout.revision into current_revision;
 saved:=jsonb_build_object('mascotId',target_mascot_id,'revision',current_revision,'backpackInstanceId',backpack_instance_id,'utilityInstanceId',utility_instance_id);
 insert into public.equipment_mutation_requests values(actor_profile_id,request_id,'loadout',saved,now()); return saved;
end $$;

create or replace function public.repair_equipment(target_instance_id uuid,request_id uuid) returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare actor_profile_id uuid:=public.current_profile_id(); item record; balance integer; saved jsonb;
begin
 select result into saved from public.equipment_mutation_requests r where r.profile_id=actor_profile_id and r.request_id=repair_equipment.request_id and mutation_kind='repair'; if saved is not null then return saved; end if;
 select i.*,c.max_uses,c.repair_seed_price,c.kind into item from public.equipment_instances i join public.equipment_catalog c on c.id=i.catalog_id where i.id=target_instance_id and i.owner_profile_id=actor_profile_id for update;
 if item.id is null then raise exception 'Equipment not found' using errcode='42501'; end if;
 if item.kind<>'utility' or item.uses_remaining<>0 then raise exception 'Equipment cannot be repaired' using errcode='55000'; end if;
 select quantity into balance from public.profile_seed_balances where profile_seed_balances.profile_id=actor_profile_id for update;
 if coalesce(balance,0)<item.repair_seed_price then raise exception 'Insufficient Seeds' using errcode='P0001'; end if;
 update public.profile_seed_balances set quantity=quantity-item.repair_seed_price,updated_at=now() where profile_seed_balances.profile_id=actor_profile_id;
 update public.equipment_instances set uses_remaining=item.max_uses,updated_at=now() where id=target_instance_id;
 saved:=jsonb_build_object('instanceId',target_instance_id,'usesRemaining',item.max_uses,'seedBalance',balance-item.repair_seed_price);
 insert into public.equipment_mutation_requests values(actor_profile_id,request_id,'repair',saved,now()); return saved;
end $$;

do $$ begin
 if to_regprocedure('public.create_delivery_from_selection_legacy_equipment(uuid,uuid,text,jsonb)') is null then
   alter function public.create_delivery_from_selection(uuid,uuid,text,jsonb) rename to create_delivery_from_selection_legacy_equipment;
 end if;
end $$;
revoke all on function public.create_delivery_from_selection_legacy_equipment(uuid,uuid,text,jsonb) from public,anon,authenticated;
create or replace function public.create_delivery_from_selection(mascot_id uuid,friend_profile_id uuid,correspondence_catalog_key text,content_payload jsonb) returns public.deliveries language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare expected integer; actual integer; created public.deliveries;
begin
 if not exists(select 1 from public.player_mascots m join public.profiles p on p.id=m.owner_profile_id where m.id=mascot_id and p.auth_user_id=auth.uid()) then raise exception 'Mascot not found' using errcode='42501'; end if;
 expected:=nullif(content_payload->>'equipmentLoadoutRevision','')::integer;
 select coalesce(revision,1) into actual from public.mascot_loadouts where mascot_loadouts.mascot_id=create_delivery_from_selection.mascot_id; actual:=coalesce(actual,1);
 if expected is not null and expected<>actual then raise exception 'Loadout changed' using errcode='40001'; end if;
 created:=public.create_delivery_from_selection_legacy_equipment(mascot_id,friend_profile_id,correspondence_catalog_key,content_payload-'equipmentLoadoutRevision'); return created;
end $$;

revoke all on function public.set_mascot_loadout(uuid,uuid,uuid,integer,uuid),public.repair_equipment(uuid,uuid),public.create_delivery_from_selection(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.set_mascot_loadout(uuid,uuid,uuid,integer,uuid),public.repair_equipment(uuid,uuid),public.create_delivery_from_selection(uuid,uuid,text,jsonb) to authenticated;

create or replace function public.dispatch_postal_job(target_offer_id uuid)
returns public.deliveries language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me public.profiles; offer public.postal_job_offers; cycle public.postal_job_cycles; template public.official_postal_job_templates; pet public.player_mascots; d public.deliveries; speed numeric(10,2); actual_distance numeric(10,2); started timestamptz:=now(); natural_capacity integer; backpack_bonus integer:=0;
begin
 select * into me from public.profiles where auth_user_id=auth.uid() for update;
 select o.* into offer from public.postal_job_offers o join public.postal_job_cycles c on c.id=o.cycle_id where o.id=target_offer_id and c.profile_id=me.id for update;
 if offer.id is null or offer.status<>'accepted' then raise exception 'Postal job must be accepted first' using errcode='22023'; end if;
 select * into cycle from public.postal_job_cycles where id=offer.cycle_id;
 select * into template from public.official_postal_job_templates where catalog_key=offer.template_catalog_key and status='active';
 select * into pet from public.player_mascots where id=cycle.mascot_id and owner_profile_id=me.id for update;
 select round((6371*2*asin(least(1,sqrt(power(sin(radians((offer.destination_latitude-me.home_latitude)/2)),2)+cos(radians(me.home_latitude))*cos(radians(offer.destination_latitude))*power(sin(radians((offer.destination_longitude-me.home_longitude)/2)),2)))))::numeric,2) into actual_distance;
 if actual_distance < template.min_distance_km or actual_distance > template.max_distance_km then raise exception 'Postal job destination is no longer compatible' using errcode='22023'; end if;
 if pet.id is null or exists(select 1 from public.deliveries where mascot_id=pet.id and status<>'completed') then raise exception 'Mascot is unavailable' using errcode='23505'; end if;
 natural_capacity:=case when pet.level>=20 then 7 when pet.level>=15 then 6 when pet.level>=10 then 5 when pet.level>=5 then 4 else 3 end;
 select coalesce(c.slot_bonus,0) into backpack_bonus from public.mascot_loadouts l join public.equipment_instances i on i.id=l.backpack_instance_id join public.equipment_catalog c on c.id=i.catalog_id where l.mascot_id=pet.id;
 if template.cargo_slots > natural_capacity+coalesce(backpack_bonus,0) then raise exception 'Postal job cargo does not fit' using errcode='22023'; end if;
 speed:=(28+coalesce((pet.attributes->>'speed')::numeric,0)*4+coalesce((pet.attributes->>'stamina')::numeric,0)*2)::numeric(10,2);
 insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,origin_place_label,destination_latitude,destination_longitude,destination_label_key,destination_place_label,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,travel_slot_capacity,travel_slots_used)
 values(gen_random_uuid(),me.id,me.id,pet.id,me.home_latitude,me.home_longitude,me.home_label_key,me.postal_base_city,offer.destination_latitude,offer.destination_longitude,'postalJobs.destination',template.catalog_key,actual_distance,speed,started,started+((actual_distance/speed)*interval '1 hour'),started+((actual_distance/speed)*interval '1 hour')+interval '5 minutes',started+((actual_distance/speed)*interval '2 hours')+interval '5 minutes','outbound',concat('job-',offer.id),natural_capacity,template.cargo_slots) returning * into d;
 insert into public.postal_job_runs(delivery_id,offer_id,profile_id,mascot_id,contact_catalog_key,contact_snapshot,cargo_snapshot,seed_reward) values(d.id,offer.id,me.id,pet.id,template.contact_catalog_key,jsonb_build_object('contactKey',template.contact_catalog_key),jsonb_build_object('cargoKey',template.cargo_key,'slots',template.cargo_slots,'mascotXp',template.mascot_xp),template.seed_reward);
 update public.postal_job_offers set status='departed' where id=offer.id; return d;
end $$;
revoke all on function public.dispatch_postal_job(uuid) from public,anon;
grant execute on function public.dispatch_postal_job(uuid) to authenticated;
