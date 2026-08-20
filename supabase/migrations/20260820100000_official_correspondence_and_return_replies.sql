-- Milestones 52 and 53: official postcards/stickers, travel slots, and return letters.

drop trigger if exists enforce_mvp_letter_correspondence on public.delivery_correspondence_contents;
drop function if exists public.enforce_mvp_letter_correspondence();

create table public.official_postcards (
  catalog_key text primary key,
  name_key text not null,
  description_key text not null,
  artwork_asset_key text not null,
  availability text not null check (availability in ('base', 'tutorial', 'city', 'event', 'paid')),
  status public.catalog_status not null default 'draft',
  sort_order integer not null default 0
);

create table public.official_stickers (
  catalog_key text primary key,
  name_key text not null,
  description_key text not null,
  artwork_asset_key text not null,
  status public.catalog_status not null default 'draft',
  sort_order integer not null default 0
);

create table public.profile_postcard_unlocks (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  postcard_catalog_key text not null references public.official_postcards(catalog_key),
  source text not null,
  unlocked_at timestamptz not null default now(),
  primary key (profile_id, postcard_catalog_key)
);

create table public.profile_sticker_balances (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  sticker_catalog_key text not null references public.official_stickers(catalog_key),
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (profile_id, sticker_catalog_key)
);

alter table public.delivery_correspondence_contents
  add column postcard_catalog_key text references public.official_postcards(catalog_key);

alter table public.deliveries
  add column travel_slot_capacity integer not null default 3 check (travel_slot_capacity > 0),
  add column travel_slots_used integer not null default 1 check (travel_slots_used > 0),
  add constraint deliveries_travel_slots_fit check (travel_slots_used <= travel_slot_capacity);

create table public.delivery_sticker_transfers (
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  sticker_catalog_key text not null references public.official_stickers(catalog_key),
  quantity integer not null check (quantity between 1 and 3),
  recipient_profile_id uuid not null references public.profiles(id) on delete cascade,
  settled_at timestamptz,
  snapshot jsonb not null,
  primary key (delivery_id, sticker_catalog_key)
);

create table public.delivery_return_replies (
  delivery_id uuid primary key references public.deliveries(id) on delete cascade,
  sender_profile_id uuid not null references public.profiles(id) on delete cascade,
  receiver_profile_id uuid not null references public.profiles(id) on delete cascade,
  letter_text text not null check (char_length(btrim(letter_text)) between 1 and 500),
  confirmed_at timestamptz not null default now(),
  departure_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb
);

