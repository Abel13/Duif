-- Persist the authoritative origin printed on the dynamic postmark.

alter function public.create_delivery_from_selection(uuid, uuid, text, jsonb)
  rename to create_delivery_from_selection_legacy_origin;

revoke all on function public.create_delivery_from_selection_legacy_origin(uuid, uuid, text, jsonb) from public, authenticated;

create or replace function public.create_delivery_from_selection(
  mascot_id uuid,
  friend_profile_id uuid,
  correspondence_catalog_key text,
  content_payload jsonb
)
returns public.deliveries
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  sender_profile public.profiles;
  created_delivery public.deliveries;
begin
  select * into sender_profile from public.profiles where auth_user_id = auth.uid();
  if sender_profile.id is null then raise exception 'Authentication required' using errcode = '28000'; end if;

  created_delivery := public.create_delivery_from_selection_legacy_origin(
    mascot_id,
    friend_profile_id,
    correspondence_catalog_key,
    content_payload
  );

  update public.delivery_correspondence_contents
  set metadata = jsonb_set(
    metadata,
    '{postalFinishing,postmark}',
    (metadata #> '{postalFinishing,postmark}') || jsonb_build_object(
      'city', sender_profile.postal_base_city,
      'country', sender_profile.postal_base_country,
      'date', current_date
    ),
    true
  )
  where delivery_id = created_delivery.id;

  return created_delivery;
end;
$$;

revoke all on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) from public;
grant execute on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) to authenticated;
