create table public.profile_postal_friend_codes (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  code text not null unique check (code ~ '^[A-HJ-NP-Z2-9]{8}$'),
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now()
);

create table public.postal_friend_code_rate_limits (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  window_started_at timestamptz not null,
  request_count integer not null check (request_count >= 0),
  updated_at timestamptz not null default now()
);

create unique index friendships_unordered_pair_unique
  on public.friendships (least(requester_profile_id, addressee_profile_id), greatest(requester_profile_id, addressee_profile_id));

alter table public.profile_postal_friend_codes enable row level security;
alter table public.postal_friend_code_rate_limits enable row level security;
revoke all on public.profile_postal_friend_codes, public.postal_friend_code_rate_limits from anon, authenticated;

create or replace function public.generate_postal_friend_code()
returns text language plpgsql volatile set search_path=public as $$
declare alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; result text := ''; index_value integer;
begin
  for index_value in 1..8 loop
    result := result || substr(alphabet, (get_byte(extensions.gen_random_bytes(1), 0) % length(alphabet)) + 1, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.current_profile_for_postal_friendship()
returns uuid language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  return current_profile_id;
end;
$$;

create or replace function public.get_my_postal_friend_code()
returns table(code text, created_at timestamptz, rotated_at timestamptz)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid := public.current_profile_for_postal_friendship(); candidate text;
begin
  loop
    select postal.code, postal.created_at, postal.rotated_at into code, created_at, rotated_at
    from public.profile_postal_friend_codes postal where postal.profile_id=current_profile_id;
    if found then return next; return; end if;
    candidate := public.generate_postal_friend_code();
    begin
      insert into public.profile_postal_friend_codes(profile_id,code) values(current_profile_id,candidate);
    exception when unique_violation then null;
    end;
  end loop;
end;
$$;

create or replace function public.regenerate_my_postal_friend_code()
returns table(code text, created_at timestamptz, rotated_at timestamptz)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid := public.current_profile_for_postal_friendship(); candidate text;
begin
  loop
    candidate := public.generate_postal_friend_code();
    begin
      insert into public.profile_postal_friend_codes(profile_id,code,rotated_at)
      values(current_profile_id,candidate,now())
      on conflict(profile_id) do update set code=excluded.code, rotated_at=excluded.rotated_at
      returning profile_postal_friend_codes.code, profile_postal_friend_codes.created_at, profile_postal_friend_codes.rotated_at into code,created_at,rotated_at;
      return next; return;
    exception when unique_violation then null;
    end;
  end loop;
end;
$$;

create or replace function public.request_friendship_by_postal_code(submitted_code text)
returns table(outcome text, request_id uuid)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid := public.current_profile_for_postal_friendship(); target_profile_id uuid; normalized_code text; request_record public.friendships; limit_record public.postal_friend_code_rate_limits; now_at timestamptz := now();
begin
  normalized_code := upper(regexp_replace(coalesce(submitted_code,''), '[^A-Za-z0-9]', '', 'g'));
  insert into public.postal_friend_code_rate_limits(profile_id,window_started_at,request_count,updated_at)
  values(current_profile_id,now_at,1,now_at)
  on conflict(profile_id) do update set
    window_started_at=case when postal_friend_code_rate_limits.window_started_at<=now_at-interval '1 minute' then now_at else postal_friend_code_rate_limits.window_started_at end,
    request_count=case when postal_friend_code_rate_limits.window_started_at<=now_at-interval '1 minute' then 1 else postal_friend_code_rate_limits.request_count+1 end,
    updated_at=now_at returning * into limit_record;
  if limit_record.request_count>10 then raise exception 'Postal friend code rate limit exceeded' using errcode='22023'; end if;
  if normalized_code !~ '^[A-HJ-NP-Z2-9]{8}$' then return query select 'unavailable'::text, null::uuid; return; end if;
  select profile_id into target_profile_id from public.profile_postal_friend_codes where code=normalized_code;
  if target_profile_id is null or target_profile_id=current_profile_id then return query select 'unavailable'::text,null::uuid; return; end if;
  select * into request_record from public.friendships
  where least(requester_profile_id,addressee_profile_id)=least(current_profile_id,target_profile_id)
    and greatest(requester_profile_id,addressee_profile_id)=greatest(current_profile_id,target_profile_id)
  for update;
  if request_record.id is not null then
    if request_record.status='accepted' then return query select 'alreadyFriends'::text,request_record.id;
    elsif request_record.status='blocked' then return query select 'unavailable'::text,null::uuid;
    elsif request_record.addressee_profile_id=current_profile_id then return query select 'receivedPending'::text,request_record.id;
    else return query select 'alreadyPending'::text,request_record.id; end if;
    return;
  end if;
  insert into public.friendships(id,requester_profile_id,addressee_profile_id,status,friendship_level,exchange_count)
  values(gen_random_uuid(),current_profile_id,target_profile_id,'pending',1,0) returning * into request_record;
  return query select 'sent'::text,request_record.id;
end;
$$;

create or replace function public.list_my_postal_connections()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid := public.current_profile_for_postal_friendship();
begin
  return jsonb_build_object(
    'accepted', coalesce((select jsonb_agg(jsonb_build_object('id',friendship.id,'profileId',profile.id,'displayName',profile.display_name,'city',profile.postal_base_city,'state',profile.postal_base_state,'country',profile.postal_base_country,'friendshipLevel',friendship.friendship_level,'exchangeCount',friendship.exchange_count) order by profile.display_name)
      from public.friendships friendship join public.profiles profile on profile.id=case when friendship.requester_profile_id=current_profile_id then friendship.addressee_profile_id else friendship.requester_profile_id end
      where friendship.status='accepted' and current_profile_id in(friendship.requester_profile_id,friendship.addressee_profile_id)),'[]'::jsonb),
    'incoming', coalesce((select jsonb_agg(jsonb_build_object('id',friendship.id,'displayName',profile.display_name,'createdAt',friendship.created_at) order by friendship.created_at desc)
      from public.friendships friendship join public.profiles profile on profile.id=friendship.requester_profile_id where friendship.addressee_profile_id=current_profile_id and friendship.status='pending'),'[]'::jsonb),
    'outgoing', coalesce((select jsonb_agg(jsonb_build_object('id',friendship.id,'displayName',profile.display_name,'createdAt',friendship.created_at) order by friendship.created_at desc)
      from public.friendships friendship join public.profiles profile on profile.id=friendship.addressee_profile_id where friendship.requester_profile_id=current_profile_id and friendship.status='pending'),'[]'::jsonb)
  );
end;
$$;

create or replace function public.respond_to_postal_friend_request(friendship_id uuid, should_accept boolean)
returns table(profile_id uuid, accepted boolean)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid := public.current_profile_for_postal_friendship(); request_record public.friendships;
begin
  select * into request_record from public.friendships where id=friendship_id and addressee_profile_id=current_profile_id and status='pending' for update;
  if request_record.id is null then raise exception 'Friend request not found' using errcode='42501'; end if;
  if should_accept then update public.friendships set status='accepted',updated_at=now() where id=request_record.id;
  else delete from public.friendships where id=request_record.id; end if;
  return query select request_record.requester_profile_id,should_accept;
end;
$$;

revoke all on function public.generate_postal_friend_code(),public.current_profile_for_postal_friendship(),public.get_my_postal_friend_code(),public.regenerate_my_postal_friend_code(),public.request_friendship_by_postal_code(text),public.list_my_postal_connections(),public.respond_to_postal_friend_request(uuid,boolean) from public;
grant execute on function public.get_my_postal_friend_code(),public.regenerate_my_postal_friend_code(),public.request_friendship_by_postal_code(text),public.list_my_postal_connections(),public.respond_to_postal_friend_request(uuid,boolean) to authenticated;
