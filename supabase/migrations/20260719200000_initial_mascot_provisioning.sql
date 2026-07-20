alter table public.account_onboarding
  add column selected_mascot_template_id uuid references public.mascot_templates(id),
  add column mascot_name text,
  add constraint account_onboarding_mascot_draft_state check (
    (selected_mascot_template_id is null and mascot_name is null)
    or (selected_mascot_template_id is not null and mascot_name is not null)
  ),
  add constraint account_onboarding_mascot_name_format check (
    mascot_name is null or (
      mascot_name = normalize(mascot_name, NFC)
      and mascot_name = btrim(mascot_name)
      and mascot_name !~ '[[:cntrl:]]'
      and mascot_name !~ '[[:space:]]{2,}'
      and char_length(mascot_name) between 2 and 24
    )
  );

alter table public.player_mascots
  add column is_starter boolean not null default false;

create unique index player_mascots_one_starter_per_owner_idx
  on public.player_mascots(owner_profile_id)
  where is_starter;

insert into public.official_translation_keys (translation_key)
values ('onboarding.tutorialNestLabel')
on conflict (translation_key) do nothing;

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

  select * into onboarding_record from public.account_onboarding
  where auth_user_id = current_user_id for update;
  if onboarding_record.auth_user_id is null then
    raise exception 'Onboarding was not initialized' using errcode = '22023';
  end if;
  if onboarding_record.stage = next_stage then return onboarding_record; end if;
  if onboarding_record.stage <> expected_stage then
    raise exception 'Onboarding stage changed' using errcode = '40001';
  end if;

  allowed_next_stage := case expected_stage
    when 'welcome' then 'travel'::public.onboarding_stage
    when 'travel' then 'discoveries'::public.onboarding_stage
    when 'discoveries' then 'returnCollection'::public.onboarding_stage
    when 'returnCollection' then 'displayName'::public.onboarding_stage
    when 'displayName' then 'mascotChoice'::public.onboarding_stage
    when 'tutorial' then 'nestSetup'::public.onboarding_stage
    when 'nestSetup' then 'completed'::public.onboarding_stage
    else null
  end;
  if next_stage is distinct from allowed_next_stage then
    raise exception 'Invalid onboarding transition' using errcode = '22023';
  end if;

  if next_stage = 'mascotChoice' then
    normalized_display_name := normalize(
      btrim(regexp_replace(coalesce(requested_display_name, ''), '[[:space:]]+', ' ', 'g')), NFC
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
    display_name = case when next_stage = 'mascotChoice' then normalized_display_name else display_name end,
    updated_at = now()
  where auth_user_id = current_user_id returning * into onboarding_record;
  return onboarding_record;
end;
$$;

create or replace function public.save_initial_mascot_draft(
  template_id uuid,
  requested_mascot_name text
)
returns public.account_onboarding
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  onboarding_record public.account_onboarding;
  normalized_name text;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  select * into onboarding_record from public.account_onboarding
  where auth_user_id = current_user_id for update;
  if onboarding_record.stage <> 'mascotChoice' then
    raise exception 'Mascot choice is not available' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.mascot_templates
    where id = template_id and status = 'active'
      and catalog_key in ('mascot-nuvem', 'mascot-trovao', 'mascot-pipoca')
  ) then
    raise exception 'Invalid starter mascot archetype' using errcode = '22023';
  end if;
  normalized_name := normalize(
    btrim(regexp_replace(coalesce(requested_mascot_name, ''), '[[:space:]]+', ' ', 'g')), NFC
  );
  if normalized_name ~ '[[:cntrl:]]' or char_length(normalized_name) not between 2 and 24 then
    raise exception 'Invalid mascot name' using errcode = '22023';
  end if;
  update public.account_onboarding set
    selected_mascot_template_id = template_id,
    mascot_name = normalized_name,
    updated_at = now()
  where auth_user_id = current_user_id returning * into onboarding_record;
  return onboarding_record;
end;
$$;

create or replace function public.provision_initial_mascot()
returns jsonb
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  current_user_id uuid := auth.uid();
  onboarding_record public.account_onboarding;
  template_record public.mascot_templates;
  profile_record public.profiles;
  mascot_record public.player_mascots;
begin
  if current_user_id is null then
    raise exception 'Authentication required' using errcode = '28000';
  end if;
  select * into onboarding_record from public.account_onboarding
  where auth_user_id = current_user_id for update;
  if onboarding_record.auth_user_id is null then
    raise exception 'Onboarding was not initialized' using errcode = '22023';
  end if;

  if onboarding_record.stage = 'tutorial' then
    select * into strict profile_record from public.profiles where auth_user_id = current_user_id;
    select * into strict mascot_record from public.player_mascots
    where owner_profile_id = profile_record.id and is_starter;
    return jsonb_build_object('onboarding', to_jsonb(onboarding_record), 'profile', to_jsonb(profile_record), 'mascot', to_jsonb(mascot_record));
  end if;
  if onboarding_record.stage <> 'mascotChoice'
    or onboarding_record.display_name is null
    or onboarding_record.selected_mascot_template_id is null
    or onboarding_record.mascot_name is null then
    raise exception 'Mascot draft is incomplete' using errcode = '22023';
  end if;

  select * into strict template_record from public.mascot_templates
  where id = onboarding_record.selected_mascot_template_id and status = 'active'
    and catalog_key in ('mascot-nuvem', 'mascot-trovao', 'mascot-pipoca');

  insert into public.profiles (
    id, auth_user_id, display_name, home_latitude, home_longitude, home_label_key,
    postal_base_street, postal_base_neighborhood, postal_base_city, postal_base_state, postal_base_country
  ) values (
    gen_random_uuid(), current_user_id, onboarding_record.display_name, 0, 0,
    'onboarding.tutorialNestLabel', '', '', '', '', ''
  ) returning * into profile_record;

  insert into public.player_mascots (
    id, owner_profile_id, template_id, name, level, xp, next_level_xp,
    attributes, trait, equipment, skills, appearance, is_starter
  ) values (
    gen_random_uuid(), profile_record.id, template_record.id, onboarding_record.mascot_name,
    template_record.base_level, template_record.base_xp, template_record.next_level_xp,
    template_record.attributes, template_record.trait, template_record.equipment,
    template_record.skills, template_record.appearance, true
  ) returning * into mascot_record;

  update public.account_onboarding set stage = 'tutorial', updated_at = now()
  where auth_user_id = current_user_id returning * into onboarding_record;
  return jsonb_build_object('onboarding', to_jsonb(onboarding_record), 'profile', to_jsonb(profile_record), 'mascot', to_jsonb(mascot_record));
end;
$$;

revoke all on function public.save_initial_mascot_draft(uuid, text) from public;
revoke all on function public.provision_initial_mascot() from public;
grant execute on function public.save_initial_mascot_draft(uuid, text) to authenticated;
grant execute on function public.provision_initial_mascot() to authenticated;

comment on column public.player_mascots.is_starter is
  'Marks the one mascot atomically provisioned during account onboarding.';
