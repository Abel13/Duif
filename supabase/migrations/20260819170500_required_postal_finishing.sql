-- Milestone 52A: every dispatched correspondence keeps one immutable stamp and postmark snapshot.
create or replace function public.create_delivery_from_selection(
  mascot_id uuid, friend_profile_id uuid, correspondence_catalog_key text, content_payload jsonb
)
returns public.deliveries language plpgsql security definer set search_path = public, auth as $$
declare
  current_profile public.profiles; selected_friend public.profiles; selected_mascot public.player_mascots;
  selected_correspondence public.correspondence_options; selected_stamp public.inventory_items;
  inserted_delivery public.deliveries; distance_value numeric(10,2); speed_value numeric(10,2);
  outbound_start timestamptz := now(); payload_type text := content_payload ->> 'type';
  sticker_ids_value text[] := array[]::text[]; origin_place_label_value text; destination_place_label_value text;
  requested_stamp_id uuid; requested_postmark_key text; postal_finishing jsonb;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if content_payload is null or jsonb_typeof(content_payload) <> 'object' then raise exception 'Invalid correspondence content' using errcode = '22023'; end if;
  select * into current_profile from public.profiles where auth_user_id = auth.uid();
  if current_profile.id is null then raise exception 'Current profile not found' using errcode = '28000'; end if;
  select * into selected_mascot from public.player_mascots where id = mascot_id and owner_profile_id = current_profile.id;
  if selected_mascot.id is null then raise exception 'Mascot not found for current profile' using errcode = '42501'; end if;
  select * into selected_friend from public.profiles where id = friend_profile_id;
  if selected_friend.id is null then raise exception 'Friend profile not found' using errcode = '22023'; end if;
  if not exists (select 1 from public.friendships where status = 'accepted' and ((requester_profile_id = current_profile.id and addressee_profile_id = selected_friend.id) or (addressee_profile_id = current_profile.id and requester_profile_id = selected_friend.id))) then raise exception 'Friendship not accepted' using errcode = '42501'; end if;
  select * into selected_correspondence from public.correspondence_options where catalog_key = correspondence_catalog_key and status = 'active';
  if selected_correspondence.id is null or payload_type is distinct from selected_correspondence.type::text then raise exception 'Correspondence option not available' using errcode = '22023'; end if;
  if selected_correspondence.type = 'letter' and (nullif(btrim(content_payload ->> 'letterText'), '') is null or char_length(btrim(content_payload ->> 'letterText')) > 500) then raise exception 'Letter text must be between 1 and 500 characters' using errcode = '22023';
  elsif selected_correspondence.type = 'postcard' and ((content_payload ->> 'postcardVariant') not in ('city','event','photo') or char_length(coalesce(content_payload ->> 'postcardMessage','')) > 180) then raise exception 'Invalid postcard content' using errcode = '22023';
  elsif selected_correspondence.type = 'sticker' then
    if jsonb_typeof(content_payload -> 'stickerIds') <> 'array' then raise exception 'Invalid sticker content' using errcode = '22023'; end if;
    select coalesce(array_agg(value), array[]::text[]) into sticker_ids_value from jsonb_array_elements_text(content_payload -> 'stickerIds') value;
    if cardinality(sticker_ids_value) not between 1 and 3 then raise exception 'Invalid sticker count' using errcode = '22023'; end if;
  elsif selected_correspondence.type = 'smallGift' and char_length(coalesce(content_payload ->> 'giftNote','')) > 180 then raise exception 'Gift note must be 180 characters or less' using errcode = '22023'; end if;
  if nullif(content_payload #>> '{postalFinishing,stampInventoryItemId}', '') is not null then begin requested_stamp_id := (content_payload #>> '{postalFinishing,stampInventoryItemId}')::uuid; exception when invalid_text_representation then raise exception 'Invalid postal stamp' using errcode = '22023'; end; end if;
  requested_postmark_key := coalesce(nullif(btrim(content_payload #>> '{postalFinishing,postmarkKey}'), ''), 'postalMark.postalCancel');
  if requested_postmark_key <> 'postalMark.postalCancel' then raise exception 'Postal mark is not available' using errcode = '22023'; end if;
  if requested_stamp_id is null then postal_finishing := jsonb_build_object('stamp', jsonb_build_object('kind','default','key','postal.default.stamp'), 'postmark', jsonb_build_object('key', requested_postmark_key));
  else
    select * into selected_stamp from public.inventory_items where id = requested_stamp_id and owner_profile_id = current_profile.id and category = 'stamps';
    if selected_stamp.id is null then raise exception 'Postal stamp is not owned by current profile' using errcode = '42501'; end if;
    postal_finishing := jsonb_build_object('stamp', jsonb_build_object('kind','inventory','inventoryItemId',selected_stamp.id,'nameKey',selected_stamp.name_key,'assetKey',selected_stamp.thumbnail_asset_key), 'postmark', jsonb_build_object('key', requested_postmark_key));
  end if;
  origin_place_label_value := nullif(concat_ws(' • ', nullif(concat_ws(', ', nullif(btrim(current_profile.postal_base_city), ''), nullif(btrim(current_profile.postal_base_state), '')), ''), nullif(btrim(current_profile.postal_base_country), '')), '');
  destination_place_label_value := nullif(concat_ws(' • ', nullif(concat_ws(', ', nullif(btrim(selected_friend.postal_base_city), ''), nullif(btrim(selected_friend.postal_base_state), '')), ''), nullif(btrim(selected_friend.postal_base_country), '')), '');
  distance_value := round((6371 * 2 * asin(least(1, sqrt(power(sin(radians((selected_friend.home_latitude-current_profile.home_latitude)/2)),2) + cos(radians(current_profile.home_latitude))*cos(radians(selected_friend.home_latitude))*power(sin(radians((selected_friend.home_longitude-current_profile.home_longitude)/2)),2)))))::numeric, 2);
  speed_value := (28 + coalesce((selected_mascot.attributes->>'speed')::numeric,0)*4 + coalesce((selected_mascot.attributes->>'stamina')::numeric,0)*2)::numeric(10,2);
  insert into public.deliveries (id, sender_profile_id, receiver_profile_id, mascot_id, correspondence_option_id, origin_latitude, origin_longitude, origin_label_key, origin_place_label, destination_latitude, destination_longitude, destination_label_key, destination_place_label, distance_km, animal_speed_kmh, outbound_start_at, outbound_arrival_at, return_start_at, return_arrival_at, status, reward_seed) values (gen_random_uuid(), current_profile.id, selected_friend.id, selected_mascot.id, selected_correspondence.id, current_profile.home_latitude, current_profile.home_longitude, current_profile.home_label_key, origin_place_label_value, selected_friend.home_latitude, selected_friend.home_longitude, selected_friend.home_label_key, destination_place_label_value, distance_value, speed_value, outbound_start, outbound_start + ((distance_value/speed_value)*interval '1 hour'), outbound_start + ((distance_value/speed_value)*interval '1 hour') + interval '30 minutes', outbound_start + ((distance_value/speed_value)*interval '2 hours') + interval '30 minutes', 'outbound', concat(selected_mascot.id, '-', selected_friend.id, '-', selected_correspondence.catalog_key)) returning * into inserted_delivery;
  insert into public.delivery_correspondence_contents (id, delivery_id, correspondence_type, letter_text, postcard_message, postcard_variant, sticker_ids, gift_note, metadata) values (gen_random_uuid(), inserted_delivery.id, selected_correspondence.type, case when selected_correspondence.type='letter' then btrim(content_payload->>'letterText') end, case when selected_correspondence.type='postcard' then nullif(btrim(content_payload->>'postcardMessage'),'') end, case when selected_correspondence.type='postcard' then content_payload->>'postcardVariant' end, case when selected_correspondence.type='sticker' then sticker_ids_value else array[]::text[] end, case when selected_correspondence.type='smallGift' then nullif(btrim(content_payload->>'giftNote'),'') end, jsonb_build_object('createdBy','create_delivery_from_selection','postalFinishing',postal_finishing));
  return inserted_delivery;
end;
$$;

revoke all on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) from public;
grant execute on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) to authenticated;

drop function public.list_received_letters();
create or replace function public.list_received_letters()
returns table(arrived_at timestamptz, delivery_id uuid, letter_text text, origin_label text, sender_name text, sender_profile_id uuid, stamp_kind text, stamp_name_key text, stamp_asset_key text, postmark_key text)
language sql security definer set search_path = public, auth as $$
  select d.outbound_arrival_at, d.id, c.letter_text, coalesce(d.origin_place_label, d.origin_label_key), sender.display_name, sender.id, coalesce(c.metadata->'postalFinishing'->'stamp'->>'kind', 'default'), c.metadata->'postalFinishing'->'stamp'->>'nameKey', c.metadata->'postalFinishing'->'stamp'->>'assetKey', coalesce(c.metadata->'postalFinishing'->'postmark'->>'key', 'postalMark.postalCancel')
  from public.deliveries d join public.delivery_correspondence_contents c on c.delivery_id = d.id join public.profiles sender on sender.id = d.sender_profile_id
  where d.receiver_profile_id = (select id from public.profiles where auth_user_id = auth.uid()) and d.outbound_arrival_at <= now() and c.correspondence_type = 'letter'
  order by d.outbound_arrival_at desc;
$$;
revoke all on function public.list_received_letters() from public;
grant execute on function public.list_received_letters() to authenticated;
