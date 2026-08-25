begin;
\ir player_fixtures.sql

insert into public.timezone_boundary_imports(id,source,version,source_sha256,boundary_count)
values('00000000-0000-4000-8000-000000008900','timezone-boundary-builder','postmark-test',repeat('f',64),2);
insert into public.timezone_boundaries(import_id,time_zone,priority,geometry) values
('00000000-0000-4000-8000-000000008900','America/Sao_Paulo',0,extensions.st_multi(extensions.st_geomfromtext('POLYGON((-50 -30,-30 -30,-30 -10,-50 -10,-50 -30))',4326))),
('00000000-0000-4000-8000-000000008900','Pacific/Kiritimati',0,extensions.st_multi(extensions.st_geomfromtext('POLYGON((150 0,170 0,170 20,150 20,150 0))',4326)));

do $$
declare west jsonb; east jsonb; fallback jsonb;
begin
  west:=public.postal_postmark_time_snapshot('2026-08-25 02:30:00+00',-20,-40);
  east:=public.postal_postmark_time_snapshot('2026-08-24 12:30:00+00',10,160);
  fallback:=public.postal_postmark_time_snapshot('2026-08-25 02:30:00+00',0,0);
  if west->>'date'<>'2026-08-24' or west->>'timeZone'<>'America/Sao_Paulo' or west->>'dateSource'<>'origin-local-v1' then raise exception 'Negative-offset origin date is invalid: %',west; end if;
  if east->>'date'<>'2026-08-25' or east->>'timeZone'<>'Pacific/Kiritimati' then raise exception 'Positive-offset origin date is invalid: %',east; end if;
  if fallback->>'date'<>'2026-08-25' or fallback->>'timeZone'<>'UTC' or fallback->>'dateSource'<>'utc-fallback-v1' then raise exception 'UTC fallback is invalid: %',fallback; end if;
end $$;

insert into public.friendships(id,requester_profile_id,addressee_profile_id,status)
values('00000000-0000-4000-8000-000000008001','00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101','accepted');

update public.correspondence_options set status='active' where catalog_key='correspondence-sticker';

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$
begin
  if (select count(*) from public.correspondence_options where status='active' and type in ('letter','postcard'))<>2 then
    raise exception 'Authenticated players cannot read the active correspondence catalog';
  end if;
end $$;

do $$
declare d public.deliveries; before_count integer; after_count integer;
begin
  if (select count(*) from public.list_owned_postcards())<>1 then raise exception 'Base postcard was not universally available'; end if;
  select quantity into before_count from public.list_owned_stickers() where catalog_key='sticker-sun-stamp';
  d:=public.create_delivery_from_selection('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000101','correspondence-sticker','{"type":"sticker","stickerIds":["sticker-sun-stamp","sticker-sun-stamp"],"postalFinishing":{"postmarkKey":"postalMark.postalCancel"}}');
  select quantity into after_count from public.list_owned_stickers() where catalog_key='sticker-sun-stamp';
  if after_count<>before_count-2 then raise exception 'Sticker copies were not consumed atomically'; end if;
  if d.travel_slot_capacity<>3 or d.travel_slots_used<>1 then raise exception 'Travel slot snapshot is invalid'; end if;
end $$;
reset role;
update public.deliveries set status='completed',outbound_start_at=now()-interval '20 minutes',outbound_arrival_at=now()-interval '10 minutes' where reward_seed like '%correspondence-sticker';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$
declare d public.deliveries;
begin
  d:=public.create_delivery_from_selection('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000101','correspondence-postcard','{"type":"postcard","postcardCatalogKey":"postcard-duif-base","postcardMessage":"Olá!","postalFinishing":{"postmarkKey":"postalMark.postalCancel"}}');
