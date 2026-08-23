-- The mailbox may show a sealed correspondence, but never its private contents.
drop function if exists public.open_received_correspondence(uuid,text);
drop function if exists public.list_received_correspondence();

create or replace function public.confirm_delivery_return_reply(target_delivery_id uuid,letter_text_value text)
returns public.delivery_return_replies language plpgsql security definer set search_path=public,auth as $$
declare me uuid; sender public.profiles; d public.deliveries; existing public.delivery_return_replies; depart timestamptz; duration interval; inserted public.delivery_return_replies;
begin
  select * into sender from public.profiles where auth_user_id=auth.uid(); me:=sender.id;
  select * into d from public.deliveries where id=target_delivery_id and receiver_profile_id=me for update;
  if d.id is null then raise exception 'Delivery not available' using errcode='42501'; end if;
  select * into existing from public.delivery_return_replies where delivery_id=d.id;
  if existing.delivery_id is not null then return existing; end if;
  if now()<d.outbound_arrival_at or now()>d.outbound_arrival_at+interval '60 minutes' then raise exception 'Reply window is closed' using errcode='22023'; end if;
  if nullif(btrim(letter_text_value),'') is null or char_length(btrim(letter_text_value))>500 then raise exception 'Letter text must be between 1 and 500 characters' using errcode='22023'; end if;
  depart:=greatest(now(),d.outbound_arrival_at+interval '30 minutes'); duration:=d.return_arrival_at-d.return_start_at;
  insert into public.delivery_return_replies(delivery_id,sender_profile_id,receiver_profile_id,letter_text,departure_at,metadata)
  values(d.id,me,d.sender_profile_id,btrim(letter_text_value),depart,jsonb_build_object('postalFinishing',jsonb_build_object('stamp',jsonb_build_object('kind','default','key','postal.default.stamp','assetKey','stamp.default.front'),'postmark',jsonb_build_object('key','postalMark.custom','model','classic','color','brown','city',sender.postal_base_city,'country',sender.postal_base_country,'date',current_date)))) returning * into inserted;
  update public.deliveries set return_start_at=depart,return_arrival_at=depart+duration,updated_at=now() where id=d.id;
  return inserted;
end; $$;

