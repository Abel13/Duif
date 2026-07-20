begin;

insert into auth.users (id, email, aud, role, created_at, updated_at)
values ('10000000-0000-4000-8000-000000009301', 'starter@example.test', 'authenticated', 'authenticated', now(), now());

set local role authenticated;
select set_config('request.jwt.claim.sub', '10000000-0000-4000-8000-000000009301', true);

do $$
declare
  starter_template public.mascot_templates;
  draft public.account_onboarding;
  provisioned jsonb;
  repeated jsonb;
begin
  perform public.begin_or_resume_onboarding();
  perform public.advance_account_onboarding('welcome', 'travel');
  perform public.advance_account_onboarding('travel', 'discoveries');
  perform public.advance_account_onboarding('discoveries', 'returnCollection');
  perform public.advance_account_onboarding('returnCollection', 'displayName');
  perform public.advance_account_onboarding('displayName', 'mascotChoice', 'Carteiro');
  select * into strict starter_template from public.mascot_templates where catalog_key = 'mascot-nuvem';

  begin
    perform public.advance_account_onboarding('mascotChoice', 'tutorial');
    raise exception 'Generic onboarding advance skipped mascot provisioning';
  exception when invalid_parameter_value then null;
  end;

  begin
    perform public.save_initial_mascot_draft('99999999-9999-4999-8999-999999999999', 'Carteiro');
    raise exception 'Unknown starter archetype was accepted';
  exception when invalid_parameter_value then null;
  end;

  begin
    perform public.save_initial_mascot_draft(starter_template.id, 'A');
    raise exception 'Short mascot name was accepted';
  exception when invalid_parameter_value then null;
  end;

  draft := public.save_initial_mascot_draft(starter_template.id, U&'  Ce\0301u   Azul  ');
  if draft.mascot_name <> 'Céu Azul' or draft.selected_mascot_template_id <> starter_template.id then
    raise exception 'Starter draft was not normalized and persisted';
  end if;

  provisioned := public.provision_initial_mascot();
  repeated := public.provision_initial_mascot();
  if provisioned->'mascot'->>'id' <> repeated->'mascot'->>'id'
    or provisioned->'profile'->>'id' <> repeated->'profile'->>'id' then
    raise exception 'Repeated provisioning did not return the same records';
  end if;
  if (provisioned->'onboarding'->>'stage') <> 'tutorial' then
    raise exception 'Provisioning did not advance onboarding to tutorial';
  end if;
end;
$$;

reset role;

do $$
declare
  template_record public.mascot_templates;
  mascot_record public.player_mascots;
begin
  if (select count(*) from public.profiles where auth_user_id = '10000000-0000-4000-8000-000000009301') <> 1
    or (select count(*) from public.player_mascots pm join public.profiles p on p.id=pm.owner_profile_id
      where pm.is_starter and p.auth_user_id='10000000-0000-4000-8000-000000009301') <> 1 then
    raise exception 'Provisioning did not create exactly one profile and starter mascot';
  end if;
  select mt.* into strict template_record from public.mascot_templates mt where catalog_key = 'mascot-nuvem';
  select pm.* into strict mascot_record from public.player_mascots pm join public.profiles p on p.id=pm.owner_profile_id
  where pm.is_starter and p.auth_user_id='10000000-0000-4000-8000-000000009301';
  if mascot_record.name <> 'Céu Azul'
    or mascot_record.attributes <> template_record.attributes
    or mascot_record.trait <> template_record.trait
    or mascot_record.equipment <> template_record.equipment
    or mascot_record.skills <> template_record.skills
    or mascot_record.appearance <> template_record.appearance then
    raise exception 'Provisioned mascot does not preserve the archetype snapshot';
  end if;
end;
$$;

rollback;