end $$;
reset role;
do $$ begin if not exists(select 1 from public.delivery_correspondence_contents c join public.deliveries d on d.id=c.delivery_id where d.reward_seed like '%correspondence-postcard' and c.postcard_catalog_key='postcard-duif-base' and c.metadata->'postcard'->>'catalogKey'='postcard-duif-base') then raise exception 'Postcard snapshot was not persisted'; end if; end $$;
update public.deliveries set status='completed' where reward_seed like '%correspondence-postcard';
insert into public.official_postcards(catalog_key,name_key,description_key,artwork_asset_key,availability,status,sort_order) values('postcard-paid-test','officialPostcards.base.name','officialPostcards.base.description','postcard.inaugural.front','paid','active',99);
insert into public.profile_postcard_unlocks(profile_id,postcard_catalog_key,source) values('00000000-0000-4000-8000-000000000001','postcard-paid-test','test');
insert into public.profile_postcard_balances(profile_id,postcard_catalog_key,quantity) values('00000000-0000-4000-8000-000000000001','postcard-paid-test',2);
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$ declare d public.deliveries; begin
  d:=public.create_delivery_from_selection('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000101','correspondence-postcard','{"type":"postcard","postcardCatalogKey":"postcard-paid-test","postcardMessage":"Arte finita","postalFinishing":{"postmarkKey":"postalMark.postalCancel"}}');
  if (select quantity from public.list_owned_postcards() where catalog_key='postcard-paid-test')<>1 then raise exception 'Paid postcard quantity was not exposed after consumption'; end if;
end $$;
reset role;
do $$ begin if (select quantity from public.profile_postcard_balances where profile_id='00000000-0000-4000-8000-000000000001' and postcard_catalog_key='postcard-paid-test')<>1 then raise exception 'Paid postcard copy was not consumed'; end if; end $$;
update public.deliveries set status='completed' where reward_seed like '%correspondence-postcard';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);

do $$
declare d public.deliveries;
begin
  d:=public.create_delivery_from_selection('00000000-0000-4000-8000-000000000203','00000000-0000-4000-8000-000000000101','correspondence-letter','{"type":"letter","letterText":"Carta de ida","postalFinishing":{"postmarkKey":"postalMark.postalCancel"}}');
end $$;
reset role;
update public.deliveries set outbound_start_at=now()-interval '20 minutes',outbound_arrival_at=now()-interval '10 minutes',return_start_at=now()+interval '50 minutes',return_arrival_at=now()+interval '70 minutes' where reward_seed like '%correspondence-letter';
set local role authenticated;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000101',true);
do $$
declare item record; opened record; context record; reply public.delivery_return_replies; repeated public.delivery_return_replies; reply_preview jsonb;
begin
  if (select quantity from public.list_owned_stickers() where catalog_key='sticker-sun-stamp')<>5 then raise exception 'Arrived sticker copies were not granted exactly once'; end if;
  select * into item from public.list_received_correspondence() where correspondence_type='letter' and direction='outbound';
  if (select count(*) from public.list_active_postal_visitors())<>1 then raise exception 'Active letter visitor was not listed exactly once'; end if;
  if exists(select 1 from public.list_active_postal_visitors() visitor where visitor.delivery_id<>item.delivery_id or visitor.departs_at<=now()) then raise exception 'Visitor payload or departure is invalid'; end if;
  if (select to_jsonb(visitor) ?| array['sender_name','letter_text','origin_latitude','destination_latitude'] from public.list_active_postal_visitors() visitor limit 1) then raise exception 'Private correspondence data leaked through visitor payload'; end if;
  if item.sender_name is not null or item.letter_text is not null then raise exception 'Surprise sender/content leaked before opening'; end if;
  if item.postmark_model is null or item.postmark_color is null or item.postmark_city is null or item.postmark_country is null or item.postmark_date is null then raise exception 'Sealed letter did not expose its immutable visual finishing'; end if;
  select * into opened from public.open_received_correspondence(item.delivery_id,'outbound');
  if opened.sender_name<>'Sender' or opened.letter_text<>'Carta de ida' then raise exception 'Opened correspondence did not reveal its snapshot'; end if;
  select * into context from public.get_delivery_return_reply_context(item.delivery_id);
  if context.sender_name<>'Sender' or context.mascot_name is null or context.reply_deadline is null then raise exception 'Reply context is incomplete'; end if;
  reply_preview:=public.preview_origin_postmark(item.delivery_id);
  if (reply_preview->>'stampedAt')::timestamptz<item.arrived_at+interval '30 minutes' or reply_preview->>'date' is null then raise exception 'Return postmark preview ignored the authoritative departure'; end if;
  reply:=public.confirm_delivery_return_reply(item.delivery_id,'{"version":2,"letterText":"Resposta de volta","postalFinishing":{"postmarkModel":"classic","postmarkColor":"brown"}}'::jsonb);
  if reply.departure_at<item.arrived_at+interval '30 minutes' then raise exception 'Reply bypassed minimum rest'; end if;
  if reply.metadata#>>'{postalFinishing,postmark,model}'<>'classic' or reply.metadata#>>'{postalFinishing,postmark,color}'<>'brown' or reply.metadata#>>'{postalFinishing,postmark,city}' is null or reply.metadata#>>'{postalFinishing,postmark,country}' is null or reply.metadata#>>'{postalFinishing,postmark,date}' is null or reply.metadata#>>'{postalFinishing,stamp,assetKey}' is null then raise exception 'Reply finishing snapshot is incomplete'; end if;
  repeated:=public.confirm_delivery_return_reply(item.delivery_id,'{"version":2,"letterText":"Texto diferente","postalFinishing":{"postmarkModel":"route","postmarkColor":"blue"}}'::jsonb);
  if repeated.delivery_id<>reply.delivery_id then raise exception 'Reply confirmation is not idempotent'; end if;
  if exists(select 1 from public.list_active_postal_visitors()) then raise exception 'Answered visitor remained active'; end if;
