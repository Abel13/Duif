do $$ declare definition text; begin
  select pg_get_functiondef(p.oid) into definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='materialize_delivery_route_discoveries';
  definition:=replace(definition,
    'where status = ''active''',
    'where status = ''active'' and catalog_key <> ''route-tutorial-inaugural-postcard''');
  definition:=replace(definition,
    'where status=''active''',
    'where status=''active'' and catalog_key <> ''route-tutorial-inaugural-postcard''');
  execute definition;
end $$;
