\set ON_ERROR_STOP on

begin;

create temporary table reset_counts as
select
  (select count(*) from auth.users) as auth_users,
  (select count(*) from public.profiles) as profiles,
  (select count(*) from public.player_mascots) as player_mascots,
  (select count(*) from public.friendships) as friendships,
  (select count(*) from public.deliveries) as deliveries,
  (select count(*) from public.delivery_correspondence_contents) as correspondence_contents,
  (select count(*) from public.delivery_rewards) as delivery_rewards,
  (select count(*) from public.delivery_route_discoveries) as route_discoveries,
  (select count(*) from public.inventory_items) as inventory_items;

\if :dry_run
  table reset_counts;
  rollback;
\else
  select :'confirmation' = :'expected_confirmation' as confirmed \gset
  \if :confirmed
  \else
    \echo 'Confirmation does not match the expected project/count token.'
    rollback;
    select 1 / 0;
  \endif

  delete from public.delivery_route_discoveries;
  delete from public.delivery_correspondence_contents;
  delete from public.delivery_rewards;
  delete from public.inventory_items;
  delete from public.deliveries;
  delete from public.friendships;
  delete from public.player_mascots;
  delete from public.profiles;
  delete from auth.users;

  insert into public.player_data_reset_audit (
    environment, project_ref, operator_label, backup_identifier, deleted_counts
  )
  select
    :'environment', :'project_ref', :'operator_label', :'backup_identifier',
    jsonb_build_object(
      'auth_users', auth_users,
      'profiles', profiles,
      'player_mascots', player_mascots,
      'friendships', friendships,
      'deliveries', deliveries,
      'correspondence_contents', correspondence_contents,
      'delivery_rewards', delivery_rewards,
      'route_discoveries', route_discoveries,
      'inventory_items', inventory_items
    )
  from reset_counts;

  commit;
\endif
