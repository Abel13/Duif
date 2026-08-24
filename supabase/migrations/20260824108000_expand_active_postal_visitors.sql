drop function if exists public.list_active_postal_visitors();

create function public.list_active_postal_visitors()
returns table(
  delivery_id uuid,
  mascot_id uuid,
  mascot_name text,
  portrait_asset_key text,
  correspondence_type text,
  departs_at timestamptz
)
language sql
security definer
set search_path=public,auth,pg_temp
as $$
  select d.id,m.id,m.name,m.appearance->>'portraitAssetKey',content.correspondence_type::text,d.return_start_at
  from public.deliveries d
  join public.profiles receiver on receiver.id=d.receiver_profile_id
  join public.player_mascots m on m.id=d.mascot_id
  join public.delivery_correspondence_contents content on content.delivery_id=d.id
  where receiver.auth_user_id=auth.uid()
    and content.correspondence_type in ('letter','postcard','sticker')
    and not d.is_tutorial
    and d.outbound_arrival_at<=now()
    and d.return_start_at>now()
    and not exists(select 1 from public.postal_job_runs job where job.delivery_id=d.id)
    and (content.correspondence_type<>'letter' or not exists(
      select 1 from public.delivery_return_replies reply where reply.delivery_id=d.id
    ))
  order by d.return_start_at,d.id
  limit 3
$$;

revoke all on function public.list_active_postal_visitors() from public,anon;
grant execute on function public.list_active_postal_visitors() to authenticated;
