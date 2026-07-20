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
  if delivery_record.return_arrival_at-delivery_record.outbound_start_at<>interval '15 minutes'
    or delivery_record.outbound_arrival_at-delivery_record.outbound_start_at<>interval '7 minutes'
    or delivery_record.return_start_at-delivery_record.outbound_arrival_at<>interval '1 minute'
    or delivery_record.return_arrival_at-delivery_record.return_start_at<>interval '7 minutes' then
    raise exception 'Tutorial timeline is not exactly 16 minutes'; end if;
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
update public.deliveries set created_at=now()-interval '17 minutes',outbound_start_at=now()-interval '16 minutes',
outbound_arrival_at=now()-interval '9 minutes',return_start_at=now()-interval '8 minutes',return_arrival_at=now()-interval '1 minute'
where is_tutorial;
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
end $$;
reset role;

do $$ begin
  if (select count(*) from public.inventory_items i join public.profiles p on p.id=i.owner_profile_id where p.auth_user_id='10000000-0000-4000-8000-000000009401')<>2 then raise exception 'Tutorial did not grant exactly two items'; end if;
  if (select stage from public.account_onboarding where auth_user_id='10000000-0000-4000-8000-000000009401')<>'nestSetup' then raise exception 'Tutorial did not advance to nest setup'; end if;
  if (select count(*) from public.deliveries where is_tutorial)<>1 then raise exception 'Expected exactly one tutorial delivery'; end if;
end $$;
rollback;
