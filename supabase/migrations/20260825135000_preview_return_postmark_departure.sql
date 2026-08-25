drop function public.preview_origin_postmark();
create or replace function public.preview_origin_postmark(target_delivery_id uuid default null)
returns jsonb language plpgsql stable security definer set search_path=public,auth,pg_temp as $$
declare me public.profiles; delivery public.deliveries; stamped_at timestamptz; latitude double precision; longitude double precision;
begin
  select * into me from public.profiles where auth_user_id=auth.uid();
  if me.id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  stamped_at:=now(); latitude:=me.home_latitude; longitude:=me.home_longitude;
  if target_delivery_id is not null then
    select * into delivery from public.deliveries where id=target_delivery_id and receiver_profile_id=me.id;
    if delivery.id is null then raise exception 'Delivery not available' using errcode='42501'; end if;
    stamped_at:=greatest(now(),delivery.outbound_arrival_at+interval '30 minutes');
    latitude:=delivery.destination_latitude; longitude:=delivery.destination_longitude;
  end if;
  return jsonb_build_object('city',me.postal_base_city,'country',me.postal_base_country)
    || public.postal_postmark_time_snapshot(stamped_at,latitude,longitude);
end $$;
revoke all on function public.preview_origin_postmark(uuid) from public,anon;
grant execute on function public.preview_origin_postmark(uuid) to authenticated;
