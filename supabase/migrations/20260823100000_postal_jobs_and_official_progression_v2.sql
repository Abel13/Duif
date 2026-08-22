-- Milestone 54: official NPC jobs. All player mutations stay behind SECURITY DEFINER RPCs.

create table public.official_postal_job_contacts (
  catalog_key text primary key,
  name_key text not null,
  role_key text not null,
  place_key text not null,
  status public.catalog_status not null default 'active',
  sort_order integer not null default 0
);

create table public.official_postal_job_templates (
  catalog_key text primary key,
  contact_catalog_key text not null references public.official_postal_job_contacts(catalog_key),
  title_key text not null,
  description_key text not null,
  cargo_key text not null,
  min_mascot_level integer not null check (min_mascot_level > 0),
  max_mascot_level integer check (max_mascot_level is null or max_mascot_level >= min_mascot_level),
  min_distance_km numeric(8,2) not null check (min_distance_km > 0),
  max_distance_km numeric(8,2) not null check (max_distance_km >= min_distance_km),
  cargo_slots integer not null check (cargo_slots between 1 and 4),
  seed_reward integer not null check (seed_reward > 0),
  status public.catalog_status not null default 'active',
  sort_order integer not null default 0
);

create table public.postal_job_cycles (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  replacement_count integer not null default 0 check (replacement_count between 0 and 3),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);
create unique index postal_job_one_open_cycle_per_mascot on public.postal_job_cycles(profile_id,mascot_id) where completed_at is null;

create table public.postal_job_offers (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.postal_job_cycles(id) on delete cascade,
  template_catalog_key text not null references public.official_postal_job_templates(catalog_key),
  status text not null default 'offered' check (status in ('offered','accepted','replaced','departed')),
  destination_latitude double precision not null check (destination_latitude between -90 and 90),
  destination_longitude double precision not null check (destination_longitude between -180 and 180),
  distance_km numeric(10,2) not null check (distance_km > 0),
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  replaced_at timestamptz
);
create unique index postal_job_one_live_offer_per_cycle on public.postal_job_offers(cycle_id) where status in ('offered','accepted');
create unique index postal_job_template_once_per_cycle on public.postal_job_offers(cycle_id,template_catalog_key);

create table public.postal_job_runs (
  delivery_id uuid primary key references public.deliveries(id) on delete cascade,
  offer_id uuid not null unique references public.postal_job_offers(id) on delete restrict,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  mascot_id uuid not null references public.player_mascots(id) on delete cascade,
  contact_catalog_key text not null references public.official_postal_job_contacts(catalog_key),
  contact_snapshot jsonb not null check (jsonb_typeof(contact_snapshot) = 'object'),
  cargo_snapshot jsonb not null check (jsonb_typeof(cargo_snapshot) = 'object'),
  seed_reward integer not null check (seed_reward > 0),
  collected_at timestamptz
);

create table public.profile_seed_balances (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now()
);
create table public.postal_seed_ledger (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  job_delivery_id uuid not null unique references public.postal_job_runs(delivery_id) on delete cascade,
  quantity integer not null check (quantity > 0),
  created_at timestamptz not null default now()
);

create table public.postal_progression_reset_audits (
  id uuid primary key default gen_random_uuid(), project_ref text not null, actor_label text not null,
  profile_count integer not null, mascot_count integer not null, skill_count integer not null,
  award_count integer not null, created_at timestamptz not null default now()
);

alter table public.official_postal_job_contacts enable row level security;
alter table public.official_postal_job_templates enable row level security;
alter table public.postal_job_cycles enable row level security;
alter table public.postal_job_offers enable row level security;
alter table public.postal_job_runs enable row level security;
alter table public.profile_seed_balances enable row level security;
alter table public.postal_seed_ledger enable row level security;
revoke all on public.postal_progression_reset_audits from anon, authenticated;
create policy "Active postal job contacts are readable" on public.official_postal_job_contacts for select using (status='active');
create policy "Active postal job templates are readable" on public.official_postal_job_templates for select using (status='active');
create policy "Owners read job cycles" on public.postal_job_cycles for select using (profile_id=(select id from public.profiles where auth_user_id=auth.uid()));
create policy "Owners read job offers" on public.postal_job_offers for select using (cycle_id in (select id from public.postal_job_cycles where profile_id=(select id from public.profiles where auth_user_id=auth.uid())));
create policy "Owners read job runs" on public.postal_job_runs for select using (profile_id=(select id from public.profiles where auth_user_id=auth.uid()));
create policy "Owners read seed balances" on public.profile_seed_balances for select using (profile_id=(select id from public.profiles where auth_user_id=auth.uid()));
create policy "Owners read seed ledger" on public.postal_seed_ledger for select using (profile_id=(select id from public.profiles where auth_user_id=auth.uid()));

