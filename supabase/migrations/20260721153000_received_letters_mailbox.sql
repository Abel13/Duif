create or replace function public.list_received_letters()
returns table (
  delivery_id uuid,
  sender_profile_id uuid,
  sender_name text,
  origin_label text,
  arrived_at timestamptz,
  letter_text text
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_profile_id uuid;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select profiles.id into current_profile_id
  from public.profiles
  where profiles.auth_user_id = auth.uid();

  if current_profile_id is null then
    raise exception 'Current profile not found' using errcode = '28000';
  end if;

  return query
  select
    delivery.id,
    sender.id,
    sender.display_name,
    coalesce(nullif(btrim(delivery.origin_place_label), ''), sender.home_label_key),
    delivery.outbound_arrival_at,
    content.letter_text
  from public.deliveries as delivery
  join public.delivery_correspondence_contents as content
    on content.delivery_id = delivery.id
  join public.profiles as sender
    on sender.id = delivery.sender_profile_id
  where delivery.receiver_profile_id = current_profile_id
    and delivery.is_tutorial = false
    and content.correspondence_type = 'letter'
    and content.letter_text is not null
    and delivery.outbound_arrival_at <= now()
  order by delivery.outbound_arrival_at desc, delivery.id desc;
end;
$$;

revoke all on function public.list_received_letters() from public;
grant execute on function public.list_received_letters() to authenticated;
