create or replace function public.collect_route_seed_packages() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare v_origin text; v_destination text; previous timestamptz; added integer;
begin
  if new.status <> 'completed' or old.status = 'completed' then return new; end if;
  if not exists(select 1 from public.delivery_seed_package_opportunities where delivery_id=new.id and result_package_key is not null) then return new; end if;
  v_origin := coalesce(new.route_identity->>'origin', new.origin_label_key);
  v_destination := coalesce(new.route_identity->>'destination', new.destination_label_key);
  perform pg_advisory_xact_lock(hashtextextended(new.mascot_id::text || ':' || v_origin || ':' || v_destination, 0));
  select c.last_package_found_at into previous from public.seed_package_route_cooldowns c
    where c.mascot_id=new.mascot_id and c.origin_key=v_origin and c.destination_key=v_destination for update;
  if previous is not null and previous > now() - interval '24 hours' then
    update public.delivery_seed_package_opportunities set suppressed=true where delivery_id=new.id and result_package_key is not null;
    return new;
  end if;
  with inserted as (
    insert into public.seed_package_ledger(profile_id,delivery_id,opportunity_id,package_catalog_key,seed_quantity)
    select new.sender_profile_id,new.id,id,result_package_key,result_seed_quantity
    from public.delivery_seed_package_opportunities where delivery_id=new.id and result_package_key is not null
    on conflict(opportunity_id) do nothing returning seed_quantity
  ) select coalesce(sum(seed_quantity),0) into added from inserted;
  if added > 0 then
    insert into public.profile_seed_balances(profile_id,quantity) values(new.sender_profile_id,added)
      on conflict(profile_id) do update set quantity=profile_seed_balances.quantity+excluded.quantity,updated_at=now();
    insert into public.seed_package_route_cooldowns(profile_id,mascot_id,origin_key,destination_key,last_package_found_at)
      values(new.sender_profile_id,new.mascot_id,v_origin,v_destination,now())
      on conflict(mascot_id,origin_key,destination_key) do update set last_package_found_at=excluded.last_package_found_at;
  end if;
  return new;
end $$;
