drop function if exists public.confirm_delivery_return_reply(uuid,text);

create or replace function public.get_delivery_return_reply_context(target_delivery_id uuid)
returns table(delivery_id uuid,sender_profile_id uuid,sender_name text,mascot_id uuid,mascot_name text,origin_label text,destination_label text,reply_deadline timestamptz,reply_confirmed boolean)
language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  if me is null then raise exception 'Authentication required' using errcode='28000'; end if;
  return query select d.id,p.id,p.display_name,m.id,m.name,coalesce(d.destination_place_label,d.destination_label_key),coalesce(d.origin_place_label,d.origin_label_key),d.outbound_arrival_at+interval '60 minutes',exists(select 1 from public.delivery_return_replies r where r.delivery_id=d.id)
  from public.deliveries d join public.profiles p on p.id=d.sender_profile_id join public.player_mascots m on m.id=d.mascot_id join public.delivery_correspondence_contents c on c.delivery_id=d.id
  where d.id=target_delivery_id and d.receiver_profile_id=me and c.correspondence_type='letter' and not d.is_tutorial and not exists(select 1 from public.postal_job_runs j where j.delivery_id=d.id) and exists(select 1 from public.delivery_mailbox_opens o where o.delivery_id=d.id and o.profile_id=me and o.direction='outbound') and d.outbound_arrival_at<=now();
end $$;