end $$;

reset role;
do $$
declare before_content text; before_arrival timestamptz; before_snapshot jsonb; after_snapshot jsonb;
begin
  perform public.backfill_authoritative_postmark_dates();
  select c.letter_text,d.outbound_arrival_at,c.metadata#>'{postalFinishing,postmark}' into before_content,before_arrival,before_snapshot
  from public.deliveries d join public.delivery_correspondence_contents c on c.delivery_id=d.id where d.reward_seed like '%correspondence-letter' order by d.outbound_start_at desc limit 1;
  perform public.backfill_authoritative_postmark_dates();
  select c.metadata#>'{postalFinishing,postmark}' into after_snapshot
  from public.deliveries d join public.delivery_correspondence_contents c on c.delivery_id=d.id where d.reward_seed like '%correspondence-letter' order by d.outbound_start_at desc limit 1;
  if before_snapshot is distinct from after_snapshot then raise exception 'Idempotent backfill changed an authoritative snapshot'; end if;
  if before_content is distinct from (select c.letter_text from public.deliveries d join public.delivery_correspondence_contents c on c.delivery_id=d.id where d.reward_seed like '%correspondence-letter' order by d.outbound_start_at desc limit 1) then raise exception 'Backfill changed correspondence content'; end if;
  if before_arrival is distinct from (select d.outbound_arrival_at from public.deliveries d where d.reward_seed like '%correspondence-letter' order by d.outbound_start_at desc limit 1) then raise exception 'Backfill changed arrival time'; end if;
end $$;
update public.deliveries set return_start_at=now()-interval '10 minutes',return_arrival_at=now()-interval '1 minute' where reward_seed like '%correspondence-letter';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000001',true);
do $$ declare item record; opened record; begin
  select * into item from public.list_received_correspondence() where correspondence_type='letter' and direction='return';
  if item.sender_name is not null or item.letter_text is not null then raise exception 'Return reply leaked before opening'; end if;
  if item.stamp_asset_key is null or item.postmark_city is null or item.postmark_date is null then raise exception 'Return reply did not persist its postal finishing'; end if;
  select * into opened from public.open_received_correspondence(item.delivery_id,'return');
  if opened.sender_name<>'Recipient' or opened.letter_text<>'Resposta de volta' then raise exception 'Return reply was not delivered to the original sender'; end if;
end $$;
reset role;
delete from public.delivery_return_replies
where delivery_id in (select id from public.deliveries where reward_seed like '%correspondence-letter');
update public.delivery_route_segments
set state='completed',completed_at=coalesce(completed_at,now()),updated_at=now()
where delivery_id in (select id from public.deliveries where reward_seed like '%correspondence-letter')
  and leg='return';
update public.deliveries
set status='completed',return_start_at=now()-interval '10 minutes',return_arrival_at=now()-interval '1 minute'
where reward_seed like '%correspondence-letter';
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000101',true);
do $$
declare delivery_id_value uuid;
begin
  select id into delivery_id_value from public.deliveries where reward_seed like '%correspondence-letter';
  if exists(select 1 from public.get_delivery_return_reply_context(delivery_id_value)) then
    raise exception 'A stale reply context remained available after the mascot returned';
  end if;
end $$;
reset role;
rollback;
