begin;

do $$
begin
  if (select count(*) from auth.users) <> 0 then
    raise exception 'Auth users must be empty after the clean foundation seed';
  end if;
  if (select count(*) from public.profiles) <> 0
    or (select count(*) from public.account_onboarding) <> 0
    or (select count(*) from public.player_mascots) <> 0
    or (select count(*) from public.deliveries) <> 0
    or (select count(*) from public.inventory_items) <> 0 then
    raise exception 'Player-owned tables must be empty after the clean foundation seed';
  end if;
  if (select count(*) from public.mascot_templates) <> 3 then
    raise exception 'Exactly three official starter archetypes must remain';
  end if;
  if (select count(*) from public.correspondence_options) <> 4 then
    raise exception 'Official correspondence options were not preserved';
  end if;
  if (select count(*) from public.reward_items) <> 9 then
    raise exception 'Official reward catalog was not preserved';
  end if;
  if (select count(*) from public.route_reward_points) <> 6 then
    raise exception 'Official route point catalog was not preserved';
  end if;
  if to_regprocedure('public.claim_current_profile()') is not null then
    raise exception 'Legacy seeded-profile claim RPC must not exist';
  end if;
end;
$$;

rollback;
