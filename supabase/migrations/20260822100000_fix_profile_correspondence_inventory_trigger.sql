-- The original migration was already applied in production. Replace the trigger
-- function there as well as keeping the source migration correct for fresh resets.

create or replace function public.provision_initial_correspondence_inventory()
returns trigger language plpgsql security definer set search_path=public as $$
begin
  perform 1 from public.profiles where id=new.id for update;

  insert into public.profile_sticker_balances(profile_id,sticker_catalog_key,quantity)
  select new.id,catalog_key,3
  from public.official_stickers
  where status='active'
  on conflict do nothing;

  return new;
end;
$$;

revoke all on function public.provision_initial_correspondence_inventory() from public;
