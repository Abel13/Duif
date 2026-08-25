begin;

do $$
declare rule jsonb; payload jsonb; function_body text;
begin
  if (select count(*) from public.mascot_flight_level_rules)<>20 then raise exception 'M58 must define all 20 functional levels'; end if;
  rule:=public.m58_flight_rule(99);
  if (rule->>'maxOneWayKm')::numeric<>20050 or (rule->>'naturalSlots')::integer<>7 then raise exception 'Levels above 20 must retain the level-20 capacity'; end if;
  if public.m58_route_pair_key('city:2','city:1')<>public.m58_route_pair_key('city:1','city:2') then raise exception 'Route pairs are not bidirectional'; end if;
  payload:=public.m58_familiarity_payload(2); if payload->>'state'<>'new' then raise exception 'New threshold failed'; end if;
  payload:=public.m58_familiarity_payload(3); if payload->>'state'<>'known' or (payload->>'speedMultiplier')::numeric<>1.02 then raise exception 'Known threshold failed'; end if;
  payload:=public.m58_familiarity_payload(8); if payload->>'state'<>'familiar' or (payload->>'speedMultiplier')::numeric<>1.04 then raise exception 'Familiar threshold failed'; end if;
  payload:=public.m58_familiarity_payload(20); if payload->>'state'<>'mastered' or (payload->>'speedMultiplier')::numeric<>1.06 then raise exception 'Mastered threshold failed'; end if;
  if (select count(*) from public.mascot_prestige_border_catalog where status='active')<>4 then raise exception 'Prestige catalog is incomplete'; end if;
  if exists(select 1 from public.mascot_prestige_border_catalog where minimum_level not in(20,30,40,50)) then raise exception 'Prestige levels are invalid'; end if;
  if not exists(select 1 from public.official_assets where asset_type='prestigeBorder') then raise exception 'Prestige assets are not registered'; end if;
  if (select count(*) from public.official_asset_versions version join public.official_assets asset on asset.id=version.asset_id where asset.asset_type='prestigeBorder' and version.version=1 and version.status='active' and version.mime_type='image/webp' and version.width=512 and version.height=512)<>4 then raise exception 'Illustrated circular prestige frames are not active'; end if;
  select pg_get_functiondef('public.m58_materialize_route_and_validate()'::regprocedure) into function_body;
  if position('Route exceeds mascot flight range' in function_body)=0 or position('Travel capacity exceeded' in function_body)=0 then raise exception 'Backend flight validation is missing'; end if;
  select pg_get_functiondef('public.resolve_delivery_travel_modifiers()'::regprocedure) into function_body;
  if position('least(1.25' in function_body)=0 or position('familiarity' in function_body)=0 then raise exception 'Familiarity or speed ceiling is missing'; end if;
  if not exists(select 1 from pg_trigger where tgname='m58_record_route_familiarity_on_completion' and not tgisinternal) then raise exception 'Completion trigger is missing'; end if;
  if not exists(select 1 from pg_trigger where tgname='m58_auto_select_first_prestige_after_level' and not tgisinternal) then raise exception 'Automatic prestige selection is missing'; end if;
end $$;

rollback;
