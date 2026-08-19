-- Serialize completion awards for one account before resolving first-route novelty.
create or replace function public.collect_delivery_progression_on_completion()
returns trigger language plpgsql security definer set search_path = public, auth as $$
begin
  if new.status = 'completed' and old.status is distinct from 'completed' and not new.is_tutorial then
    perform 1 from public.profiles where id = new.sender_profile_id for update;
    perform public.apply_delivery_progression(new.id);
  end if;
  return new;
end;
$$;