create table public.delivery_mailbox_opens (
  delivery_id uuid not null references public.deliveries(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  direction text not null check (direction in ('outbound', 'return')),
  opened_at timestamptz not null default now(),
  primary key (delivery_id, profile_id, direction)
);

alter table public.official_postcards enable row level security;
alter table public.official_stickers enable row level security;
alter table public.profile_postcard_unlocks enable row level security;
alter table public.profile_sticker_balances enable row level security;
alter table public.delivery_sticker_transfers enable row level security;
alter table public.delivery_return_replies enable row level security;
alter table public.delivery_mailbox_opens enable row level security;

create policy "Active postcards are readable" on public.official_postcards for select using (status = 'active');
create policy "Active stickers are readable" on public.official_stickers for select using (status = 'active');
create policy "Owners read postcard unlocks" on public.profile_postcard_unlocks for select using (
  profile_id = (select id from public.profiles where auth_user_id = auth.uid())
);
create policy "Owners read sticker balances" on public.profile_sticker_balances for select using (
  profile_id = (select id from public.profiles where auth_user_id = auth.uid())
);

insert into public.official_postcards(catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order) values
  ('postcard-duif-base','officialPostcards.base.name','officialPostcards.base.description','postcard.base.front','base','active',1),
  ('postcard-inaugural','tutorial.rewards.inauguralPostcard.name','tutorial.rewards.inauguralPostcard.description','postcard.inaugural.front','tutorial','active',2);

insert into public.official_stickers(catalog_key,name_key,description_key,artwork_asset_key,status,sort_order) values
  ('sticker-sun-stamp','send.content.stickers.sunStamp','officialStickers.sunStamp.description','shop.thumbnail.sunnyRouteSticker','active',1),
  ('sticker-blue-envelope','send.content.stickers.blueEnvelope','officialStickers.blueEnvelope.description','shop.thumbnail.blueEnvelopeSticker','active',2),
  ('sticker-route-spark','send.content.stickers.routeSpark','officialStickers.routeSpark.description','collectible.firstJourneyStamp','active',3);

insert into public.official_translation_keys(translation_key) values
  ('officialPostcards.base.name'),('officialPostcards.base.description'),
  ('officialStickers.sunStamp.description'),('officialStickers.blueEnvelope.description'),
  ('officialStickers.routeSpark.description') on conflict do nothing;

insert into public.profile_sticker_balances(profile_id,sticker_catalog_key,quantity)
select p.id,s.catalog_key,3 from public.profiles p cross join public.official_stickers s on conflict do nothing;

create or replace function public.provision_initial_correspondence_inventory()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform 1 from public.profiles where id=target_profile_id for update;
  insert into public.profile_sticker_balances(profile_id,sticker_catalog_key,quantity)
  select new.id,catalog_key,3 from public.official_stickers where status='active' on conflict do nothing;
  return new;
end; $$;
create trigger provision_initial_correspondence_inventory after insert on public.profiles
for each row execute function public.provision_initial_correspondence_inventory();

create or replace function public.settle_arrived_sticker_transfers(target_profile_id uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
  insert into public.profile_sticker_balances(profile_id,sticker_catalog_key,quantity)
  select target_profile_id,t.sticker_catalog_key,sum(t.quantity)::integer
  from public.delivery_sticker_transfers t join public.deliveries d on d.id=t.delivery_id
  where t.recipient_profile_id=target_profile_id and t.settled_at is null and d.outbound_arrival_at<=now()
  group by t.sticker_catalog_key
  on conflict(profile_id,sticker_catalog_key) do update set
    quantity=public.profile_sticker_balances.quantity+excluded.quantity,updated_at=now();
  update public.delivery_sticker_transfers t set settled_at=now() from public.deliveries d
  where d.id=t.delivery_id and t.recipient_profile_id=target_profile_id and t.settled_at is null and d.outbound_arrival_at<=now();
end; $$;

create or replace function public.list_owned_postcards()
returns table(catalog_key text,name_key text,description_key text,artwork_asset_key text,availability text)
language plpgsql security definer set search_path=public,auth as $$
declare pid uuid;
begin
  select id into pid from public.profiles where auth_user_id=auth.uid();
  if pid is null then raise exception 'Authentication required' using errcode='28000'; end if;
  return query select p.catalog_key,p.name_key,p.description_key,p.artwork_asset_key,p.availability
  from public.official_postcards p where p.status='active' and (
    p.availability='base' or exists(select 1 from public.profile_postcard_unlocks u where u.profile_id=pid and u.postcard_catalog_key=p.catalog_key)
    or (p.catalog_key='postcard-inaugural' and exists(select 1 from public.inventory_items i join public.reward_items r on r.id=i.reward_item_id where i.owner_profile_id=pid and r.catalog_key='reward-tutorial-inaugural-postcard'))
  ) order by p.sort_order,p.catalog_key;
end; $$;

create or replace function public.list_owned_stickers()
returns table(catalog_key text,name_key text,description_key text,artwork_asset_key text,quantity integer)
language plpgsql security definer set search_path=public,auth as $$
declare pid uuid;
begin
  select id into pid from public.profiles where auth_user_id=auth.uid();
  if pid is null then raise exception 'Authentication required' using errcode='28000'; end if;
  perform public.settle_arrived_sticker_transfers(pid);
  return query select s.catalog_key,s.name_key,s.description_key,s.artwork_asset_key,coalesce(b.quantity,0)
  from public.official_stickers s left join public.profile_sticker_balances b on b.profile_id=pid and b.sticker_catalog_key=s.catalog_key
  where s.status='active' order by s.sort_order,s.catalog_key;
end; $$;

create or replace function public.create_delivery_from_selection(
  mascot_id uuid, friend_profile_id uuid, correspondence_catalog_key text, content_payload jsonb
)
returns public.deliveries language plpgsql security definer set search_path=public,auth as $$
declare
  me public.profiles; friend public.profiles; pet public.player_mascots; option_row public.correspondence_options;
  stamp_row public.inventory_items; card public.official_postcards; inserted public.deliveries;
  distance_value numeric(10,2); speed_value numeric(10,2); outbound_start timestamptz:=now();
  outbound_arrival timestamptz; return_duration interval; capacity integer; payload_type text:=content_payload->>'type';
  sticker_ids text[]:=array[]::text[]; sticker_key text; sticker_count integer; stamp_id uuid;
  postmark text; finishing jsonb; origin_label text; destination_label text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if content_payload is null or jsonb_typeof(content_payload)<>'object' then raise exception 'Invalid correspondence content' using errcode='22023'; end if;
  select * into me from public.profiles where auth_user_id=auth.uid();
  select * into pet from public.player_mascots where id=mascot_id and owner_profile_id=me.id for update;
  if pet.id is null then raise exception 'Mascot not found for current profile' using errcode='42501'; end if;
  if exists(select 1 from public.deliveries active_delivery where active_delivery.mascot_id=pet.id and active_delivery.status<>'completed') then raise exception 'Mascot already has an active delivery' using errcode='23505'; end if;
  select * into friend from public.profiles where id=friend_profile_id;
  if friend.id is null or not exists(select 1 from public.friendships f where f.status='accepted' and ((f.requester_profile_id=me.id and f.addressee_profile_id=friend.id) or (f.addressee_profile_id=me.id and f.requester_profile_id=friend.id))) then raise exception 'Friendship not accepted' using errcode='42501'; end if;
  select * into option_row from public.correspondence_options where catalog_key=correspondence_catalog_key and status='active';
  if option_row.id is null or payload_type is distinct from option_row.type::text or option_row.type='smallGift' then raise exception 'Correspondence option not available' using errcode='22023'; end if;
  if option_row.type='letter' then
    if nullif(btrim(content_payload->>'letterText'),'') is null or char_length(btrim(content_payload->>'letterText'))>500 then raise exception 'Letter text must be between 1 and 500 characters' using errcode='22023'; end if;
  elsif option_row.type='postcard' then
    select * into card from public.official_postcards where catalog_key=content_payload->>'postcardCatalogKey' and status='active';
    if card.catalog_key is null or char_length(coalesce(content_payload->>'postcardMessage',''))>180 then raise exception 'Invalid postcard content' using errcode='22023'; end if;
    if card.availability<>'base' and not exists(select 1 from public.profile_postcard_unlocks u where u.profile_id=me.id and u.postcard_catalog_key=card.catalog_key)
      and not(card.catalog_key='postcard-inaugural' and exists(select 1 from public.inventory_items i join public.reward_items r on r.id=i.reward_item_id where i.owner_profile_id=me.id and r.catalog_key='reward-tutorial-inaugural-postcard')) then raise exception 'Postcard not unlocked' using errcode='42501'; end if;
  elsif option_row.type='sticker' then
    if jsonb_typeof(content_payload->'stickerIds')<>'array' then raise exception 'Invalid sticker content' using errcode='22023'; end if;
    select coalesce(array_agg(value),array[]::text[]) into sticker_ids from jsonb_array_elements_text(content_payload->'stickerIds') value;
    if cardinality(sticker_ids) not between 1 and 3 then raise exception 'Invalid sticker count' using errcode='22023'; end if;
    perform public.settle_arrived_sticker_transfers(me.id);
    for sticker_key,sticker_count in select value,count(*)::integer from unnest(sticker_ids) value group by value loop
      update public.profile_sticker_balances set quantity=quantity-sticker_count,updated_at=now()
      where profile_id=me.id and sticker_catalog_key=sticker_key and quantity>=sticker_count;
      if not found then raise exception 'Sticker quantity unavailable' using errcode='22023'; end if;
    end loop;
  end if;
  begin stamp_id:=nullif(content_payload#>>'{postalFinishing,stampInventoryItemId}','')::uuid; exception when invalid_text_representation then raise exception 'Invalid postal stamp' using errcode='22023'; end;
  postmark:=coalesce(nullif(btrim(content_payload#>>'{postalFinishing,postmarkKey}'),''),'postalMark.postalCancel');
  if postmark<>'postalMark.postalCancel' then raise exception 'Postal mark is not available' using errcode='22023'; end if;
  if stamp_id is null then finishing:=jsonb_build_object('stamp',jsonb_build_object('kind','default','key','postal.default.stamp','assetKey','stamp.default.front'),'postmark',jsonb_build_object('key',postmark)); else
    select * into stamp_row from public.inventory_items where id=stamp_id and owner_profile_id=me.id and category='stamps';
    if stamp_row.id is null then raise exception 'Postal stamp is not owned by current profile' using errcode='42501'; end if;
    finishing:=jsonb_build_object('stamp',jsonb_build_object('kind','inventory','inventoryItemId',stamp_row.id,'nameKey',stamp_row.name_key,'assetKey',stamp_row.thumbnail_asset_key),'postmark',jsonb_build_object('key',postmark));
  end if;
  capacity:=case when pet.level>=20 then 7 when pet.level>=15 then 6 when pet.level>=10 then 5 when pet.level>=5 then 4 else 3 end;
  origin_label:=nullif(concat_ws(' • ',nullif(concat_ws(', ',nullif(btrim(me.postal_base_city),''),nullif(btrim(me.postal_base_state),'')),''),nullif(btrim(me.postal_base_country),'')),'');
  destination_label:=nullif(concat_ws(' • ',nullif(concat_ws(', ',nullif(btrim(friend.postal_base_city),''),nullif(btrim(friend.postal_base_state),'')),''),nullif(btrim(friend.postal_base_country),'')),'');
  distance_value:=round((6371*2*asin(least(1,sqrt(power(sin(radians((friend.home_latitude-me.home_latitude)/2)),2)+cos(radians(me.home_latitude))*cos(radians(friend.home_latitude))*power(sin(radians((friend.home_longitude-me.home_longitude)/2)),2)))))::numeric,2);
  speed_value:=(28+coalesce((pet.attributes->>'speed')::numeric,0)*4+coalesce((pet.attributes->>'stamina')::numeric,0)*2)::numeric(10,2);
  outbound_arrival:=outbound_start+((distance_value/speed_value)*interval '1 hour'); return_duration:=(distance_value/speed_value)*interval '1 hour';
  insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,correspondence_option_id,origin_latitude,origin_longitude,origin_label_key,origin_place_label,destination_latitude,destination_longitude,destination_label_key,destination_place_label,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,travel_slot_capacity,travel_slots_used)
  values(gen_random_uuid(),me.id,friend.id,pet.id,option_row.id,me.home_latitude,me.home_longitude,me.home_label_key,origin_label,friend.home_latitude,friend.home_longitude,friend.home_label_key,destination_label,distance_value,speed_value,outbound_start,outbound_arrival,outbound_arrival+interval '60 minutes',outbound_arrival+interval '60 minutes'+return_duration,'outbound',concat(pet.id,'-',friend.id,'-',option_row.catalog_key),capacity,1) returning * into inserted;
  insert into public.delivery_correspondence_contents(id,delivery_id,correspondence_type,letter_text,postcard_message,postcard_variant,postcard_catalog_key,sticker_ids,gift_note,metadata)
  values(gen_random_uuid(),inserted.id,option_row.type,case when option_row.type='letter' then btrim(content_payload->>'letterText') end,case when option_row.type='postcard' then nullif(btrim(content_payload->>'postcardMessage'),'') end,case when option_row.type='postcard' then card.availability end,case when option_row.type='postcard' then card.catalog_key end,case when option_row.type='sticker' then sticker_ids else array[]::text[] end,null,jsonb_build_object('createdBy','create_delivery_from_selection','postalFinishing',finishing,'postcard',case when card.catalog_key is null then null else jsonb_build_object('catalogKey',card.catalog_key,'nameKey',card.name_key,'artworkAssetKey',card.artwork_asset_key) end));
  if option_row.type='sticker' then
    insert into public.delivery_sticker_transfers(delivery_id,sticker_catalog_key,quantity,recipient_profile_id,snapshot)
    select inserted.id,s.catalog_key,count(*)::integer,friend.id,jsonb_build_object('catalogKey',s.catalog_key,'nameKey',s.name_key,'artworkAssetKey',s.artwork_asset_key)
    from unnest(sticker_ids) value join public.official_stickers s on s.catalog_key=value group by s.catalog_key,s.name_key,s.artwork_asset_key;
  end if;
  return inserted;
end; $$;

create or replace function public.confirm_delivery_return_reply(target_delivery_id uuid,letter_text_value text)
returns public.delivery_return_replies language plpgsql security definer set search_path=public,auth as $$
declare me uuid; d public.deliveries; existing public.delivery_return_replies; depart timestamptz; duration interval; inserted public.delivery_return_replies;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  select * into d from public.deliveries where id=target_delivery_id and receiver_profile_id=me for update;
  if d.id is null then raise exception 'Delivery not available' using errcode='42501'; end if;
  select * into existing from public.delivery_return_replies where delivery_id=d.id;
  if existing.delivery_id is not null then return existing; end if;
  if now()<d.outbound_arrival_at or now()>d.outbound_arrival_at+interval '60 minutes' then raise exception 'Reply window is closed' using errcode='22023'; end if;
  if nullif(btrim(letter_text_value),'') is null or char_length(btrim(letter_text_value))>500 then raise exception 'Letter text must be between 1 and 500 characters' using errcode='22023'; end if;
  depart:=greatest(now(),d.outbound_arrival_at+interval '30 minutes'); duration:=d.return_arrival_at-d.return_start_at;
  insert into public.delivery_return_replies(delivery_id,sender_profile_id,receiver_profile_id,letter_text,departure_at,metadata)
  values(d.id,me,d.sender_profile_id,btrim(letter_text_value),depart,jsonb_build_object('postalFinishing',jsonb_build_object('stamp',jsonb_build_object('kind','default','key','postal.default.stamp','assetKey','stamp.default.front'),'postmark',jsonb_build_object('key','postalMark.postalCancel')))) returning * into inserted;
  update public.deliveries set return_start_at=depart,return_arrival_at=depart+duration,updated_at=now() where id=d.id;
  return inserted;
end; $$;

create or replace function public.list_received_correspondence()
returns table(delivery_id uuid,direction text,arrived_at timestamptz,correspondence_type text,is_opened boolean,sender_name text,sender_profile_id uuid,origin_label text,letter_text text,postcard_message text,postcard_catalog_key text,postcard_name_key text,postcard_asset_key text,sticker_ids text[],return_reply_deadline timestamptz,return_reply_confirmed boolean)
language plpgsql security definer set search_path=public,auth as $$
declare me uuid;
begin
  select id into me from public.profiles where auth_user_id=auth.uid(); if me is null then raise exception 'Authentication required' using errcode='28000'; end if;
  perform public.settle_arrived_sticker_transfers(me);
  return query
  select d.id,'outbound',d.outbound_arrival_at,c.correspondence_type::text,(o.delivery_id is not null),case when o.delivery_id is not null then p.display_name end,case when o.delivery_id is not null then p.id end,case when o.delivery_id is not null then coalesce(d.origin_place_label,d.origin_label_key) end,case when o.delivery_id is not null then c.letter_text end,case when o.delivery_id is not null then c.postcard_message end,case when o.delivery_id is not null then c.postcard_catalog_key end,case when o.delivery_id is not null then c.metadata->'postcard'->>'nameKey' end,case when o.delivery_id is not null then c.metadata->'postcard'->>'artworkAssetKey' end,case when o.delivery_id is not null then c.sticker_ids else array[]::text[] end,d.outbound_arrival_at+interval '60 minutes',exists(select 1 from public.delivery_return_replies r where r.delivery_id=d.id)
  from public.deliveries d join public.delivery_correspondence_contents c on c.delivery_id=d.id join public.profiles p on p.id=d.sender_profile_id left join public.delivery_mailbox_opens o on o.delivery_id=d.id and o.profile_id=me and o.direction='outbound'
  where d.receiver_profile_id=me and not d.is_tutorial and d.outbound_arrival_at<=now()
  union all
  select d.id,'return',d.return_arrival_at,'letter',(o.delivery_id is not null),case when o.delivery_id is not null then p.display_name end,case when o.delivery_id is not null then p.id end,case when o.delivery_id is not null then coalesce(d.destination_place_label,d.destination_label_key) end,case when o.delivery_id is not null then r.letter_text end,null,null,null,null,array[]::text[],null,true
  from public.deliveries d join public.delivery_return_replies r on r.delivery_id=d.id join public.profiles p on p.id=r.sender_profile_id left join public.delivery_mailbox_opens o on o.delivery_id=d.id and o.profile_id=me and o.direction='return'
  where r.receiver_profile_id=me and d.return_arrival_at<=now()
  order by 3 desc;
end; $$;

create or replace function public.open_received_correspondence(target_delivery_id uuid,target_direction text)
returns table(delivery_id uuid,direction text,arrived_at timestamptz,correspondence_type text,is_opened boolean,sender_name text,sender_profile_id uuid,origin_label text,letter_text text,postcard_message text,postcard_catalog_key text,postcard_name_key text,postcard_asset_key text,sticker_ids text[],return_reply_deadline timestamptz,return_reply_confirmed boolean)
language plpgsql security definer set search_path=public,auth as $$
begin
  if target_direction not in ('outbound','return') then raise exception 'Invalid direction' using errcode='22023'; end if;
  if not exists(select 1 from public.deliveries d where d.id=target_delivery_id and ((target_direction='outbound' and d.receiver_profile_id=(select id from public.profiles where auth_user_id=auth.uid()) and d.outbound_arrival_at<=now()) or (target_direction='return' and d.sender_profile_id=(select id from public.profiles where auth_user_id=auth.uid()) and d.return_arrival_at<=now()))) then raise exception 'Correspondence not available' using errcode='42501'; end if;
  insert into public.delivery_mailbox_opens(delivery_id,profile_id,direction) values(target_delivery_id,(select id from public.profiles where auth_user_id=auth.uid()),target_direction) on conflict do nothing;
  return query select x.* from public.list_received_correspondence() x where x.delivery_id=target_delivery_id and x.direction=target_direction;
end; $$;

revoke all on function public.list_owned_postcards() from public;
revoke all on function public.list_owned_stickers() from public;
revoke all on function public.settle_arrived_sticker_transfers(uuid) from public;
revoke all on function public.provision_initial_correspondence_inventory() from public;
revoke all on function public.confirm_delivery_return_reply(uuid,text) from public;
revoke all on function public.list_received_correspondence() from public;
revoke all on function public.open_received_correspondence(uuid,text) from public;
grant execute on function public.list_owned_postcards(),public.list_owned_stickers(),public.confirm_delivery_return_reply(uuid,text),public.list_received_correspondence(),public.open_received_correspondence(uuid,text) to authenticated;
grant select on public.official_postcards,public.official_stickers,public.profile_postcard_unlocks,public.profile_sticker_balances to authenticated;
