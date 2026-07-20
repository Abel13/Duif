\pset tuples_only on
\pset format unaligned
select jsonb_build_object(
  'auth_users', (select count(*) from auth.users),
  'account_onboarding', (select count(*) from public.account_onboarding),
  'profiles', (select count(*) from public.profiles),
  'player_mascots', (select count(*) from public.player_mascots),
  'friendships', (select count(*) from public.friendships),
  'deliveries', (select count(*) from public.deliveries),
  'correspondence_contents', (select count(*) from public.delivery_correspondence_contents),
  'delivery_rewards', (select count(*) from public.delivery_rewards),
  'route_discoveries', (select count(*) from public.delivery_route_discoveries),
  'inventory_items', (select count(*) from public.inventory_items)
);