create function public.list_received_correspondence()
returns table(delivery_id uuid,direction text,arrived_at timestamptz,correspondence_type text,is_opened boolean,sender_name text,sender_profile_id uuid,origin_label text,letter_text text,postcard_message text,postcard_catalog_key text,postcard_name_key text,postcard_asset_key text,sticker_ids text[],sticker_asset_keys text[],return_reply_deadline timestamptz,return_reply_confirmed boolean,stamp_asset_key text,postmark_key text,postmark_model text,postmark_color text,postmark_city text,postmark_country text,postmark_date date)
language plpgsql security definer set search_path=public,auth as $$
declare me uuid;
begin
  select id into me from public.profiles where auth_user_id=auth.uid(); if me is null then raise exception 'Authentication required' using errcode='28000'; end if;
  perform public.settle_arrived_sticker_transfers(me);
  return query
  select d.id,'outbound',d.outbound_arrival_at,c.correspondence_type::text,(o.delivery_id is not null),case when o.delivery_id is not null then p.display_name end,case when o.delivery_id is not null then p.id end,case when o.delivery_id is not null then coalesce(d.origin_place_label,d.origin_label_key) end,case when o.delivery_id is not null then c.letter_text end,case when o.delivery_id is not null then c.postcard_message end,c.postcard_catalog_key,c.metadata->'postcard'->>'nameKey',c.metadata->'postcard'->>'artworkAssetKey',c.sticker_ids,coalesce((select array_agg(s.artwork_asset_key order by x.ordinality) from unnest(c.sticker_ids) with ordinality x(catalog_key,ordinality) join public.official_stickers s on s.catalog_key=x.catalog_key),array[]::text[]),d.outbound_arrival_at+interval '60 minutes',exists(select 1 from public.delivery_return_replies r where r.delivery_id=d.id),c.metadata#>>'{postalFinishing,stamp,assetKey}',coalesce(c.metadata#>>'{postalFinishing,postmark,key}','postalMark.postalCancel'),coalesce(c.metadata#>>'{postalFinishing,postmark,model}','classic'),coalesce(c.metadata#>>'{postalFinishing,postmark,color}','brown'),c.metadata#>>'{postalFinishing,postmark,city}',c.metadata#>>'{postalFinishing,postmark,country}',nullif(c.metadata#>>'{postalFinishing,postmark,date}','')::date
  from public.deliveries d join public.delivery_correspondence_contents c on c.delivery_id=d.id join public.profiles p on p.id=d.sender_profile_id left join public.delivery_mailbox_opens o on o.delivery_id=d.id and o.profile_id=me and o.direction='outbound'
  where d.receiver_profile_id=me and not d.is_tutorial and d.outbound_arrival_at<=now()
  union all
  select d.id,'return',d.return_arrival_at,'letter',(o.delivery_id is not null),case when o.delivery_id is not null then p.display_name end,case when o.delivery_id is not null then p.id end,case when o.delivery_id is not null then coalesce(d.destination_place_label,d.destination_label_key) end,case when o.delivery_id is not null then r.letter_text end,null,null,null,null,array[]::text[],array[]::text[],null,true,r.metadata#>>'{postalFinishing,stamp,assetKey}',coalesce(r.metadata#>>'{postalFinishing,postmark,key}','postalMark.postalCancel'),coalesce(r.metadata#>>'{postalFinishing,postmark,model}','classic'),coalesce(r.metadata#>>'{postalFinishing,postmark,color}','brown'),r.metadata#>>'{postalFinishing,postmark,city}',r.metadata#>>'{postalFinishing,postmark,country}',nullif(r.metadata#>>'{postalFinishing,postmark,date}','')::date
  from public.deliveries d join public.delivery_return_replies r on r.delivery_id=d.id join public.profiles p on p.id=r.sender_profile_id left join public.delivery_mailbox_opens o on o.delivery_id=d.id and o.profile_id=me and o.direction='return'
  where r.receiver_profile_id=me and d.return_arrival_at<=now()
  order by 3 desc;
end; $$;

create function public.open_received_correspondence(target_delivery_id uuid,target_direction text)
returns table(delivery_id uuid,direction text,arrived_at timestamptz,correspondence_type text,is_opened boolean,sender_name text,sender_profile_id uuid,origin_label text,letter_text text,postcard_message text,postcard_catalog_key text,postcard_name_key text,postcard_asset_key text,sticker_ids text[],sticker_asset_keys text[],return_reply_deadline timestamptz,return_reply_confirmed boolean,stamp_asset_key text,postmark_key text,postmark_model text,postmark_color text,postmark_city text,postmark_country text,postmark_date date)
language plpgsql security definer set search_path=public,auth as $$
begin
  if target_direction not in ('outbound','return') then raise exception 'Invalid direction' using errcode='22023'; end if;
  if not exists(select 1 from public.deliveries d where d.id=target_delivery_id and ((target_direction='outbound' and d.receiver_profile_id=(select id from public.profiles where auth_user_id=auth.uid()) and d.outbound_arrival_at<=now()) or (target_direction='return' and d.sender_profile_id=(select id from public.profiles where auth_user_id=auth.uid()) and d.return_arrival_at<=now()))) then raise exception 'Correspondence not available' using errcode='42501'; end if;
  insert into public.delivery_mailbox_opens(delivery_id,profile_id,direction) values(target_delivery_id,(select id from public.profiles where auth_user_id=auth.uid()),target_direction) on conflict do nothing;
  return query select x.* from public.list_received_correspondence() x where x.delivery_id=target_delivery_id and x.direction=target_direction;
end; $$;

revoke all on function public.confirm_delivery_return_reply(uuid,text),public.list_received_correspondence(),public.open_received_correspondence(uuid,text) from public;
grant execute on function public.confirm_delivery_return_reply(uuid,text),public.list_received_correspondence(),public.open_received_correspondence(uuid,text) to authenticated;
