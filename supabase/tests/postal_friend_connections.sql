begin;

insert into auth.users (id,email,aud,role,created_at,updated_at) values
  ('10000000-0000-4000-8000-000000009801','postal-one@example.test','authenticated','authenticated',now(),now()),
  ('10000000-0000-4000-8000-000000009802','postal-two@example.test','authenticated','authenticated',now(),now()),
  ('10000000-0000-4000-8000-000000009803','postal-three@example.test','authenticated','authenticated',now(),now());

insert into public.profiles(id,auth_user_id,display_name,home_latitude,home_longitude,home_label_key,postal_base_street,postal_base_neighborhood,postal_base_city,postal_base_state,postal_base_country)
values
  ('20000000-0000-4000-8000-000000009801','10000000-0000-4000-8000-000000009801','Postal One',0,0,'locations.londrina','','','Londrina','PR','BR'),
  ('20000000-0000-4000-8000-000000009802','10000000-0000-4000-8000-000000009802','Postal Two',1,1,'locations.maringa','','','Maringá','PR','BR'),
  ('20000000-0000-4000-8000-000000009803','10000000-0000-4000-8000-000000009803','Postal Three',2,2,'locations.curitiba','','','Curitiba','PR','BR');

set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009801',true);
do $$ declare own_code text; result record; begin
  select code into own_code from public.get_my_postal_friend_code();
  if own_code !~ '^[A-HJ-NP-Z2-9]{8}$' then raise exception 'Postal code is invalid'; end if;
  select * into result from public.request_friendship_by_postal_code(own_code);
  if result.outcome <> 'unavailable' then raise exception 'Self friendship was accepted'; end if;
  select code into own_code from public.regenerate_my_postal_friend_code();
  if own_code !~ '^[A-HJ-NP-Z2-9]{8}$' then raise exception 'Rotated code is invalid'; end if;
  perform set_config('test.postal_one_code', own_code, false);
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009802',true);
do $$ declare target_code text := current_setting('test.postal_one_code'); result record; begin
  select * into result from public.request_friendship_by_postal_code(target_code);
  if result.outcome <> 'sent' then raise exception 'Friend request was not created'; end if;
  select * into result from public.request_friendship_by_postal_code(target_code);
  if result.outcome <> 'alreadyPending' then raise exception 'Repeated request was not idempotent'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009801',true);
do $$ declare request_record public.friendships; listed jsonb; result record; begin
  select * into strict request_record from public.friendships where requester_profile_id='20000000-0000-4000-8000-000000009802';
  listed := public.list_my_postal_connections();
  if jsonb_array_length(listed->'incoming') <> 1 or listed->'incoming'->0 ? 'city' then raise exception 'Pending request exposed data or was not listed'; end if;
  select * into result from public.respond_to_postal_friend_request(request_record.id,true);
  if not result.accepted then raise exception 'Friend request was not accepted'; end if;
  listed := public.list_my_postal_connections();
  if jsonb_array_length(listed->'accepted') <> 1 then raise exception 'Accepted friendship was not listed'; end if;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009803',true);
do $$ begin
  begin perform * from public.profile_postal_friend_codes; raise exception 'Direct postal code access was accepted'; exception when insufficient_privilege then null; end;
end $$;

reset role;
rollback;
