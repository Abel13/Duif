-- Milestone 52 reserves finite copies for future paid postcard art without implementing purchases.
create table public.profile_postcard_balances (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  postcard_catalog_key text not null references public.official_postcards(catalog_key),
  quantity integer not null default 0 check (quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key(profile_id,postcard_catalog_key)
);
alter table public.profile_postcard_balances enable row level security;
create policy "Owners read postcard balances" on public.profile_postcard_balances for select using (
  profile_id=(select id from public.profiles where auth_user_id=auth.uid())
);
grant select on public.profile_postcard_balances to authenticated;

drop function public.list_owned_postcards();
create function public.list_owned_postcards()
returns table(catalog_key text,name_key text,description_key text,artwork_asset_key text,availability text,quantity integer)
language plpgsql security definer set search_path=public,auth as $$
declare pid uuid;
begin
  select id into pid from public.profiles where auth_user_id=auth.uid();
  if pid is null then raise exception 'Authentication required' using errcode='28000'; end if;
  return query select p.catalog_key,p.name_key,p.description_key,p.artwork_asset_key,p.availability,
    case when p.availability='paid' then coalesce(b.quantity,0) else null end
  from public.official_postcards p
  left join public.profile_postcard_balances b on b.profile_id=pid and b.postcard_catalog_key=p.catalog_key
  where p.status='active' and (
    p.availability='base'
    or (p.availability='paid' and coalesce(b.quantity,0)>0 and exists(select 1 from public.profile_postcard_unlocks u where u.profile_id=pid and u.postcard_catalog_key=p.catalog_key))
    or (p.availability<>'paid' and exists(select 1 from public.profile_postcard_unlocks u where u.profile_id=pid and u.postcard_catalog_key=p.catalog_key))
    or (p.catalog_key='postcard-inaugural' and exists(select 1 from public.inventory_items i join public.reward_items r on r.id=i.reward_item_id where i.owner_profile_id=pid and r.catalog_key='reward-tutorial-inaugural-postcard'))
  ) order by p.sort_order,p.catalog_key;
end; $$;
revoke all on function public.list_owned_postcards() from public;
grant execute on function public.list_owned_postcards() to authenticated;

create or replace function public.consume_paid_postcard_copy()
returns trigger language plpgsql security definer set search_path=public as $$
declare owner_id uuid; card_kind text;
begin
  if new.correspondence_type<>'postcard' or new.postcard_catalog_key is null then return new; end if;
  select availability into card_kind from public.official_postcards where catalog_key=new.postcard_catalog_key;
  if card_kind<>'paid' then return new; end if;
  select sender_profile_id into owner_id from public.deliveries where id=new.delivery_id;
  update public.profile_postcard_balances set quantity=quantity-1,updated_at=now()
  where profile_id=owner_id and postcard_catalog_key=new.postcard_catalog_key and quantity>0;
  if not found then raise exception 'Paid postcard quantity unavailable' using errcode='22023'; end if;
  return new;
end; $$;
create trigger consume_paid_postcard_copy before insert on public.delivery_correspondence_contents
for each row execute function public.consume_paid_postcard_copy();
revoke all on function public.consume_paid_postcard_copy() from public;
