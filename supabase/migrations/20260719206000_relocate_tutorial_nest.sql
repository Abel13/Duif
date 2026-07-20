-- The tutorial route is fictional. Preserve its 6.15 km east-southeast course while
-- relocating its nest to the supplied São Paulo starting point.
update public.route_reward_points
set latitude = -23.587329, longitude = -46.624604
where catalog_key = 'route-tutorial-inaugural-postcard';

do $$
declare
  definition text;
begin
  select pg_get_functiondef(procedure.oid)
    into definition
  from pg_proc procedure
  join pg_namespace namespace on namespace.oid = procedure.pronamespace
  where namespace.nspname = 'public'
    and procedure.proname = 'start_or_resume_tutorial_delivery';

  definition := replace(
    definition,
    '-23.3045,-51.1696,',
    '-23.58458338178298,-46.6545987644678,'
  );
  definition := replace(
    definition,
    '-23.3100,-51.1100,',
    '-23.590075,-46.594608,'
  );

  if definition not like '%-23.58458338178298,-46.6545987644678%'
    or definition not like '%-23.590075,-46.594608%'
  then
    raise exception 'Could not relocate the tutorial route';
  end if;

  execute definition;
end;
$$;
