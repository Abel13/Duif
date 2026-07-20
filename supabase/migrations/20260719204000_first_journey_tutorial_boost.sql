-- Existing tutorial deliveries keep their materialized timestamps. Only newly created ones are boosted.
do $$
declare definition text;
begin
  select pg_get_functiondef(p.oid) into strict definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='start_or_resume_tutorial_delivery'
    and pg_get_function_identity_arguments(p.oid)='';

  definition:=replace(definition,'started_at+interval ''1 minute''','started_at+interval ''30 seconds''');
  definition:=replace(definition,'started_at+interval ''8 minutes''','started_at+interval ''2 minutes 30 seconds''');
  definition:=replace(definition,'started_at+interval ''9 minutes''','started_at+interval ''3 minutes''');
  definition:=replace(definition,'started_at+interval ''16 minutes''','started_at+interval ''5 minutes''');
  definition:=replace(definition,'''preparationMinutes'',1','''preparationMinutes'',0.5');
  definition:=replace(definition,'''isLongRoute'',false)',
    '''isLongRoute'',false,''tutorialBoost'',jsonb_build_object(''kind'',''firstJourney'',''version'',1,''preparationSeconds'',30,''outboundSeconds'',120,''destinationSeconds'',30,''returnSeconds'',120))');

  if definition not like '%30 seconds%' or definition not like '%2 minutes 30 seconds%'
    or definition not like '%3 minutes%' or definition not like '%5 minutes%'
    or definition not like '%tutorialBoost%' then
    raise exception 'Could not install the first journey tutorial boost';
  end if;
  execute definition;
end;
$$;
