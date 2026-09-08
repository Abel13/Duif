-- Web Push foundation: subscriptions, preferences, outbox, enqueue for the postal loop.

create type public.push_event_kind as enum (
  'correspondence_arrived',
  'return_prep_remaining',
  'return_departed',
  'ready_for_collection'
);

create type public.push_outbox_status as enum (
  'pending',
  'sent',
  'failed',
  'suppressed'
);

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint push_subscriptions_endpoint_unique unique (endpoint),
  constraint push_subscriptions_endpoint_length check (char_length(endpoint) between 8 and 2048),
  constraint push_subscriptions_p256dh_length check (char_length(p256dh) between 8 and 512),
  constraint push_subscriptions_auth_length check (char_length(auth) between 8 and 512)
);

create index push_subscriptions_profile_id_idx on public.push_subscriptions (profile_id);

create table public.push_preferences (
  profile_id uuid primary key references public.profiles (id) on delete cascade,
  enabled boolean not null default false,
  correspondence_arrived boolean not null default true,
  return_prep_remaining boolean not null default true,
  return_departed boolean not null default true,
  ready_for_collection boolean not null default true,
  locale text not null default 'pt-BR',
  updated_at timestamptz not null default now(),
  constraint push_preferences_locale_check check (locale in ('pt-BR', 'en-US'))
);

