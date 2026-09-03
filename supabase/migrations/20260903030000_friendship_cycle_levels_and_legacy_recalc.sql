-- Authoritative friendship cycles: level from completed ida+volta deliveries, with legacy backfill.

alter table public.friendships
  add column if not exists level_started_at timestamptz;

update public.friendships
set level_started_at = coalesce(level_started_at, 'epoch'::timestamptz)
where level_started_at is null;

alter table public.friendships
  alter column level_started_at set default now(),
  alter column level_started_at set not null;

alter table public.friendships
  drop constraint if exists friendships_friendship_level_check;

alter table public.friendships
  add constraint friendships_friendship_level_check
  check (friendship_level between 1 and 5);

create or replace function public.friendship_level_from_cycles(cycle_count integer)
returns integer
language sql
immutable
as $$
  select case
    when coalesce(cycle_count, 0) >= 50 then 5
    when coalesce(cycle_count, 0) >= 20 then 4
    when coalesce(cycle_count, 0) >= 8 then 3
    when coalesce(cycle_count, 0) >= 3 then 2
    else 1
  end;
$$;

create or replace function public.count_friendship_cycles(
  left_profile_id uuid,
  right_profile_id uuid,
  since_at timestamptz
)
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(*)::integer
  from public.deliveries delivery
  where not delivery.is_tutorial
    and delivery.status = 'completed'
    and delivery.return_arrival_at is not null
    and delivery.return_arrival_at >= since_at
    and (
      (delivery.sender_profile_id = left_profile_id and delivery.receiver_profile_id = right_profile_id)
      or (delivery.sender_profile_id = right_profile_id and delivery.receiver_profile_id = left_profile_id)
    );
$$;

create or replace function public.refresh_friendship_progress(
  left_profile_id uuid,
  right_profile_id uuid
)
returns public.friendships
language plpgsql
security definer
set search_path = public
as $$
declare
  friendship_record public.friendships;
  cycle_count integer;
begin
  if left_profile_id is null or right_profile_id is null or left_profile_id = right_profile_id then
    return null;
  end if;

  select * into friendship_record
  from public.friendships friendship
  where friendship.status = 'accepted'
    and least(friendship.requester_profile_id, friendship.addressee_profile_id)
      = least(left_profile_id, right_profile_id)
    and greatest(friendship.requester_profile_id, friendship.addressee_profile_id)
      = greatest(left_profile_id, right_profile_id)
  for update;

  if friendship_record.id is null then
    return null;
  end if;

  cycle_count := public.count_friendship_cycles(
    friendship_record.requester_profile_id,
    friendship_record.addressee_profile_id,
    friendship_record.level_started_at
  );

  update public.friendships
  set
    exchange_count = cycle_count,
    friendship_level = public.friendship_level_from_cycles(cycle_count),
    updated_at = now()
  where id = friendship_record.id
  returning * into friendship_record;

  return friendship_record;
end;
$$;

create or replace function public.refresh_friendship_progress_on_delivery_completion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'completed'
    and old.status is distinct from 'completed'
    and not new.is_tutorial
    and new.return_arrival_at is not null
    and new.sender_profile_id is distinct from new.receiver_profile_id
  then
    perform public.refresh_friendship_progress(new.sender_profile_id, new.receiver_profile_id);
  end if;
  return new;
end;
$$;

drop trigger if exists friendship_progress_on_delivery_completion on public.deliveries;
create trigger friendship_progress_on_delivery_completion
  after update of status on public.deliveries
  for each row
  execute function public.refresh_friendship_progress_on_delivery_completion();

create or replace function public.respond_to_postal_friend_request(friendship_id uuid, should_accept boolean)
returns table(profile_id uuid, accepted boolean)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_profile_id uuid := public.current_profile_for_postal_friendship();
  request_record public.friendships;
begin
  select * into request_record
  from public.friendships
  where id = friendship_id
    and addressee_profile_id = current_profile_id
    and status = 'pending'
  for update;
  if request_record.id is null then
    raise exception 'Friend request not found' using errcode = '42501';
  end if;
  if should_accept then
    update public.friendships
    set
      status = 'accepted',
      friendship_level = 1,
      exchange_count = 0,
      level_started_at = now(),
      updated_at = now()
    where id = request_record.id;
  else
    delete from public.friendships where id = request_record.id;
  end if;
  return query select request_record.requester_profile_id, should_accept;
end;
$$;

revoke all on function public.friendship_level_from_cycles(integer) from public, anon;
revoke all on function public.count_friendship_cycles(uuid, uuid, timestamptz) from public, anon;
revoke all on function public.refresh_friendship_progress(uuid, uuid) from public, anon;
revoke all on function public.refresh_friendship_progress_on_delivery_completion() from public, anon;
revoke all on function public.respond_to_postal_friend_request(uuid, boolean) from public, anon;
grant execute on function public.friendship_level_from_cycles(integer) to authenticated;
grant execute on function public.respond_to_postal_friend_request(uuid, boolean) to authenticated;

-- Legacy accepted friendships: recount from all completed cycles already done.
do $$
declare
  friendship_record public.friendships;
begin
  for friendship_record in
    select * from public.friendships where status = 'accepted'
  loop
    perform public.refresh_friendship_progress(
      friendship_record.requester_profile_id,
      friendship_record.addressee_profile_id
    );
  end loop;
end;
$$;
