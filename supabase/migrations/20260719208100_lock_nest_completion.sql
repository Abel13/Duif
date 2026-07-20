do $$ declare definition text; begin
  select pg_get_functiondef(p.oid) into definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace
    where n.nspname='public' and p.proname='advance_account_onboarding';
  definition:=replace(definition,'when ''nestSetup'' then ''completed''::public.onboarding_stage','');
  execute definition;
end $$;
