-- A mascot can only carry one open delivery. Preserve the first shipment when repairing
-- pre-constraint duplicates created by the old confirmation flow.
with ranked_open_deliveries as (
  select id, row_number() over (
    partition by mascot_id
    order by created_at asc, id asc
  ) as position
  from public.deliveries
  where status <> 'completed'
)
delete from public.deliveries delivery
using ranked_open_deliveries ranked
where delivery.id = ranked.id and ranked.position > 1;

create unique index deliveries_one_open_delivery_per_mascot_idx
  on public.deliveries (mascot_id)
  where status <> 'completed';

create or replace function public.prevent_concurrent_mascot_delivery()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.status <> 'completed' and exists (
    select 1 from public.deliveries delivery
    where delivery.mascot_id = new.mascot_id and delivery.status <> 'completed'
  ) then
    raise exception 'Mascot already has an open delivery' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_concurrent_mascot_delivery on public.deliveries;
create trigger prevent_concurrent_mascot_delivery
before insert on public.deliveries
for each row execute function public.prevent_concurrent_mascot_delivery();
