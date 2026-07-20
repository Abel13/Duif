begin;
insert into auth.users(id,email,aud,role,created_at,updated_at) values
('10000000-0000-4000-8000-000000009401','tutorial@example.test','authenticated','authenticated',now(),now()),
('10000000-0000-4000-8000-000000009402','other@example.test','authenticated','authenticated',now(),now());
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009401',true);

do $$ declare template_id uuid; result jsonb; repeated jsonb; delivery_record public.deliveries; begin
  perform public.begin_or_resume_onboarding();
  perform public.advance_account_onboarding('welcome','travel'); perform public.advance_account_onboarding('travel','discoveries');
  perform public.advance_account_onboarding('discoveries','returnCollection'); perform public.advance_account_onboarding('returnCollection','displayName');
  perform public.advance_account_onboarding('displayName','mascotChoice','Tutorial Player');
  select id into strict template_id from public.mascot_templates where catalog_key='mascot-nuvem';
  perform public.save_initial_mascot_draft(template_id,'Mensageiro'); perform public.provision_initial_mascot();
  result:=public.start_or_resume_tutorial_delivery(); repeated:=public.start_or_resume_tutorial_delivery();
  if result->'delivery'->>'id'<>repeated->'delivery'->>'id' then raise exception 'Tutorial start was not idempotent'; end if;
  select * into strict delivery_record from public.deliveries where id=(result->'delivery'->>'id')::uuid;
  if delivery_record.outbound_arrival_at-delivery_record.outbound_start_at<>interval '2 minutes'
    or delivery_record.return_start_at-delivery_record.outbound_arrival_at<>interval '30 seconds'
    or delivery_record.return_arrival_at-delivery_record.return_start_at<>interval '2 minutes'
    or delivery_record.return_arrival_at-delivery_record.outbound_start_at<>interval '4 minutes 30 seconds' then
    raise exception 'Boosted tutorial timeline is not exactly 5 minutes'; end if;
  if delivery_record.origin_latitude <> -23.58458338178298
    or delivery_record.origin_longitude <> -46.6545987644678
    or delivery_record.destination_latitude <> -23.590075
    or delivery_record.destination_longitude <> -46.594608 then
    raise exception 'Tutorial route does not use the configured fictional nest'; end if;
  if delivery_record.travel_modifiers->'tutorialBoost' <> '{"kind":"firstJourney","version":1,"preparationSeconds":30,"outboundSeconds":120,"destinationSeconds":30,"returnSeconds":120}'::jsonb then
    raise exception 'Tutorial boost snapshot is invalid'; end if;
  if (select count(*) from public.delivery_route_discoveries where delivery_id=delivery_record.id)<>1
    or (select route_progress from public.delivery_route_discoveries where delivery_id=delivery_record.id)<>0.5 then
    raise exception 'Tutorial discovery was not materialized exactly once at 50 percent'; end if;
  perform public.acknowledge_tutorial_instruction('preparing');
  begin perform public.collect_tutorial_delivery(); raise exception 'Early tutorial collection was accepted';
  exception when invalid_parameter_value then null; end;
  begin perform public.acknowledge_tutorial_instruction('outbound'); raise exception 'Future instruction was accepted';
  exception when invalid_parameter_value then null; end;
  begin perform public.advance_account_onboarding('tutorial','nestSetup'); raise exception 'Generic tutorial advance was accepted';
  exception when invalid_parameter_value or no_data_found then null; end;
end $$;

select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009402',true);
do $$ begin
  begin perform public.collect_tutorial_delivery(); raise exception 'Another user collected tutorial cargo';
  exception when invalid_parameter_value or no_data_found then null; end;
end $$;

reset role;
update public.deliveries set created_at=now()-interval '6 minutes',outbound_start_at=now()-interval '5 minutes 30 seconds',
outbound_arrival_at=now()-interval '3 minutes 30 seconds',return_start_at=now()-interval '3 minutes',return_arrival_at=now()-interval '1 minute'
where is_tutorial and sender_profile_id=(select id from public.profiles where auth_user_id='10000000-0000-4000-8000-000000009401');
set local role authenticated;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009401',true);

do $$ declare delivery_id uuid; first_result jsonb; repeated_result jsonb; begin
  perform public.acknowledge_tutorial_instruction('outbound'); perform public.acknowledge_tutorial_instruction('discovery');
  perform public.acknowledge_tutorial_instruction('destination'); perform public.acknowledge_tutorial_instruction('returning');
  perform public.acknowledge_tutorial_instruction('returned'); perform public.acknowledge_tutorial_instruction('collection');
  select tutorial_delivery_id into delivery_id from public.account_onboarding where auth_user_id=auth.uid();
  begin perform public.collect_delivery_reward(delivery_id); raise exception 'Generic collection accepted tutorial delivery';
  exception when invalid_parameter_value then null; end;
  first_result:=public.collect_tutorial_delivery(); repeated_result:=public.collect_tutorial_delivery();
  if first_result->'primaryInventoryItem'->>'id'<>repeated_result->'primaryInventoryItem'->>'id'
    or first_result->'routeInventoryItem'->>'id'<>repeated_result->'routeInventoryItem'->>'id' then
    raise exception 'Tutorial collection was not idempotent'; end if;
  perform public.acknowledge_inaugural_postcard_hint();
  perform public.acknowledge_inaugural_postcard_hint();
  if (select inaugural_postcard_hint_seen_at from public.account_onboarding where auth_user_id=auth.uid()) is null then
    raise exception 'Postcard flip hint was not persisted'; end if;
end $$;
reset role;

do $$ begin
  if (select count(*) from public.inventory_items i join public.profiles p on p.id=i.owner_profile_id where p.auth_user_id='10000000-0000-4000-8000-000000009401')<>2 then raise exception 'Tutorial did not grant exactly two items'; end if;
  if (select stage from public.account_onboarding where auth_user_id='10000000-0000-4000-8000-000000009401')<>'nestSetup' then raise exception 'Tutorial did not advance to nest setup'; end if;
  if (select count(*) from public.deliveries d join public.profiles p on p.id=d.sender_profile_id where d.is_tutorial and p.auth_user_id='10000000-0000-4000-8000-000000009401')<>1 then raise exception 'Expected exactly one tutorial delivery'; end if;
end $$;
rollback;
