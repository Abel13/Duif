-- The equipment wrapper uses its function name as a PL/pgSQL block qualifier,
-- so renaming it makes that historical body invalid. Recompose the public RPC
-- against the stable pre-wrapper function and retain the authoritative stamp.
create or replace function public.create_delivery_from_selection(mascot_id uuid,friend_profile_id uuid,correspondence_catalog_key text,content_payload jsonb)
returns public.deliveries language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare expected integer; actual integer; created public.deliveries;
begin
  if not exists(
    select 1 from public.player_mascots mascot
    join public.profiles profile on profile.id=mascot.owner_profile_id
    where mascot.id=create_delivery_from_selection.mascot_id and profile.auth_user_id=auth.uid()
  ) then raise exception 'Mascot not found' using errcode='42501'; end if;

  expected:=nullif(content_payload->>'equipmentLoadoutRevision','')::integer;
  select coalesce(loadout.revision,1) into actual
  from public.mascot_loadouts loadout
  where loadout.mascot_id=create_delivery_from_selection.mascot_id;
  actual:=coalesce(actual,1);
  if expected is not null and expected<>actual then raise exception 'Loadout changed' using errcode='40001'; end if;

  created:=public.create_delivery_from_selection_legacy_equipment(
    mascot_id,friend_profile_id,correspondence_catalog_key,content_payload-'equipmentLoadoutRevision'
  );
  update public.delivery_correspondence_contents content
  set metadata=jsonb_set(
    content.metadata,
    '{postalFinishing,postmark}',
    coalesce(content.metadata#>'{postalFinishing,postmark}','{}'::jsonb)
      || public.postal_postmark_time_snapshot(created.outbound_start_at,created.origin_latitude,created.origin_longitude),
    true
  ) where content.delivery_id=created.id;
  return created;
end $$;

revoke all on function public.create_delivery_from_selection(uuid,uuid,text,jsonb) from public,anon;
grant execute on function public.create_delivery_from_selection(uuid,uuid,text,jsonb) to authenticated;
