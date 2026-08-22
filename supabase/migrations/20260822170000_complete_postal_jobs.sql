-- Milestone 54 completion. Keep the original jobs migration immutable and refine its contracts here.

alter table public.official_postal_job_templates
  add column mascot_xp integer not null default 30 check (mascot_xp > 0);

update public.official_postal_job_templates
set mascot_xp = case
  when min_mascot_level <= 4 then 30
  when min_mascot_level <= 9 then 75
  else 150
end;

-- Two choices per contact provide the initial offer plus all three unique replacements in a level band.
insert into public.official_postal_job_templates
  (catalog_key, contact_catalog_key, title_key, description_key, cargo_key, min_mascot_level, max_mascot_level, min_distance_km, max_distance_km, cargo_slots, seed_reward, mascot_xp, sort_order)
values
  ('job-farol-sinal','job-contact-farol','postalJobs.templates.farolSignal.title','postalJobs.templates.farolSignal.description','postalJobs.cargo.signal',1,4,5,15,1,20,30,2),
  ('job-horta-mudas','job-contact-horta','postalJobs.templates.hortaSeedlings.title','postalJobs.templates.hortaSeedlings.description','postalJobs.cargo.seedlings',1,4,5,15,2,20,30,4),
  ('job-estacao-sinais','job-contact-estacao','postalJobs.templates.estacaoSignals.title','postalJobs.templates.estacaoSignals.description','postalJobs.cargo.signals',5,9,15,45,3,50,75,6),
  ('job-biblioteca-folios','job-contact-biblioteca','postalJobs.templates.bibliotecaFolios.title','postalJobs.templates.bibliotecaFolios.description','postalJobs.cargo.folios',5,9,15,45,3,50,75,8),
  ('job-oficina-tinta','job-contact-oficina','postalJobs.templates.oficinaInk.title','postalJobs.templates.oficinaInk.description','postalJobs.cargo.ink',10,null,45,100,4,100,150,10),
  ('job-observatorio-lentes','job-contact-observatorio','postalJobs.templates.observatorioLenses.title','postalJobs.templates.observatorioLenses.description','postalJobs.cargo.lenses',10,null,45,100,4,100,150,12)
on conflict (catalog_key) do update set
  title_key=excluded.title_key, description_key=excluded.description_key, cargo_key=excluded.cargo_key,
  min_mascot_level=excluded.min_mascot_level, max_mascot_level=excluded.max_mascot_level,
  min_distance_km=excluded.min_distance_km, max_distance_km=excluded.max_distance_km,
  cargo_slots=excluded.cargo_slots, seed_reward=excluded.seed_reward, mascot_xp=excluded.mascot_xp,
  sort_order=excluded.sort_order, status='active';

create or replace function public.dispatch_postal_job(target_offer_id uuid)
returns public.deliveries language plpgsql security definer set search_path=public,auth as $$
declare me public.profiles; offer public.postal_job_offers; cycle public.postal_job_cycles; template public.official_postal_job_templates; pet public.player_mascots; d public.deliveries; speed numeric(10,2); actual_distance numeric(10,2); started timestamptz:=now();
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
 if template.cargo_slots > (case when pet.level>=20 then 7 when pet.level>=15 then 6 when pet.level>=10 then 5 when pet.level>=5 then 4 else 3 end) then raise exception 'Postal job cargo does not fit' using errcode='22023'; end if;
 speed:=(28+coalesce((pet.attributes->>'speed')::numeric,0)*4+coalesce((pet.attributes->>'stamina')::numeric,0)*2)::numeric(10,2);
 insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,origin_place_label,destination_latitude,destination_longitude,destination_label_key,destination_place_label,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,travel_slot_capacity,travel_slots_used)
 values(gen_random_uuid(),me.id,me.id,pet.id,me.home_latitude,me.home_longitude,me.home_label_key,me.postal_base_city,offer.destination_latitude,offer.destination_longitude,'postalJobs.destination',template.catalog_key,actual_distance,speed,started,started+((actual_distance/speed)*interval '1 hour'),started+((actual_distance/speed)*interval '1 hour')+interval '5 minutes',started+((actual_distance/speed)*interval '2 hours')+interval '5 minutes','outbound',concat('job-',offer.id),case when pet.level>=20 then 7 when pet.level>=15 then 6 when pet.level>=10 then 5 when pet.level>=5 then 4 else 3 end,template.cargo_slots) returning * into d;
 insert into public.postal_job_runs(delivery_id,offer_id,profile_id,mascot_id,contact_catalog_key,contact_snapshot,cargo_snapshot,seed_reward) values
   (d.id,offer.id,me.id,pet.id,template.contact_catalog_key,jsonb_build_object('contactKey',template.contact_catalog_key),jsonb_build_object('cargoKey',template.cargo_key,'slots',template.cargo_slots,'mascotXp',template.mascot_xp),template.seed_reward);
 update public.postal_job_offers set status='departed' where id=offer.id;
 return d;
end $$;

-- Jobs use their fixed mascot XP table instead of normal delivery progression.
create or replace function public.collect_delivery_progression_on_completion()
returns trigger language plpgsql security definer set search_path=public,auth as $$
begin
  if new.status='completed' and old.status is distinct from 'completed' and not new.is_tutorial
     and not exists(select 1 from public.postal_job_runs where delivery_id=new.id) then
    perform public.apply_delivery_progression(new.id);
  end if;
  return new;
end $$;

create or replace function public.credit_postal_job_seeds()
returns trigger language plpgsql security definer set search_path=public as $$
declare run public.postal_job_runs; pet public.player_mascots; awarded_xp integer; level_ups integer:=0;
begin
 if new.status='completed' and old.status is distinct from 'completed' then
   select * into run from public.postal_job_runs where delivery_id=new.id for update;
   if run.delivery_id is not null then
     insert into public.postal_seed_ledger(profile_id,job_delivery_id,quantity) values(run.profile_id,run.delivery_id,run.seed_reward) on conflict(job_delivery_id) do nothing;
     if found then
       insert into public.profile_seed_balances(profile_id,quantity) values(run.profile_id,run.seed_reward) on conflict(profile_id) do update set quantity=profile_seed_balances.quantity+excluded.quantity,updated_at=now();
       awarded_xp:=(run.cargo_snapshot->>'mascotXp')::integer;
       select * into pet from public.player_mascots where id=run.mascot_id for update;
       while pet.xp+awarded_xp>=pet.next_level_xp and pet.level<100 loop
         pet.xp:=pet.xp-pet.next_level_xp; pet.level:=pet.level+1; pet.next_level_xp:=public.progression_next_level_xp('mascot',pet.level); level_ups:=level_ups+1;
       end loop;
       pet.xp:=pet.xp+awarded_xp;
       update public.player_mascots set level=pet.level,xp=pet.xp,next_level_xp=pet.next_level_xp,updated_at=now() where id=pet.id;
       update public.postal_job_runs set collected_at=now(),cargo_snapshot=cargo_snapshot||jsonb_build_object('mascotXp',awarded_xp,'levelUps',level_ups) where delivery_id=run.delivery_id;
       update public.postal_job_cycles set completed_at=now() where id=(select cycle_id from public.postal_job_offers where id=run.offer_id);
     end if;
   end if;
 end if;
 return new;
end $$;
