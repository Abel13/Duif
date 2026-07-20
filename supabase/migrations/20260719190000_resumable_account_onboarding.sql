create type public.onboarding_stage as enum (
  'welcome',
  'travel',
  'discoveries',
  'returnCollection',
  'displayName',
  'mascotChoice',
  'tutorial',
  'nestSetup',
  'completed'
);

create table public.account_onboarding (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  stage public.onboarding_stage not null default 'welcome',
  stage_version smallint not null default 1 check (stage_version = 1),
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint account_onboarding_display_name_state check (
    stage in ('welcome', 'travel', 'discoveries', 'returnCollection', 'displayName')
    or display_name is not null
  ),
  constraint account_onboarding_display_name_format check (
    display_name is null
    or (
      display_name = normalize(display_name, NFC)
      and display_name = btrim(display_name)
      and display_name !~ '[[:cntrl:]]'
      and display_name !~ '[[:space:]]{2,}'
      and char_length(display_name) between 2 and 24
    )
  )
);

alter table public.account_onboarding enable row level security;

create policy "Players can read their own onboarding"
  on public.account_onboarding for select
  using (auth_user_id = auth.uid());

revoke all on public.account_onboarding from anon, authenticated;
grant select on public.account_onboarding to authenticated;

create or replace function public.begin_or_resume_onboarding()
returns public.account_onboarding
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  onboarding_record public.account_onboarding;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  insert into public.account_onboarding (auth_user_id)
  values (current_user_id)
  on conflict (auth_user_id) do nothing;

  select * into strict onboarding_record
  from public.account_onboarding
  where auth_user_id = current_user_id;

  return onboarding_record;
end;
$$;

create or replace function public.advance_account_onboarding(
  expected_stage public.onboarding_stage,
  next_stage public.onboarding_stage,
  requested_display_name text default null
)
returns public.account_onboarding
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  onboarding_record public.account_onboarding;
  normalized_display_name text;
  allowed_next_stage public.onboarding_stage;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;

  select * into onboarding_record
  from public.account_onboarding
  where auth_user_id = current_user_id
  for update;

  if onboarding_record.auth_user_id is null then
    raise exception 'Onboarding was not initialized' using errcode = '22023';
  end if;

  if onboarding_record.stage = next_stage then
    return onboarding_record;
  end if;

  if onboarding_record.stage <> expected_stage then
    raise exception 'Onboarding stage changed' using errcode = '40001';
  end if;

  allowed_next_stage := case expected_stage
    when 'welcome' then 'travel'::public.onboarding_stage
    when 'travel' then 'discoveries'::public.onboarding_stage
    when 'discoveries' then 'returnCollection'::public.onboarding_stage
    when 'returnCollection' then 'displayName'::public.onboarding_stage
    when 'displayName' then 'mascotChoice'::public.onboarding_stage
    when 'mascotChoice' then 'tutorial'::public.onboarding_stage
    when 'tutorial' then 'nestSetup'::public.onboarding_stage
    when 'nestSetup' then 'completed'::public.onboarding_stage
    else null
  end;

  if next_stage is distinct from allowed_next_stage then
    raise exception 'Invalid onboarding transition' using errcode = '22023';
  end if;

  if next_stage = 'mascotChoice' then
    normalized_display_name := normalize(
      btrim(regexp_replace(coalesce(requested_display_name, ''), '[[:space:]]+', ' ', 'g')),
      NFC
    );
    if normalized_display_name ~ '[[:cntrl:]]'
      or char_length(normalized_display_name) not between 2 and 24 then
      raise exception 'Invalid display name' using errcode = '22023';
    end if;
  elsif requested_display_name is not null then
    raise exception 'Display name is not accepted in this transition' using errcode = '22023';
  end if;

  update public.account_onboarding set
    stage = next_stage,
    display_name = case
      when next_stage = 'mascotChoice' then normalized_display_name
      else display_name
    end,
    updated_at = now()
  where auth_user_id = current_user_id
  returning * into onboarding_record;

  return onboarding_record;
end;
$$;

revoke all on function public.begin_or_resume_onboarding() from public;
revoke all on function public.advance_account_onboarding(
  public.onboarding_stage, public.onboarding_stage, text
) from public;
grant execute on function public.begin_or_resume_onboarding() to authenticated;
grant execute on function public.advance_account_onboarding(
  public.onboarding_stage, public.onboarding_stage, text
) to authenticated;

comment on table public.account_onboarding is
  'Server-owned account onboarding progress kept separate from profiles until mascot provisioning.';
