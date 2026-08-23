-- Preserve the sender-selected postal finishing when a postcard is opened by its recipient.
drop function if exists public.open_received_correspondence(uuid,text);
drop function if exists public.list_received_correspondence();

create function public.list_received_correspondence()
returns table(delivery_id uuid,direction text,arrived_at timestamptz,correspondence_type text,is_opened boolean,sender_name text,sender_profile_id uuid,origin_label text,letter_text text,postcard_message text,postcard_catalog_key text,postcard_name_key text,postcard_asset_key text,sticker_ids text[],return_reply_deadline timestamptz,return_reply_confirmed boolean,stamp_asset_key text,postmark_key text)
language plpgsql security definer set search_path=public,auth as $$
declare me uuid;
begin
  select id into me from public.profiles where auth_user_id=auth.uid(); if me is null then raise exception 'Authentication required' using errcode='28000'; end if;
  perform public.settle_arrived_sticker_transfers(me);
  return query
  select d.id,'outbound',d.outbound_arrival_at,c.correspondence_type::text,(o.delivery_id is not null),case when o.delivery_id is not null then p.display_name end,case when o.delivery_id is not null then p.id end,case when o.delivery_id is not null then coalesce(d.origin_place_label,d.origin_label_key) end,case when o.delivery_id is not null then c.letter_text end,case when o.delivery_id is not null then c.postcard_message end,case when o.delivery_id is not null then c.postcard_catalog_key end,case when o.delivery_id is not null then c.metadata->'postcard'->>'nameKey' end,case when o.delivery_id is not null then c.metadata->'postcard'->>'artworkAssetKey' end,case when o.delivery_id is not null then c.sticker_ids else array[]::text[] end,d.outbound_arrival_at+interval '60 minutes',exists(select 1 from public.delivery_return_replies r where r.delivery_id=d.id),case when o.delivery_id is not null then c.metadata#>>'{postalFinishing,stamp,assetKey}' end,case when o.delivery_id is not null then coalesce(c.metadata#>>'{postalFinishing,postmark,key}','postalMark.postalCancel') end
  from public.deliveries d join public.delivery_correspondence_contents c on c.delivery_id=d.id join public.profiles p on p.id=d.sender_profile_id left join public.delivery_mailbox_opens o on o.delivery_id=d.id and o.profile_id=me and o.direction='outbound'
  where d.receiver_profile_id=me and not d.is_tutorial and d.outbound_arrival_at<=now()
  union all
  select d.id,'return',d.return_arrival_at,'letter',(o.delivery_id is not null),case when o.delivery_id is not null then p.display_name end,case when o.delivery_id is not null then p.id end,case when o.delivery_id is not null then coalesce(d.destination_place_label,d.destination_label_key) end,case when o.delivery_id is not null then r.letter_text end,null,null,null,null,array[]::text[],null,true,case when o.delivery_id is not null then c.metadata#>>'{postalFinishing,stamp,assetKey}' end,case when o.delivery_id is not null then coalesce(c.metadata#>>'{postalFinishing,postmark,key}','postalMark.postalCancel') end
  from public.deliveries d join public.delivery_return_replies r on r.delivery_id=d.id join public.delivery_correspondence_contents c on c.delivery_id=d.id join public.profiles p on p.id=r.sender_profile_id left join public.delivery_mailbox_opens o on o.delivery_id=d.id and o.profile_id=me and o.direction='return'
  where r.receiver_profile_id=me and d.return_arrival_at<=now()
  order by 3 desc;
end; $$;

create function public.open_received_correspondence(target_delivery_id uuid,target_direction text)
returns table(delivery_id uuid,direction text,arrived_at timestamptz,correspondence_type text,is_opened boolean,sender_name text,sender_profile_id uuid,origin_label text,letter_text text,postcard_message text,postcard_catalog_key text,postcard_name_key text,postcard_asset_key text,sticker_ids text[],return_reply_deadline timestamptz,return_reply_confirmed boolean,stamp_asset_key text,postmark_key text)
language plpgsql security definer set search_path=public,auth as $$
begin
  if target_direction not in ('outbound','return') then raise exception 'Invalid direction' using errcode='22023'; end if;
  if not exists(select 1 from public.deliveries d where d.id=target_delivery_id and ((target_direction='outbound' and d.receiver_profile_id=(select id from public.profiles where auth_user_id=auth.uid()) and d.outbound_arrival_at<=now()) or (target_direction='return' and d.sender_profile_id=(select id from public.profiles where auth_user_id=auth.uid()) and d.return_arrival_at<=now()))) then raise exception 'Correspondence not available' using errcode='42501'; end if;
  insert into public.delivery_mailbox_opens(delivery_id,profile_id,direction) values(target_delivery_id,(select id from public.profiles where auth_user_id=auth.uid()),target_direction) on conflict do nothing;
  return query select x.* from public.list_received_correspondence() x where x.delivery_id=target_delivery_id and x.direction=target_direction;
end; $$;

revoke all on function public.list_received_correspondence(),public.open_received_correspondence(uuid,text) from public;
grant execute on function public.list_received_correspondence(),public.open_received_correspondence(uuid,text) to authenticated;
