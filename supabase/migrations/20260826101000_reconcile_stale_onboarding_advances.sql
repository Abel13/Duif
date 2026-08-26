-- Treat stale onboarding advances as an idempotent read of the authoritative
-- state. This heals old PWA tabs and concurrent devices without emitting a
-- serialization error, while transitions from the current stage remain strict.
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
    return onboarding_record;
  end if;

  allowed_next_stage := case expected_stage
    when 'welcome' then 'travel'::public.onboarding_stage
    when 'travel' then 'discoveries'::public.onboarding_stage
    when 'discoveries' then 'returnCollection'::public.onboarding_stage
    when 'returnCollection' then 'displayName'::public.onboarding_stage
    when 'displayName' then 'mascotChoice'::public.onboarding_stage
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

  update public.account_onboarding
  set
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

revoke all on function public.advance_account_onboarding(
  public.onboarding_stage,
  public.onboarding_stage,
  text
) from public, anon;
grant execute on function public.advance_account_onboarding(
  public.onboarding_stage,
  public.onboarding_stage,
  text
) to authenticated;