create table public.push_outbox (
  id uuid primary key default gen_random_uuid(),
  idempotency_key text not null,
  delivery_id uuid not null references public.deliveries (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  event_kind public.push_event_kind not null,
  audience text not null,
  deep_link text not null,
  locale text not null,
  title text not null,
  body text not null,
  payload_public jsonb not null default '{}'::jsonb,
  scheduled_at timestamptz not null default now(),
  status public.push_outbox_status not null default 'pending',
  attempt_count integer not null default 0,
  last_error text,
  sent_at timestamptz,
  created_at timestamptz not null default now(),
  constraint push_outbox_idempotency_unique unique (idempotency_key),
  constraint push_outbox_audience_check check (audience in ('sender', 'recipient')),
  constraint push_outbox_deep_link_check check (deep_link ~ '^/[a-z0-9/_-]*$'),
  constraint push_outbox_locale_check check (locale in ('pt-BR', 'en-US')),
  constraint push_outbox_attempt_count_check check (attempt_count >= 0)
);

create index push_outbox_pending_idx
  on public.push_outbox (scheduled_at, created_at)
  where status = 'pending';

create index push_outbox_delivery_idx on public.push_outbox (delivery_id);

alter table public.push_subscriptions enable row level security;
alter table public.push_preferences enable row level security;
alter table public.push_outbox enable row level security;

create policy "Owners manage push subscriptions"
  on public.push_subscriptions
  for all
  using (profile_id = (select id from public.profiles where auth_user_id = auth.uid()))
  with check (profile_id = (select id from public.profiles where auth_user_id = auth.uid()));

create policy "Owners manage push preferences"
  on public.push_preferences
  for all
  using (profile_id = (select id from public.profiles where auth_user_id = auth.uid()))
  with check (profile_id = (select id from public.profiles where auth_user_id = auth.uid()));

-- Outbox is service-owned; clients never read notification bodies from the table.
revoke all on table public.push_outbox from anon, authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;
grant select, insert, update, delete on table public.push_preferences to authenticated;

create or replace function public.push_event_copy(
  target_kind public.push_event_kind,
  target_audience text,
  target_locale text
)
returns table (title text, body text, deep_link text)
language sql
immutable
set search_path = public
as $$
  select copies.title, copies.body, copies.deep_link
  from (
    values
      (
        'correspondence_arrived'::public.push_event_kind,
        'recipient',
        'pt-BR',
        'Correspondência chegou',
        'Há novidade na Caixa Postal. O mensageiro pode preparar o retorno em até 60 minutos.',
        '/mailbox'
      ),
      (
        'correspondence_arrived'::public.push_event_kind,
        'recipient',
        'en-US',
        'Correspondence arrived',
        'Something new is in your Mailbox. The messenger may prepare its return within 60 minutes.',
        '/mailbox'
      ),
      (
        'correspondence_arrived'::public.push_event_kind,
        'sender',
        'pt-BR',
        'Seu mascote chegou',
        'Seu mensageiro chegou ao destino.',
        '/map'
      ),
      (
        'correspondence_arrived'::public.push_event_kind,
        'sender',
        'en-US',
        'Your mascot arrived',
        'Your messenger reached the destination.',
        '/map'
      ),
      (
        'return_prep_remaining'::public.push_event_kind,
        'recipient',
        'pt-BR',
        'Janela de preparo',
        'Ainda há tempo para responder antes do retorno do mensageiro.',
        '/mailbox'
      ),
      (
        'return_prep_remaining'::public.push_event_kind,
        'recipient',
        'en-US',
        'Preparation window',
        'There is still time to reply before the messenger returns.',
        '/mailbox'
      ),
      (
        'return_prep_remaining'::public.push_event_kind,
        'sender',
        'pt-BR',
        'Descanso no destino',
        'Seu mascote ainda descansa no destino.',
        '/map'
      ),
      (
        'return_prep_remaining'::public.push_event_kind,
        'sender',
        'en-US',
        'Resting at destination',
        'Your mascot is still resting at the destination.',
        '/map'
      ),
      (
        'return_departed'::public.push_event_kind,
        'recipient',
        'pt-BR',
        'Retorno iniciado',
        'O visitante postal iniciou o caminho de volta.',
        '/mailbox'
      ),
      (
        'return_departed'::public.push_event_kind,
        'recipient',
        'en-US',
        'Return started',
        'The postal visitor started the journey home.',
        '/mailbox'
      ),
      (
        'return_departed'::public.push_event_kind,
        'sender',
        'pt-BR',
        'Retorno a caminho',
        'Seu mascote iniciou o retorno ao ninho.',
        '/map'
      ),
      (
        'return_departed'::public.push_event_kind,
        'sender',
        'en-US',
        'Heading home',
        'Your mascot started the return to the nest.',
        '/map'
      ),
      (
        'ready_for_collection'::public.push_event_kind,
        'recipient',
        'pt-BR',
        'Resposta chegou',
        'Há uma resposta na Caixa Postal.',
        '/mailbox'
      ),
      (
        'ready_for_collection'::public.push_event_kind,
        'recipient',
        'en-US',
        'A reply arrived',
        'There is a reply in your Mailbox.',
        '/mailbox'
      ),
      (
        'ready_for_collection'::public.push_event_kind,
        'sender',
        'pt-BR',
        'Pronto para coleta',
        'Seu mascote voltou e está pronto para coleta no ninho.',
        '/nest'
      ),
      (
        'ready_for_collection'::public.push_event_kind,
        'sender',
        'en-US',
        'Ready to collect',
        'Your mascot is back and ready to collect at the nest.',
        '/nest'
      )
  ) as copies(event_kind, audience, locale, title, body, deep_link)
  where copies.event_kind = target_kind
    and copies.audience = target_audience
    and copies.locale = case when target_locale in ('pt-BR', 'en-US') then target_locale else 'pt-BR' end;
$$;

create or replace function public.push_preference_allows(
  target_profile_id uuid,
  target_kind public.push_event_kind
)
returns boolean
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare prefs public.push_preferences;
begin
  select * into prefs from public.push_preferences where profile_id = target_profile_id;
  if prefs.profile_id is null or prefs.enabled is not true then
    return false;
  end if;
  return case target_kind
    when 'correspondence_arrived' then prefs.correspondence_arrived
    when 'return_prep_remaining' then prefs.return_prep_remaining
    when 'return_departed' then prefs.return_departed
    when 'ready_for_collection' then prefs.ready_for_collection
  end;
end;
$$;

create or replace function public.try_enqueue_push_event(
  target_delivery_id uuid,
  target_profile_id uuid,
  target_kind public.push_event_kind,
  target_audience text,
  reference_time timestamptz default now()
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  prefs public.push_preferences;
  copy_row record;
  idempotency text;
begin
  if target_audience not in ('sender', 'recipient') then
    raise exception 'Invalid push audience' using errcode = '22023';
  end if;

  select * into prefs from public.push_preferences where profile_id = target_profile_id;
  if prefs.profile_id is null or prefs.enabled is not true then
    return false;
  end if;
  if not public.push_preference_allows(target_profile_id, target_kind) then
    return false;
  end if;

  select * into copy_row
  from public.push_event_copy(target_kind, target_audience, coalesce(prefs.locale, 'pt-BR'));
  if copy_row.title is null then
    raise exception 'Missing push copy' using errcode = '22023';
  end if;

  idempotency := target_delivery_id::text || ':' || target_kind::text || ':' || target_profile_id::text;

  insert into public.push_outbox (
    idempotency_key,
    delivery_id,
    profile_id,
    event_kind,
    audience,
    deep_link,
    locale,
    title,
    body,
    payload_public,
    scheduled_at,
    status
  )
  values (
    idempotency,
    target_delivery_id,
    target_profile_id,
    target_kind,
    target_audience,
    copy_row.deep_link,
    coalesce(prefs.locale, 'pt-BR'),
    copy_row.title,
    copy_row.body,
    jsonb_build_object(
      'eventKind', target_kind,
      'audience', target_audience,
      'deepLink', copy_row.deep_link
    ),
    reference_time,
    'pending'
  )
  on conflict (idempotency_key) do nothing;

  return found;
end;
$$;

create or replace function public.enqueue_postal_push_events(reference_time timestamptz default now())
returns integer
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  item record;
  enqueued integer := 0;
  has_return_reply boolean;
begin
  for item in
    select
      d.id,
      d.sender_profile_id,
      d.receiver_profile_id,
      d.outbound_arrival_at,
      d.return_start_at,
      d.return_arrival_at,
      d.is_tutorial
    from public.deliveries d
    where d.is_tutorial is not true
      and d.outbound_arrival_at is not null
      and d.outbound_arrival_at <= reference_time
      and (
        d.status <> 'completed'
        or d.return_arrival_at is null
        or d.return_arrival_at >= reference_time - interval '3 days'
      )
  loop
    if public.try_enqueue_push_event(item.id, item.receiver_profile_id, 'correspondence_arrived', 'recipient', reference_time) then
      enqueued := enqueued + 1;
    end if;
    if public.try_enqueue_push_event(item.id, item.sender_profile_id, 'correspondence_arrived', 'sender', reference_time) then
      enqueued := enqueued + 1;
    end if;

    if item.outbound_arrival_at + interval '30 minutes' <= reference_time
      and item.return_start_at is not null
      and item.return_start_at > reference_time
    then
      if public.try_enqueue_push_event(item.id, item.receiver_profile_id, 'return_prep_remaining', 'recipient', reference_time) then
        enqueued := enqueued + 1;
      end if;
      if public.try_enqueue_push_event(item.id, item.sender_profile_id, 'return_prep_remaining', 'sender', reference_time) then
        enqueued := enqueued + 1;
      end if;
    end if;

    if item.return_start_at is not null and item.return_start_at <= reference_time then
      if public.try_enqueue_push_event(item.id, item.receiver_profile_id, 'return_departed', 'recipient', reference_time) then
        enqueued := enqueued + 1;
      end if;
      if public.try_enqueue_push_event(item.id, item.sender_profile_id, 'return_departed', 'sender', reference_time) then
        enqueued := enqueued + 1;
      end if;
    end if;

    if item.return_arrival_at is not null and item.return_arrival_at <= reference_time then
      if public.try_enqueue_push_event(item.id, item.sender_profile_id, 'ready_for_collection', 'sender', reference_time) then
        enqueued := enqueued + 1;
      end if;
      select exists(
        select 1
        from public.delivery_return_replies reply
        where reply.delivery_id = item.id
          and reply.confirmed_at is not null
      ) into has_return_reply;
      if has_return_reply then
        if public.try_enqueue_push_event(item.id, item.receiver_profile_id, 'ready_for_collection', 'recipient', reference_time) then
          enqueued := enqueued + 1;
        end if;
      end if;
    end if;
  end loop;

  return enqueued;
end;
$$;

create or replace function public.register_push_subscription(
  subscription_endpoint text,
  subscription_p256dh text,
  subscription_auth text,
  subscription_user_agent text default null,
  preferred_locale text default 'pt-BR'
)
returns public.push_subscriptions
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  me public.profiles;
  saved public.push_subscriptions;
  locale_value text := case when preferred_locale in ('pt-BR', 'en-US') then preferred_locale else 'pt-BR' end;
begin
  select * into me from public.profiles where auth_user_id = auth.uid();
  if me.id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  if subscription_endpoint is null or char_length(subscription_endpoint) < 8 then
    raise exception 'Invalid push endpoint' using errcode = '22023';
  end if;
  if subscription_p256dh is null or subscription_auth is null then
    raise exception 'Invalid push keys' using errcode = '22023';
  end if;

  insert into public.push_preferences as prefs (
    profile_id, enabled, locale, updated_at
  ) values (
    me.id, true, locale_value, now()
  )
  on conflict (profile_id) do update
  set enabled = true,
      locale = excluded.locale,
      updated_at = now();

  insert into public.push_subscriptions as subs (
    profile_id, endpoint, p256dh, auth, user_agent, last_seen_at
  ) values (
    me.id,
    subscription_endpoint,
    subscription_p256dh,
    subscription_auth,
    nullif(subscription_user_agent, ''),
    now()
  )
  on conflict (endpoint) do update
  set profile_id = excluded.profile_id,
      p256dh = excluded.p256dh,
      auth = excluded.auth,
      user_agent = excluded.user_agent,
      last_seen_at = now()
  returning * into saved;

  return saved;
end;
$$;

create or replace function public.revoke_push_subscription(subscription_endpoint text)
returns boolean
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  me public.profiles;
  removed integer := 0;
begin
  select * into me from public.profiles where auth_user_id = auth.uid();
  if me.id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  delete from public.push_subscriptions
  where profile_id = me.id
    and endpoint = subscription_endpoint;
  get diagnostics removed = row_count;
  return removed > 0;
end;
$$;

create or replace function public.get_push_preferences()
returns public.push_preferences
language plpgsql
stable
security definer
set search_path = public, auth, pg_temp
as $$
declare
  me public.profiles;
  prefs public.push_preferences;
begin
  select * into me from public.profiles where auth_user_id = auth.uid();
  if me.id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  select * into prefs from public.push_preferences where profile_id = me.id;
  if prefs.profile_id is null then
    prefs.profile_id := me.id;
    prefs.enabled := false;
    prefs.correspondence_arrived := true;
    prefs.return_prep_remaining := true;
    prefs.return_departed := true;
    prefs.ready_for_collection := true;
    prefs.locale := 'pt-BR';
    prefs.updated_at := now();
  end if;
  return prefs;
end;
$$;

create or replace function public.upsert_push_preferences(
  master_enabled boolean,
  allow_correspondence_arrived boolean default true,
  allow_return_prep_remaining boolean default true,
  allow_return_departed boolean default true,
  allow_ready_for_collection boolean default true,
  preferred_locale text default 'pt-BR'
)
returns public.push_preferences
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  me public.profiles;
  saved public.push_preferences;
  locale_value text := case when preferred_locale in ('pt-BR', 'en-US') then preferred_locale else 'pt-BR' end;
begin
  select * into me from public.profiles where auth_user_id = auth.uid();
  if me.id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  insert into public.push_preferences as prefs (
    profile_id,
    enabled,
    correspondence_arrived,
    return_prep_remaining,
    return_departed,
    ready_for_collection,
    locale,
    updated_at
  ) values (
    me.id,
    coalesce(master_enabled, false),
    coalesce(allow_correspondence_arrived, true),
    coalesce(allow_return_prep_remaining, true),
    coalesce(allow_return_departed, true),
    coalesce(allow_ready_for_collection, true),
    locale_value,
    now()
  )
  on conflict (profile_id) do update
  set enabled = excluded.enabled,
      correspondence_arrived = excluded.correspondence_arrived,
      return_prep_remaining = excluded.return_prep_remaining,
      return_departed = excluded.return_departed,
      ready_for_collection = excluded.ready_for_collection,
      locale = excluded.locale,
      updated_at = now()
  returning * into saved;

  return saved;
end;
$$;

create or replace function public.claim_pending_push_outbox(batch_limit integer default 50)
returns table (
  outbox_id uuid,
  profile_id uuid,
  event_kind public.push_event_kind,
  title text,
  body text,
  deep_link text,
  locale text,
  payload_public jsonb,
  subscription_id uuid,
  endpoint text,
  p256dh text,
  auth text
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  return query
  with claimed as (
    select outbox.id
    from public.push_outbox outbox
    where outbox.status = 'pending'
      and outbox.scheduled_at <= now()
      and outbox.attempt_count < 8
      and exists (
        select 1
        from public.push_subscriptions subs
        where subs.profile_id = outbox.profile_id
      )
    order by outbox.scheduled_at, outbox.created_at
    limit greatest(1, least(coalesce(batch_limit, 50), 200))
    for update skip locked
  ),
  bumped as (
    update public.push_outbox outbox
    set attempt_count = outbox.attempt_count + 1
    from claimed
    where outbox.id = claimed.id
    returning outbox.*
  )
  select
    bumped.id,
    bumped.profile_id,
    bumped.event_kind,
    bumped.title,
    bumped.body,
    bumped.deep_link,
    bumped.locale,
    bumped.payload_public,
    subs.id,
    subs.endpoint,
    subs.p256dh,
    subs.auth
  from bumped
  join public.push_subscriptions subs on subs.profile_id = bumped.profile_id;
end;
$$;

create or replace function public.mark_push_outbox_sent(target_outbox_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.push_outbox
  set status = 'sent',
      sent_at = now(),
      last_error = null
  where id = target_outbox_id;
end;
$$;

create or replace function public.mark_push_outbox_failed(
  target_outbox_id uuid,
  error_message text default null,
  permanent boolean default false
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  update public.push_outbox
  set status = case when permanent then 'failed'::public.push_outbox_status else status end,
      last_error = left(coalesce(error_message, 'push_failed'), 500),
      scheduled_at = case
        when permanent then scheduled_at
        else now() + (least(30, greatest(1, attempt_count)) * interval '1 minute')
      end
  where id = target_outbox_id;
end;
$$;

create or replace function public.revoke_push_subscription_endpoint(subscription_endpoint text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  delete from public.push_subscriptions where endpoint = subscription_endpoint;
end;
$$;

create or replace function public.confirm_delivery_return_reply(
  target_delivery_id uuid,
  reply_payload jsonb
)
returns public.delivery_return_replies
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  confirmed public.delivery_return_replies;
  delivery public.deliveries;
begin
  confirmed := public.confirm_delivery_return_reply_legacy_postmark_time(target_delivery_id, reply_payload);
  select * into delivery from public.deliveries where id = target_delivery_id;
  update public.delivery_return_replies reply
  set metadata = jsonb_set(
    reply.metadata,
    '{postalFinishing,postmark}',
    coalesce(reply.metadata #> '{postalFinishing,postmark}', '{}'::jsonb)
      || public.postal_postmark_time_snapshot(
        reply.departure_at,
        delivery.destination_latitude,
        delivery.destination_longitude
      ),
    true
  )
  where reply.delivery_id = confirmed.delivery_id
  returning * into confirmed;

  -- Early departure after reply confirmation should notify both parties once.
  if delivery.return_start_at is not null and delivery.return_start_at <= now() + interval '1 minute' then
    perform public.try_enqueue_push_event(delivery.id, delivery.receiver_profile_id, 'return_departed', 'recipient', now());
    perform public.try_enqueue_push_event(delivery.id, delivery.sender_profile_id, 'return_departed', 'sender', now());
  end if;

  return confirmed;
end;
$$;

create or replace function public.invoke_push_dispatch_edge_function()
returns bigint
language plpgsql
security definer
set search_path = public, extensions, vault, pg_temp
as $$
declare
  project_url text;
  cron_secret text;
begin
  perform public.enqueue_postal_push_events(now());
  select decrypted_secret into project_url from vault.decrypted_secrets where name = 'duif_project_url' limit 1;
  select decrypted_secret into cron_secret from vault.decrypted_secrets where name = 'duif_push_dispatch_cron_secret' limit 1;
  if project_url is null or cron_secret is null then
    return null;
  end if;
  return net.http_post(
    url => rtrim(project_url, '/') || '/functions/v1/push-dispatch',
    headers => jsonb_build_object(
      'Content-Type', 'application/json',
      'X-Duif-Cron-Secret', cron_secret
    ),
    body => '{}'::jsonb,
    timeout_milliseconds => 15000
  );
end;
$$;

do $$
begin
  if exists (select 1 from cron.job where jobname = 'duif-push-dispatch') then
    perform cron.unschedule('duif-push-dispatch');
  end if;
  perform cron.schedule(
    'duif-push-dispatch',
    '* * * * *',
    $job$select public.invoke_push_dispatch_edge_function()$job$
  );
end $$;

revoke all on function public.push_event_copy(public.push_event_kind, text, text) from public, anon, authenticated;
revoke all on function public.push_preference_allows(uuid, public.push_event_kind) from public, anon, authenticated;
revoke all on function public.try_enqueue_push_event(uuid, uuid, public.push_event_kind, text, timestamptz) from public, anon, authenticated;
revoke all on function public.enqueue_postal_push_events(timestamptz) from public, anon, authenticated;
revoke all on function public.claim_pending_push_outbox(integer) from public, anon, authenticated;
revoke all on function public.mark_push_outbox_sent(uuid) from public, anon, authenticated;
revoke all on function public.mark_push_outbox_failed(uuid, text, boolean) from public, anon, authenticated;
revoke all on function public.revoke_push_subscription_endpoint(text) from public, anon, authenticated;
revoke all on function public.invoke_push_dispatch_edge_function() from public, anon, authenticated;

revoke all on function public.register_push_subscription(text, text, text, text, text) from public, anon;
revoke all on function public.revoke_push_subscription(text) from public, anon;
revoke all on function public.get_push_preferences() from public, anon;
revoke all on function public.upsert_push_preferences(boolean, boolean, boolean, boolean, boolean, text) from public, anon;
revoke all on function public.confirm_delivery_return_reply(uuid, jsonb) from public, anon;

grant execute on function public.register_push_subscription(text, text, text, text, text) to authenticated;
grant execute on function public.revoke_push_subscription(text) to authenticated;
grant execute on function public.get_push_preferences() to authenticated;
grant execute on function public.upsert_push_preferences(boolean, boolean, boolean, boolean, boolean, text) to authenticated;
grant execute on function public.confirm_delivery_return_reply(uuid, jsonb) to authenticated;

grant execute on function public.enqueue_postal_push_events(timestamptz) to service_role;
grant execute on function public.claim_pending_push_outbox(integer) to service_role;
grant execute on function public.mark_push_outbox_sent(uuid) to service_role;
grant execute on function public.mark_push_outbox_failed(uuid, text, boolean) to service_role;
grant execute on function public.revoke_push_subscription_endpoint(text) to service_role;
grant execute on function public.invoke_push_dispatch_edge_function() to service_role;