create or replace function public.confirm_delivery_return_reply(target_delivery_id uuid,reply_payload jsonb)
returns public.delivery_return_replies language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me public.profiles; d public.deliveries; existing public.delivery_return_replies; inserted public.delivery_return_replies; content_type public.correspondence_type; depart timestamptz; deadline timestamptz; text_value text; stamp_id uuid; stamp_row public.inventory_items; model text; color text; reputation integer; model_level integer; color_level integer; finishing jsonb; cursor_time timestamptz; segment record; midpoint timestamptz; lat numeric; lon numeric; weather jsonb; season text; climate numeric; leg_multiplier numeric; speed numeric; duration interval;
begin
  if auth.uid() is null or reply_payload is null or jsonb_typeof(reply_payload)<>'object' then raise exception 'Invalid reply' using errcode='22023'; end if;
  perform pg_advisory_xact_lock(hashtextextended(target_delivery_id::text,55));
  select * into me from public.profiles where auth_user_id=auth.uid();
  select * into d from public.deliveries where id=target_delivery_id and receiver_profile_id=me.id for update;
  if d.id is null then raise exception 'Delivery not available' using errcode='42501'; end if;
  select * into existing from public.delivery_return_replies where delivery_id=d.id;
  if existing.delivery_id is not null then return existing; end if;
  select correspondence_type into content_type from public.delivery_correspondence_contents where delivery_id=d.id;
  if content_type<>'letter' or d.is_tutorial or exists(select 1 from public.postal_job_runs j where j.delivery_id=d.id) then raise exception 'Reply not available' using errcode='22023'; end if;
  deadline:=d.outbound_arrival_at+interval '60 minutes';
  if now()<d.outbound_arrival_at or now()>deadline then raise exception 'Reply window is closed' using errcode='22023'; end if;
  if exists(select 1 from public.delivery_route_segments where delivery_id=d.id and leg='return' and state<>'planned') then raise exception 'Return already started' using errcode='22023'; end if;
  text_value:=btrim(coalesce(reply_payload->>'letterText',''));
  if text_value='' or char_length(text_value)>500 then raise exception 'Letter text must be between 1 and 500 characters' using errcode='22023'; end if;
  begin stamp_id:=nullif(reply_payload#>>'{postalFinishing,stampInventoryItemId}','')::uuid; exception when invalid_text_representation then raise exception 'Invalid postal stamp' using errcode='22023'; end;
  model:=coalesce(nullif(btrim(reply_payload#>>'{postalFinishing,postmarkModel}'),''),'classic'); color:=coalesce(nullif(btrim(reply_payload#>>'{postalFinishing,postmarkColor}'),''),'brown');
  select coalesce(level,1) into reputation from public.profile_postal_progression where profile_id=me.id; reputation:=coalesce(reputation,1);
  model_level:=case model when 'classic' then 1 when 'route' then 5 when 'wing' then 10 end; color_level:=case color when 'brown' then 1 when 'blue' then 3 when 'red' then 5 when 'green' then 7 when 'gold' then 10 when 'plum' then 13 when 'charcoal' then 16 when 'teal' then 20 end;
  if model_level is null or color_level is null then raise exception 'Invalid postmark customization' using errcode='22023'; end if;
  if reputation<model_level or reputation<color_level then raise exception 'Postmark customization is locked' using errcode='42501'; end if;
  if stamp_id is null then finishing:=jsonb_build_object('stamp',jsonb_build_object('kind','default','key','postal.default.stamp','assetKey','stamp.default.front')); else select * into stamp_row from public.inventory_items where id=stamp_id and owner_profile_id=me.id and category='stamps'; if stamp_row.id is null then raise exception 'Postal stamp is not owned by current profile' using errcode='42501'; end if; finishing:=jsonb_build_object('stamp',jsonb_build_object('kind','inventory','inventoryItemId',stamp_row.id,'nameKey',stamp_row.name_key,'assetKey',stamp_row.thumbnail_asset_key)); end if;
  finishing:=finishing||jsonb_build_object('postmark',jsonb_build_object('key','postalMark.custom','model',model,'color',color,'city',me.postal_base_city,'country',me.postal_base_country,'date',current_date,'reputationLevelAtSend',reputation));
  depart:=greatest(now(),d.outbound_arrival_at+interval '30 minutes');
  insert into public.delivery_return_replies(delivery_id,sender_profile_id,receiver_profile_id,letter_text,departure_at,metadata) values(d.id,me.id,d.sender_profile_id,text_value,depart,jsonb_build_object('version',2,'postalFinishing',finishing)) returning * into inserted;
  if exists(select 1 from public.delivery_route_segments where delivery_id=d.id and leg='return') then
    cursor_time:=depart; leg_multiplier:=coalesce((d.travel_modifiers->>'returnSpeedMultiplier')::numeric,1);
    for segment in select * from public.delivery_route_segments where delivery_id=d.id and leg='return' and state='planned' order by segment_index for update loop
      midpoint:=cursor_time+interval '1 hour'; lat:=d.destination_latitude+(d.origin_latitude-d.destination_latitude)*((segment.route_fraction_start+segment.route_fraction_end)/2); lon:=d.destination_longitude+(d.origin_longitude-d.destination_longitude)*((segment.route_fraction_start+segment.route_fraction_end)/2);
      weather:=public.virtual_travel_weather(d.id,'return',segment.segment_index,date_bin(interval '3 hours',midpoint,timestamptz '2000-01-01'),lat,lon); season:=public.travel_season(midpoint,lat); climate:=public.travel_effective_multiplier(weather->>'category',(weather->>'windSpeedKmh')::numeric,(weather->>'isDay')::boolean,season); speed:=greatest(d.animal_speed_kmh*.60,least(d.animal_speed_kmh*1.25,d.animal_speed_kmh*leg_multiplier*climate)); duration:=(segment.distance_km/nullif(speed,0))*interval '1 hour';
      update public.delivery_route_segments set estimated_start_at=cursor_time,estimated_end_at=cursor_time+duration,weather_source='virtual',weather_snapshot=weather,modifiers=jsonb_build_object('weather',climate,'night',case when (weather->>'isDay')::boolean then 1 else .98 end,'season',season,'mascot',leg_multiplier,'equipment',1,'backpack',1,'skills',1,'familiarity',1),effective_speed_kmh=speed,updated_at=now() where id=segment.id; cursor_time:=cursor_time+duration;
    end loop;
    update public.deliveries set travel_rules_snapshot=jsonb_set(travel_rules_snapshot,'{destinationStopSeconds}',to_jsonb(greatest(0,extract(epoch from (depart-outbound_arrival_at))::integer)),true),return_start_at=depart,return_arrival_at=cursor_time,updated_at=now() where id=d.id;
    perform public.resolve_delivery_route_segments(d.id,now());
  else
    update public.deliveries set return_start_at=depart,return_arrival_at=depart+(d.return_arrival_at-d.return_start_at),updated_at=now() where id=d.id;
  end if;
  return inserted;
end $$;

revoke all on function public.get_delivery_return_reply_context(uuid),public.confirm_delivery_return_reply(uuid,jsonb) from public,anon;
grant execute on function public.get_delivery_return_reply_context(uuid),public.confirm_delivery_return_reply(uuid,jsonb) to authenticated;