insert into public.official_postal_job_contacts(catalog_key,name_key,role_key,place_key,sort_order) values
('job-contact-farol','postalJobs.contacts.farol.name','postalJobs.contacts.farol.role','postalJobs.contacts.farol.place',1),
('job-contact-horta','postalJobs.contacts.horta.name','postalJobs.contacts.horta.role','postalJobs.contacts.horta.place',2),
('job-contact-estacao','postalJobs.contacts.estacao.name','postalJobs.contacts.estacao.role','postalJobs.contacts.estacao.place',3),
('job-contact-biblioteca','postalJobs.contacts.biblioteca.name','postalJobs.contacts.biblioteca.role','postalJobs.contacts.biblioteca.place',4),
('job-contact-oficina','postalJobs.contacts.oficina.name','postalJobs.contacts.oficina.role','postalJobs.contacts.oficina.place',5),
('job-contact-observatorio','postalJobs.contacts.observatorio.name','postalJobs.contacts.observatorio.role','postalJobs.contacts.observatorio.place',6)
on conflict do nothing;
insert into public.official_postal_job_templates(catalog_key,contact_catalog_key,title_key,description_key,cargo_key,min_mascot_level,max_mascot_level,min_distance_km,max_distance_km,cargo_slots,seed_reward,sort_order) values
('job-farol-lente','job-contact-farol','postalJobs.templates.farol.title','postalJobs.templates.farol.description','postalJobs.cargo.lens',1,4,5,15,1,20,1),
('job-horta-sementes','job-contact-horta','postalJobs.templates.horta.title','postalJobs.templates.horta.description','postalJobs.cargo.seeds',1,4,5,15,2,20,2),
('job-estacao-horarios','job-contact-estacao','postalJobs.templates.estacao.title','postalJobs.templates.estacao.description','postalJobs.cargo.timetable',5,9,15,45,2,50,3),
('job-biblioteca-mapoteca','job-contact-biblioteca','postalJobs.templates.biblioteca.title','postalJobs.templates.biblioteca.description','postalJobs.cargo.maps',5,9,15,45,3,50,4),
('job-oficina-pecas','job-contact-oficina','postalJobs.templates.oficina.title','postalJobs.templates.oficina.description','postalJobs.cargo.parts',10,null,45,100,3,100,5),
('job-observatorio-cartas','job-contact-observatorio','postalJobs.templates.observatorio.title','postalJobs.templates.observatorio.description','postalJobs.cargo.charts',10,null,45,100,4,100,6)
on conflict do nothing;

