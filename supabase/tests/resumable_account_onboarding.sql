begin;

insert into auth.users (id, email, aud, role, created_at, updated_at)
values
  ('10000000-0000-4000-8000-000000009201', 'onboarding-one@example.test', 'authenticated', 'authenticated', now(), now()),
  ('10000000-0000-4000-8000-000000009202', 'onboarding-two@example.test', 'authenticated', 'authenticated', now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000009201', true);

do $$
declare
  first_record public.account_onboarding;
  repeated_record public.account_onboarding;
begin
  first_record := public.begin_or_resume_onboarding();
  repeated_record := public.begin_or_resume_onboarding();
  if first_record.stage <> 'welcome' or repeated_record.auth_user_id <> first_record.auth_user_id then
    raise exception 'Onboarding initialization was not idempotent';
  end if;

  perform public.advance_account_onboarding('welcome', 'travel');
  perform public.advance_account_onboarding('welcome', 'travel');
  if (select stage from public.account_onboarding) <> 'travel' then
    raise exception 'Repeated advance did not preserve the current stage';
  end if;

  begin
    perform public.advance_account_onboarding('welcome', 'discoveries');
    raise exception 'Invalid or stale transition was accepted';
  exception when invalid_parameter_value or serialization_failure then null;
  end;

  perform public.advance_account_onboarding('travel', 'discoveries');
  perform public.advance_account_onboarding('discoveries', 'returnCollection');
  perform public.advance_account_onboarding('returnCollection', 'displayName');

  begin
    perform public.advance_account_onboarding('displayName', 'mascotChoice', 'A');
    raise exception 'Short display name was accepted';
  exception when invalid_parameter_value then null;
  end;

  first_record := public.advance_account_onboarding(
    'displayName', 'mascotChoice', U&'  Jose\0301   da  Silva  '
  );
  if first_record.display_name <> 'José da Silva' or first_record.stage <> 'mascotChoice' then
    raise exception 'Display name was not normalized and persisted';
  end if;
end;
$$;

do $$
begin
  begin
    update public.account_onboarding set stage = 'completed';
    raise exception 'Direct onboarding update was accepted';
  exception when insufficient_privilege then null;
  end;
end;
$$;

select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000009202', true);

do $$
declare
  second_record public.account_onboarding;
begin
  second_record := public.begin_or_resume_onboarding();
  perform public.advance_account_onboarding('welcome', 'travel');
  perform public.advance_account_onboarding('travel', 'discoveries');
  perform public.advance_account_onboarding('discoveries', 'returnCollection');
  perform public.advance_account_onboarding('returnCollection', 'displayName');
  second_record := public.advance_account_onboarding('displayName', 'mascotChoice', 'José da Silva');
  if second_record.display_name <> 'José da Silva' then
    raise exception 'Non-unique display names were not accepted';
  end if;
  if (select count(*) from public.account_onboarding) <> 1 then
    raise exception 'RLS exposed another player onboarding row';
  end if;
end;
$$;

reset role;

do $$
begin
  if (select count(*) from public.account_onboarding) <> 2 then
    raise exception 'Expected two independently persisted onboarding rows';
  end if;
  if exists (select 1 from public.profiles) or exists (select 1 from public.player_mascots) then
    raise exception 'Onboarding shell provisioned a profile or mascot early';
  end if;
end;
$$;

select set_config('request.jwt.claim.sub', '', true);
set local role authenticated;
do $$
begin
  perform public.begin_or_resume_onboarding();
  raise exception 'Anonymous onboarding initialization was accepted';
exception when invalid_authorization_specification then null;
end;
$$;

rollback;
