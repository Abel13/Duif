begin;

do $$
declare
  draft_id uuid := '00000000-0000-4000-8000-000000009801';
begin
  insert into public.reward_items (
    id, catalog_key, name_key, description_key, rarity, status
  ) values (
    draft_id, 'reward-draft-incomplete', null, null, 'common', 'draft'
  );

  begin
    perform public.set_official_catalog_status('rewardItem', draft_id, 'active');
    raise exception 'Incomplete draft was activated';
  exception when check_violation then null;
  end;

  update public.reward_items set
    name_key = 'rewards.items.wornRouteStamp.name',
    description_key = 'rewards.items.wornRouteStamp.description'
  where id = draft_id;
  perform public.set_official_catalog_status('rewardItem', draft_id, 'active');

  if (select status from public.reward_items where id = draft_id) <> 'active' then
    raise exception 'Complete draft was not activated';
  end if;
end;
$$;

do $$
begin
  begin
    update public.mascot_templates
      set skills = '[{"nameKey":"unknown.skill","descriptionKey":"skills.longRoute.description","id":"bad","level":1}]'::jsonb
    where catalog_key = 'mascot-nuvem';
    raise exception 'Invalid nested translation key was accepted';
  exception when check_violation then null;
  end;
end;
$$;

do $$
declare
  target_table text;
begin
  foreach target_table in array array[
    'profiles', 'player_mascots', 'friendships', 'deliveries',
    'delivery_rewards', 'inventory_items'
  ] loop
    if exists (
      select 1 from information_schema.columns
      where table_schema = 'public' and information_schema.columns.table_name = target_table
        and column_name = 'mock_key'
    ) then raise exception 'Legacy mock_key remains on %', target_table; end if;
  end loop;

  if exists (
    select 1 from public.official_translation_keys
    where not has_pt_br or not has_en_us
  ) then raise exception 'Incomplete official translation key exists'; end if;

  if (select count(*) from public.mascot_templates where status = 'active') <> 3
    or not exists (
      select 1 from public.mascot_templates
      where id = '00000000-0000-4000-8000-000000000201'
        and catalog_key = 'mascot-nuvem'
        and species_key = 'species.carrierPigeon'
        and suggested_name_key = 'archetypes.suggestedNames.nuvem'
    )
  then raise exception 'Starter archetype identities were not preserved'; end if;

  if to_regprocedure('public.create_delivery_from_selection(uuid,uuid,text,jsonb)') is null
    or to_regprocedure('public.collect_delivery_reward(uuid)') is null
    or to_regprocedure('public.collect_delivery_reward(text)') is not null
  then raise exception 'Gameplay RPC signatures are not UUID-only'; end if;
end;
$$;

rollback;
