create or replace function public.get_delivery_return_reply_context(target_delivery_id uuid)
returns table(delivery_id uuid,sender_profile_id uuid,sender_name text,mascot_id uuid,mascot_name text,origin_label text,destination_label text,reply_deadline timestamptz,reply_confirmed boolean)
language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare me uuid;
begin
  select id into me from public.profiles where auth_user_id=auth.uid();
  if me is null then raise exception 'Authentication required' using errcode='28000'; end if;

  return query
  select
    d.id,
    p.id,
    p.display_name,
    m.id,
    m.name,
    coalesce(d.destination_place_label,d.destination_label_key),
    coalesce(d.origin_place_label,d.origin_label_key),
    d.outbound_arrival_at+interval '60 minutes',
    exists(select 1 from public.delivery_return_replies r where r.delivery_id=d.id)
  from public.deliveries d
  join public.profiles p on p.id=d.sender_profile_id
  join public.player_mascots m on m.id=d.mascot_id
  join public.delivery_correspondence_contents c on c.delivery_id=d.id
  where d.id=target_delivery_id
    and d.receiver_profile_id=me
    and c.correspondence_type='letter'
    and not d.is_tutorial
    and not exists(select 1 from public.postal_job_runs j where j.delivery_id=d.id)
    and exists(select 1 from public.delivery_mailbox_opens o where o.delivery_id=d.id and o.profile_id=me and o.direction='outbound')
    and d.outbound_arrival_at<=now()
    and (
      exists(select 1 from public.delivery_return_replies r where r.delivery_id=d.id)
      or (
        now()<=d.outbound_arrival_at+interval '60 minutes'
        and now()<d.return_start_at
        and d.status not in ('returned','completed')
        and not exists(
          select 1
          from public.delivery_route_segments s
          where s.delivery_id=d.id and s.leg='return' and s.state<>'planned'
        )
      )
    );
end $$;

revoke all on function public.get_delivery_return_reply_context(uuid) from public,anon;
grant execute on function public.get_delivery_return_reply_context(uuid) to authenticated;
