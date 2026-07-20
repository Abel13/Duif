do $$ declare definition text; begin
  select pg_get_functiondef(p.oid) into definition from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_nearby_postal_traffic';
  definition:=replace(definition,
    'where d.sender_profile_id <> current_profile_id',
    'where not d.is_tutorial and d.sender_profile_id <> current_profile_id');
  execute definition;
end $$;
