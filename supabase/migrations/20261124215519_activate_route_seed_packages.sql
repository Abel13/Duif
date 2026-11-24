-- Version 1: independent server-side draws, snapshotted at dispatch.
alter table public.delivery_seed_package_opportunities
  add column leg text check (leg in ('outbound', 'returning')),
  add column leg_progress double precision check (leg_progress > 0 and leg_progress < 1),
  add column effective_chance numeric,
  add column suppressed boolean not null default false;

-- Results must only be disclosed when reached through the function below.
revoke all on public.delivery_seed_package_opportunities from anon, authenticated;
revoke all on function public.credit_seed_packages(uuid) from public, anon, authenticated;
revoke all on function public.check_seed_package_cooldown(uuid,text,text) from public, anon, authenticated;

create function public.materialize_seed_packages() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  luck integer; n integer; i integer; total_weight numeric; chance numeric;
  roll double precision; selected public.seed_package_catalog; draw text;
begin
  if new.is_tutorial then return new; end if;
  n := least(5, floor(new.distance_km * 2 / 100)::integer);
  if n < 1 then return new; end if;
  select greatest(0, least(100, coalesce((attributes->>'luck')::integer, 0)))
    into luck from public.player_mascots where id = new.mascot_id;
  select coalesce(sum(base_chance_percent),0) into total_weight
    from public.seed_package_catalog where status='active' and min_distance_km <= new.distance_km * 2;
  if total_weight <= 0 then return new; end if;
  chance := least(95, total_weight * least(1.3, 1 + luck * 0.02));
  for i in 0..n-1 loop
    draw := gen_random_uuid()::text;
    roll := random() * total_weight;
    select c.* into selected from (
      select s.*, sum(s.base_chance_percent) over (order by s.tier, s.catalog_key) as upper_bound
      from public.seed_package_catalog s
      where s.status='active' and s.min_distance_km <= new.distance_km * 2
    ) c where roll < c.upper_bound order by c.tier, c.catalog_key limit 1;
    insert into public.delivery_seed_package_opportunities
      (delivery_id, opportunity_index, segment_index, catalog_version, eligible_packages,
       mascot_luck_snapshot, seed_value, result_package_key, result_seed_quantity,
       result_calculated_at, leg, leg_progress, effective_chance)
    values (new.id, i, 0, 1, '[]'::jsonb, luck, draw,
      case when random() * 100 < chance then selected.catalog_key end, null,
      now(), case when random() < 0.5 then 'outbound' else 'returning' end,
      greatest(0.000001, least(0.999999, random())), chance);
    update public.delivery_seed_package_opportunities set result_seed_quantity=selected.seed_quantity
      where delivery_id=new.id and opportunity_index=i and result_package_key is not null;
  end loop;
  return new;
end $$;
revoke all on function public.materialize_seed_packages() from public, anon, authenticated;
create trigger z_materialize_seed_packages after insert on public.deliveries
  for each row execute function public.materialize_seed_packages();

create function public.collect_route_seed_packages() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare pair text; origin_key text; destination_key text; previous timestamptz; added integer;
begin
  if new.status <> 'completed' or old.status = 'completed' then return new; end if;
  if not exists(select 1 from public.delivery_seed_package_opportunities where delivery_id=new.id and result_package_key is not null) then return new; end if;
  origin_key := coalesce(new.route_identity->>'origin', new.origin_label_key);
  destination_key := coalesce(new.route_identity->>'destination', new.destination_label_key);
  pair := new.mascot_id::text || ':' || origin_key || ':' || destination_key;
  perform pg_advisory_xact_lock(hashtextextended(pair, 0));
  select last_package_found_at into previous from public.seed_package_route_cooldowns
    where mascot_id=new.mascot_id and seed_package_route_cooldowns.origin_key=collect_route_seed_packages.origin_key
      and seed_package_route_cooldowns.destination_key=collect_route_seed_packages.destination_key for update;
  if previous is not null and previous > now() - interval '24 hours' then
    update public.delivery_seed_package_opportunities set suppressed=true where delivery_id=new.id and result_package_key is not null;
    return new;
  end if;
  with inserted as (
    insert into public.seed_package_ledger(profile_id, delivery_id, opportunity_id, package_catalog_key, seed_quantity)
    select new.sender_profile_id, new.id, id, result_package_key, result_seed_quantity
    from public.delivery_seed_package_opportunities where delivery_id=new.id and result_package_key is not null
    on conflict(opportunity_id) do nothing returning seed_quantity
  ) select coalesce(sum(seed_quantity),0) into added from inserted;
  if added > 0 then
    insert into public.profile_seed_balances(profile_id,quantity) values(new.sender_profile_id,added)
      on conflict(profile_id) do update set quantity=profile_seed_balances.quantity+excluded.quantity, updated_at=now();
    insert into public.seed_package_route_cooldowns(profile_id,mascot_id,origin_key,destination_key,last_package_found_at)
      values(new.sender_profile_id,new.mascot_id,origin_key,destination_key,now())
      on conflict(mascot_id,origin_key,destination_key) do update set last_package_found_at=excluded.last_package_found_at;
  end if;
  return new;
end $$;
revoke all on function public.collect_route_seed_packages() from public, anon, authenticated;
create trigger collect_route_seed_packages_on_completion after update of status on public.deliveries
  for each row execute function public.collect_route_seed_packages();

create function public.list_reached_seed_packages(target_delivery_id uuid)
returns table(id uuid, package_key text, quantity integer, leg text, leg_progress double precision, suppressed boolean)
language sql stable security definer set search_path=public,auth,pg_temp as $$
  select o.id, o.result_package_key, o.result_seed_quantity, o.leg, o.leg_progress, o.suppressed
  from public.delivery_seed_package_opportunities o join public.deliveries d on d.id=o.delivery_id
  join public.profiles p on p.id=d.sender_profile_id and p.auth_user_id=auth.uid()
  where d.id=target_delivery_id and o.result_package_key is not null and o.leg is not null
    and ((o.leg='outbound' and now() >= d.outbound_start_at + (d.outbound_arrival_at-d.outbound_start_at)*o.leg_progress)
      or (o.leg='returning' and d.return_start_at is not null and d.return_arrival_at is not null
        and now() >= d.return_start_at + (d.return_arrival_at-d.return_start_at)*o.leg_progress));
$$;
revoke all on function public.list_reached_seed_packages(uuid) from public, anon;
grant execute on function public.list_reached_seed_packages(uuid) to authenticated;
