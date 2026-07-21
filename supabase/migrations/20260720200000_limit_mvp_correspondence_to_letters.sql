create or replace function public.enforce_mvp_letter_correspondence()
returns trigger language plpgsql set search_path=public as $$
begin
  if new.correspondence_type <> 'letter' then
    raise exception 'Only letters are available during the MVP' using errcode='22023';
  end if;
  return new;
end;
$$;

create trigger enforce_mvp_letter_correspondence
before insert or update of correspondence_type on public.delivery_correspondence_contents
for each row execute function public.enforce_mvp_letter_correspondence();
