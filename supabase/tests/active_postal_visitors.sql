begin;
\ir player_fixtures.sql

insert into public.player_mascots(id,owner_profile_id,template_id,name,level,xp,next_level_xp,attributes,trait,equipment,skills,appearance)
select fixture.id,'00000000-0000-4000-8000-000000000001',source.template_id,fixture.name,source.level,source.xp,source.next_level_xp,source.attributes,source.trait,source.equipment,source.skills,source.appearance
from public.player_mascots source
cross join (values
  ('00000000-0000-4000-8000-000000001001'::uuid,'Visitor 1'),
  ('00000000-0000-4000-8000-000000001002'::uuid,'Visitor 2'),
  ('00000000-0000-4000-8000-000000001003'::uuid,'Visitor 3'),
  ('00000000-0000-4000-8000-000000001004'::uuid,'Visitor 4'),
  ('00000000-0000-4000-8000-000000001005'::uuid,'Postcard visitor'),
  ('00000000-0000-4000-8000-000000001006'::uuid,'Spare visitor'),
  ('00000000-0000-4000-8000-000000001007'::uuid,'Sticker visitor'),
  ('00000000-0000-4000-8000-000000001008'::uuid,'Tutorial visitor')
) fixture(id,name)
where source.id='00000000-0000-4000-8000-000000000203';

insert into public.deliveries(id,sender_profile_id,receiver_profile_id,mascot_id,origin_latitude,origin_longitude,origin_label_key,destination_latitude,destination_longitude,destination_label_key,distance_km,animal_speed_kmh,outbound_start_at,outbound_arrival_at,return_start_at,return_arrival_at,status,reward_seed,is_tutorial)
select ('00000000-0000-4000-8000-00000000200'||fixture.ordinal)::uuid,'00000000-0000-4000-8000-000000000001','00000000-0000-4000-8000-000000000101',fixture.mascot_id,-23.30,-51.16,'test.origin',-23.42,-51.93,'test.destination',10,20,now()-interval '20 minutes',now()-interval '10 minutes',now()+make_interval(mins=>fixture.ordinal*10),now()+make_interval(mins=>fixture.ordinal*10+30),'outbound','active-visitor-'||fixture.ordinal,fixture.ordinal=8
from (values
  (1,'00000000-0000-4000-8000-000000001001'::uuid),
  (2,'00000000-0000-4000-8000-000000001002'::uuid),
  (3,'00000000-0000-4000-8000-000000001003'::uuid),
  (4,'00000000-0000-4000-8000-000000001004'::uuid),
  (5,'00000000-0000-4000-8000-000000001005'::uuid),
  (6,'00000000-0000-4000-8000-000000001006'::uuid),
  (7,'00000000-0000-4000-8000-000000001007'::uuid),
  (8,'00000000-0000-4000-8000-000000001008'::uuid)
) fixture(ordinal,mascot_id);

insert into public.delivery_correspondence_contents(id,delivery_id,correspondence_type,letter_text,postcard_message)
select gen_random_uuid(),delivery.id,case when delivery.reward_seed='active-visitor-5' then 'postcard'::public.correspondence_type when delivery.reward_seed='active-visitor-7' then 'sticker'::public.correspondence_type else 'letter'::public.correspondence_type end,case when delivery.reward_seed not in ('active-visitor-5','active-visitor-7') then 'Private letter' end,case when delivery.reward_seed='active-visitor-5' then 'Postcard' end
from public.deliveries delivery where delivery.reward_seed like 'active-visitor-%';

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000101',true);

do $$
declare ids uuid[];
begin
  select array_agg(visitor.delivery_id order by visitor.departs_at) into ids from public.list_active_postal_visitors() visitor;
  if ids<>array['00000000-0000-4000-8000-000000002001'::uuid,'00000000-0000-4000-8000-000000002002'::uuid,'00000000-0000-4000-8000-000000002003'::uuid] then raise exception 'Visitors were not limited and ordered by urgency: %',ids; end if;
  if exists(select 1 from public.list_active_postal_visitors() visitor where to_jsonb(visitor) ?| array['sender_name','letter_text','origin_latitude','destination_latitude']) then raise exception 'Visitor payload leaked private correspondence data'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000102',true);
do $$ begin if exists(select 1 from public.list_active_postal_visitors()) then raise exception 'Another profile could see postal visitors'; end if; end $$;

reset role;
insert into public.delivery_return_replies(delivery_id,sender_profile_id,receiver_profile_id,letter_text,departure_at)
select delivery_id,'00000000-0000-4000-8000-000000000101','00000000-0000-4000-8000-000000000001','Reply',now()+interval '10 minutes'
from unnest(array['00000000-0000-4000-8000-000000002001'::uuid,'00000000-0000-4000-8000-000000002002'::uuid,'00000000-0000-4000-8000-000000002003'::uuid,'00000000-0000-4000-8000-000000002004'::uuid,'00000000-0000-4000-8000-000000002006'::uuid]) delivery_id;

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000000101',true);
do $$
declare visitor_types text[];
begin
  if exists(select 1 from public.list_active_postal_visitors() where delivery_id='00000000-0000-4000-8000-000000002001') then raise exception 'Answered visitor remained active'; end if;
  select array_agg(correspondence_type order by departs_at) into visitor_types from public.list_active_postal_visitors();
  if visitor_types<>array['postcard','sticker'] then raise exception 'Non-reply correspondence visitors were not preserved: %',visitor_types; end if;
end $$;

rollback;
