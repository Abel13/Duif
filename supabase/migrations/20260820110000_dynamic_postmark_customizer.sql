-- Reputation-gated, reusable postmark customization. The immutable model/color
-- snapshot travels with the correspondence; the UI is not the authority.

alter function public.create_delivery_from_selection(uuid, uuid, text, jsonb)
  rename to create_delivery_from_selection_legacy_postmark;

revoke all on function public.create_delivery_from_selection_legacy_postmark(uuid, uuid, text, jsonb) from public, authenticated;

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
  current_profile_id uuid;
  reputation_level integer;
  postmark_model text := coalesce(nullif(btrim(content_payload #>> '{postalFinishing,postmarkModel}'), ''), 'classic');
  postmark_color text := coalesce(nullif(btrim(content_payload #>> '{postalFinishing,postmarkColor}'), ''), 'brown');
  model_level integer;
  color_level integer;
  normalized_payload jsonb;
  created_delivery public.deliveries;
begin
  select id into current_profile_id from public.profiles where auth_user_id = auth.uid();
  if current_profile_id is null then raise exception 'Authentication required' using errcode = '28000'; end if;

  select level into reputation_level from public.profile_postal_progression where profile_id = current_profile_id;
  reputation_level := coalesce(reputation_level, 1);

  model_level := case postmark_model when 'classic' then 1 when 'route' then 5 when 'wing' then 10 end;
  color_level := case postmark_color when 'brown' then 1 when 'blue' then 3 when 'red' then 5 when 'green' then 7 when 'gold' then 10 when 'plum' then 13 when 'charcoal' then 16 when 'teal' then 20 end;

  if model_level is null or color_level is null then
    raise exception 'Invalid postmark customization' using errcode = '22023';
  end if;
  if reputation_level < model_level or reputation_level < color_level then
    raise exception 'Postmark customization is locked' using errcode = '42501';
  end if;

  normalized_payload := jsonb_set(content_payload, '{postalFinishing,postmarkKey}', '"postalMark.postalCancel"'::jsonb, true);
  created_delivery := public.create_delivery_from_selection_legacy_postmark(
    mascot_id,
    friend_profile_id,
    correspondence_catalog_key,
    normalized_payload
  );

  update public.delivery_correspondence_contents
  set metadata = jsonb_set(
    metadata,
    '{postalFinishing,postmark}',
    jsonb_build_object(
      'key', 'postalMark.custom',
      'model', postmark_model,
      'color', postmark_color,
      'reputationLevelAtSend', reputation_level
    ),
    true
  )
  where delivery_id = created_delivery.id;

  return created_delivery;
end;
$$;

revoke all on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) from public;
grant execute on function public.create_delivery_from_selection(uuid, uuid, text, jsonb) to authenticated;
