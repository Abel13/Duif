-- Keep a postmark tied to the civil date at its origin, never to arrival or client time.
create or replace function public.postal_timezone_at(latitude double precision,longitude double precision)
returns text language sql stable security definer set search_path=public,extensions,pg_temp as $$
  select coalesce((
    select boundary.time_zone
    from public.timezone_boundaries boundary
    join public.timezone_boundary_imports imported on imported.id=boundary.import_id
    where extensions.st_covers(boundary.geometry,extensions.st_setsrid(extensions.st_makepoint(longitude,latitude),4326))
    order by imported.imported_at desc,boundary.priority desc,boundary.id
    limit 1
  ),'UTC')
$$;

create or replace function public.postal_postmark_time_snapshot(stamped_at timestamptz,latitude double precision,longitude double precision)
returns jsonb language plpgsql stable security definer set search_path=public,pg_temp as $$
declare zone text; has_boundary boolean;
begin
  zone:=public.postal_timezone_at(latitude,longitude);
  select exists(
    select 1 from public.timezone_boundaries boundary
    join public.timezone_boundary_imports imported on imported.id=boundary.import_id
    where boundary.time_zone=zone
      and extensions.st_covers(boundary.geometry,extensions.st_setsrid(extensions.st_makepoint(longitude,latitude),4326))
  ) into has_boundary;
  return jsonb_build_object(
    'stampedAt',stamped_at,
    'timeZone',zone,
    'date',(stamped_at at time zone zone)::date,
    'dateSource',case when has_boundary then 'origin-local-v1' else 'utc-fallback-v1' end
  );
end $$;

create or replace function public.backfill_authoritative_postmark_dates()
returns integer language plpgsql security definer set search_path=public,pg_temp as $$
declare changed integer:=0; affected integer;
begin
  update public.delivery_correspondence_contents content
  set metadata=jsonb_set(
    content.metadata,
    '{postalFinishing,postmark}',
    coalesce(content.metadata#>'{postalFinishing,postmark}','{}'::jsonb)
      || public.postal_postmark_time_snapshot(delivery.outbound_start_at,delivery.origin_latitude,delivery.origin_longitude),
    true
  )
  from public.deliveries delivery
  where delivery.id=content.delivery_id
    and content.metadata#>'{postalFinishing,postmark}' is not null
    and content.metadata#>'{postalFinishing,postmark}' is distinct from
      coalesce(content.metadata#>'{postalFinishing,postmark}','{}'::jsonb)
        || public.postal_postmark_time_snapshot(delivery.outbound_start_at,delivery.origin_latitude,delivery.origin_longitude);
  get diagnostics changed=row_count;

  update public.delivery_return_replies reply
  set metadata=jsonb_set(
    reply.metadata,
    '{postalFinishing,postmark}',
    coalesce(reply.metadata#>'{postalFinishing,postmark}','{}'::jsonb)
      || public.postal_postmark_time_snapshot(reply.departure_at,delivery.destination_latitude,delivery.destination_longitude),
    true
  )
  from public.deliveries delivery
  where delivery.id=reply.delivery_id
    and reply.metadata#>'{postalFinishing,postmark}' is not null
    and reply.metadata#>'{postalFinishing,postmark}' is distinct from
      coalesce(reply.metadata#>'{postalFinishing,postmark}','{}'::jsonb)
        || public.postal_postmark_time_snapshot(reply.departure_at,delivery.destination_latitude,delivery.destination_longitude);
  get diagnostics affected=row_count;
  return changed+affected;
end $$;

alter function public.create_delivery_from_selection(uuid,uuid,text,jsonb)
  rename to create_delivery_from_selection_legacy_postmark_time;
revoke all on function public.create_delivery_from_selection_legacy_postmark_time(uuid,uuid,text,jsonb) from public,anon,authenticated;

create or replace function public.create_delivery_from_selection(mascot_id uuid,friend_profile_id uuid,correspondence_catalog_key text,content_payload jsonb)
returns public.deliveries language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare created public.deliveries;
begin
  created:=public.create_delivery_from_selection_legacy_postmark_time(mascot_id,friend_profile_id,correspondence_catalog_key,content_payload);
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

alter function public.confirm_delivery_return_reply(uuid,jsonb)
  rename to confirm_delivery_return_reply_legacy_postmark_time;
revoke all on function public.confirm_delivery_return_reply_legacy_postmark_time(uuid,jsonb) from public,anon,authenticated;

create or replace function public.confirm_delivery_return_reply(target_delivery_id uuid,reply_payload jsonb)
returns public.delivery_return_replies language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare confirmed public.delivery_return_replies; delivery public.deliveries;
begin
  confirmed:=public.confirm_delivery_return_reply_legacy_postmark_time(target_delivery_id,reply_payload);
  select * into delivery from public.deliveries where id=target_delivery_id;
  update public.delivery_return_replies reply
  set metadata=jsonb_set(
    reply.metadata,
    '{postalFinishing,postmark}',
    coalesce(reply.metadata#>'{postalFinishing,postmark}','{}'::jsonb)
      || public.postal_postmark_time_snapshot(reply.departure_at,delivery.destination_latitude,delivery.destination_longitude),
    true
  ) where reply.delivery_id=confirmed.delivery_id returning * into confirmed;
  return confirmed;
end $$;

create or replace function public.preview_origin_postmark()
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare me public.profiles;
begin
  select * into me from public.profiles where auth_user_id=auth.uid();
  if me.id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  return jsonb_build_object('city',me.postal_base_city,'country',me.postal_base_country)
    || public.postal_postmark_time_snapshot(now(),me.home_latitude,me.home_longitude);
end $$;

create or replace function public.get_delivery_postmark_snapshot(target_delivery_id uuid)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare snapshot jsonb;
begin
  select content.metadata#>'{postalFinishing,postmark}' into snapshot
  from public.deliveries delivery
  join public.profiles sender on sender.id=delivery.sender_profile_id
  join public.delivery_correspondence_contents content on content.delivery_id=delivery.id
  where delivery.id=target_delivery_id and sender.auth_user_id=auth.uid();
  if snapshot is null then raise exception 'Delivery not available' using errcode='42501'; end if;
  return snapshot;
end $$;

select public.backfill_authoritative_postmark_dates();

revoke all on function public.postal_timezone_at(double precision,double precision),public.postal_postmark_time_snapshot(timestamptz,double precision,double precision),public.backfill_authoritative_postmark_dates() from public,anon,authenticated;
revoke all on function public.create_delivery_from_selection(uuid,uuid,text,jsonb),public.confirm_delivery_return_reply(uuid,jsonb),public.preview_origin_postmark(),public.get_delivery_postmark_snapshot(uuid) from public,anon;
grant execute on function public.create_delivery_from_selection(uuid,uuid,text,jsonb),public.confirm_delivery_return_reply(uuid,jsonb),public.preview_origin_postmark(),public.get_delivery_postmark_snapshot(uuid) to authenticated;
grant execute on function public.backfill_authoritative_postmark_dates() to service_role;