create or replace function public.postal_job_offer_payload(target_mascot_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare me uuid; pet public.player_mascots; cycle public.postal_job_cycles; offer public.postal_job_offers; template public.official_postal_job_templates; bearing double precision; angular double precision; lat double precision; lon double precision;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select id into me from public.profiles where auth_user_id=auth.uid();
  select * into pet from public.player_mascots where id=target_mascot_id and owner_profile_id=me for update;
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;
  select * into cycle from public.postal_job_cycles where profile_id=me and mascot_id=pet.id and completed_at is null for update;
  if cycle.id is null then insert into public.postal_job_cycles(profile_id,mascot_id) values(me,pet.id) returning * into cycle; end if;
  select * into offer from public.postal_job_offers where cycle_id=cycle.id and status in ('offered','accepted') for update;
  if offer.id is null then
    select * into template from public.official_postal_job_templates t where t.status='active' and pet.level>=t.min_mascot_level and (t.max_mascot_level is null or pet.level<=t.max_mascot_level) and not exists(select 1 from public.postal_job_offers used where used.cycle_id=cycle.id and used.template_catalog_key=t.catalog_key) order by md5(t.catalog_key||cycle.id::text) limit 1;
    if template.catalog_key is null then raise exception 'No postal job is available' using errcode='22023'; end if;
    bearing:=radians((('x'||substr(md5(cycle.id::text||template.catalog_key),1,8))::bit(32)::bigint % 360 + 360) % 360);
    angular:=((template.min_distance_km+template.max_distance_km)/2)/6371;
    select degrees(asin(sin(radians(p.home_latitude))*cos(angular)+cos(radians(p.home_latitude))*sin(angular)*cos(bearing))) into lat from public.profiles p where p.id=me;
    select degrees(radians(p.home_longitude)+atan2(sin(bearing)*sin(angular)*cos(radians(p.home_latitude)),cos(angular)-sin(radians(p.home_latitude))*sin(radians(lat)))) into lon from public.profiles p where p.id=me;
    lon:=mod(lon+540,360)-180;
    insert into public.postal_job_offers(cycle_id,template_catalog_key,destination_latitude,destination_longitude,distance_km) values(cycle.id,template.catalog_key,lat,lon,round(((template.min_distance_km+template.max_distance_km)/2)::numeric,2)) returning * into offer;
  end if;
  select * into template from public.official_postal_job_templates where catalog_key=offer.template_catalog_key;
  return jsonb_build_object('offer',to_jsonb(offer),'template',to_jsonb(template),'replacementsRemaining',3-cycle.replacement_count);
end $$;

create or replace function public.replace_postal_job_offer(target_mascot_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare me uuid; cycle public.postal_job_cycles;
begin
 select id into me from public.profiles where auth_user_id=auth.uid();
 select * into cycle from public.postal_job_cycles where profile_id=me and mascot_id=target_mascot_id and completed_at is null for update;
 if cycle.id is null or cycle.replacement_count>=3 then raise exception 'Postal job replacement is unavailable' using errcode='22023'; end if;
 update public.postal_job_offers set status='replaced',replaced_at=now() where cycle_id=cycle.id and status in ('offered','accepted');
 update public.postal_job_cycles set replacement_count=replacement_count+1 where id=cycle.id;
 return public.postal_job_offer_payload(target_mascot_id);
end $$;

create or replace function public.accept_postal_job_offer(target_offer_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare me uuid; offer public.postal_job_offers;
begin
 select id into me from public.profiles where auth_user_id=auth.uid();
 select o.* into offer from public.postal_job_offers o join public.postal_job_cycles c on c.id=o.cycle_id where o.id=target_offer_id and c.profile_id=me for update;
 if offer.id is null or offer.status not in ('offered','accepted') then raise exception 'Postal job offer is unavailable' using errcode='22023'; end if;
 update public.postal_job_offers set status='accepted',accepted_at=coalesce(accepted_at,now()) where id=offer.id returning * into offer;
 return to_jsonb(offer);
end $$;

create or replace function public.dispatch_postal_job(target_offer_id uuid)
returns public.deliveries language plpgsql security definer set search_path=public,auth as $$
declare me public.profiles; offer public.postal_job_offers; cycle public.postal_job_cycles; template public.official_postal_job_templates; pet public.player_mascots; d public.deliveries; speed numeric(10,2); actual_distance numeric(10,2); started timestamptz:=now();
begin
 select * into me from public.profiles where auth_user_id=auth.uid() for update;
 select o.* into offer from public.postal_job_offers o join public.postal_job_cycles c on c.id=o.cycle_id where o.id=target_offer_id and c.profile_id=me.id for update;
 select * into cycle from public.postal_job_cycles where id=offer.cycle_id;
 if offer.id is null or offer.status<>'accepted' then raise exception 'Postal job must be accepted first' using errcode='22023'; end if;
 select * into template from public.official_postal_job_templates where catalog_key=offer.template_catalog_key and status='active';
 select * into pet from public.player_mascots where id=cycle.mascot_id and owner_profile_id=me.id for update;
 select round((6371*2*asin(least(1,sqrt(power(sin(radians((offer.destination_latitude-me.home_latitude)/2)),2)+cos(radians(me.home_latitude))*cos(radians(offer.destination_latitude))*power(sin(radians((offer.destination_longitude-me.home_longitude)/2)),2)))))::numeric,2) into actual_distance;
 if actual_distance < template.min_distance_km or actual_distance > template.max_distance_km then raise exception 'Postal job destination is no longer compatible' using errcode='22023'; end if;
 if pet.id is null or exists(select 1 from public.deliveries where mascot_id=pet.id and status<>'completed') then raise exception 'Mascot is unavailable' using errcode='23505'; end if;
 if template.cargo_slots > (case when pet.level>=20 then 7 when pet.level>=15 then 6 when pet.level>=10 then 5 when pet.level>=5 then 4 else 3 end) then raise exception 'Postal job cargo does not fit' using errcode='22023'; end if;
 speed:=(28+coalesce((pet.attributes->>'speed')::numeric,0)*4+coalesce((pet.attributes->>'stamina')::numeric,0)*2)::numeric(10,2);
 insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,origin_place_label,destination_latitude,destination_longitude,destination_label_key,destination_place_label,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,travel_slot_capacity,travel_slots_used)
 values(gen_random_uuid(),me.id,me.id,pet.id,me.home_latitude,me.home_longitude,me.home_label_key,me.postal_base_city,offer.destination_latitude,offer.destination_longitude,'postalJobs.destination',template.catalog_key,actual_distance,speed,started,started+((actual_distance/speed)*interval '1 hour'),started+((actual_distance/speed)*interval '1 hour')+interval '10 minutes',started+((actual_distance/speed)*interval '2 hours')+interval '10 minutes','outbound',concat('job-',offer.id),case when pet.level>=20 then 7 when pet.level>=15 then 6 when pet.level>=10 then 5 when pet.level>=5 then 4 else 3 end,template.cargo_slots) returning * into d;
 insert into public.postal_job_runs(delivery_id,offer_id,profile_id,mascot_id,contact_catalog_key,contact_snapshot,cargo_snapshot,seed_reward) select d.id,offer.id,me.id,pet.id,t.contact_catalog_key,jsonb_build_object('contactKey',t.contact_catalog_key),jsonb_build_object('cargoKey',t.cargo_key,'slots',t.cargo_slots),t.seed_reward from public.official_postal_job_templates t where t.catalog_key=template.catalog_key;
 update public.postal_job_offers set status='departed' where id=offer.id;
 return d;
end $$;

create or replace function public.credit_postal_job_seeds()
returns trigger language plpgsql security definer set search_path=public as $$
declare run public.postal_job_runs;
begin
 if new.status='completed' and old.status is distinct from 'completed' then
   select * into run from public.postal_job_runs where delivery_id=new.id for update;
   if run.delivery_id is not null then
     insert into public.postal_seed_ledger(profile_id,job_delivery_id,quantity) values(run.profile_id,run.delivery_id,run.seed_reward) on conflict(job_delivery_id) do nothing;
     if found then insert into public.profile_seed_balances(profile_id,quantity) values(run.profile_id,run.seed_reward) on conflict(profile_id) do update set quantity=profile_seed_balances.quantity+excluded.quantity,updated_at=now(); end if;
     update public.postal_job_runs set collected_at=now() where delivery_id=run.delivery_id;
     update public.postal_job_cycles set completed_at=now() where id=(select cycle_id from public.postal_job_offers where id=run.offer_id);
   end if;
 end if;
 return new;
end $$;
create trigger postal_job_seed_credit_on_completion after update of status on public.deliveries for each row execute function public.credit_postal_job_seeds();

alter table public.delivery_progression_awards drop constraint if exists delivery_progression_awards_formula_version_check;
alter table public.delivery_progression_awards add constraint delivery_progression_awards_formula_version_check check (formula_version in (1,2));
alter table public.delivery_progression_awards alter column formula_version set default 2;
create or replace function public.progression_next_level_xp(curve text,current_level integer) returns integer language sql immutable set search_path=public as $$
 select case curve when 'reputation' then ceil(150*power(current_level::numeric,1.45))::integer when 'mascot' then ceil(100*power(current_level::numeric,1.35))::integer when 'skill' then case current_level when 1 then 40 when 2 then 60 when 3 then 90 when 4 then 130 when 5 then 180 when 6 then 240 when 7 then 310 when 8 then 400 when 9 then 500 else 500 end else null end;
$$;

revoke all on function public.postal_job_offer_payload(uuid),public.replace_postal_job_offer(uuid),public.accept_postal_job_offer(uuid),public.dispatch_postal_job(uuid) from public;
grant execute on function public.postal_job_offer_payload(uuid),public.replace_postal_job_offer(uuid),public.accept_postal_job_offer(uuid),public.dispatch_postal_job(uuid) to authenticated;
