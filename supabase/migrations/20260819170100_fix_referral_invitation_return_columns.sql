-- Repair the initial local deployment of 48A; fresh databases receive the corrected definitions above.
create or replace function public.ensure_my_referral_invitation()
returns table (link_id uuid, version integer)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid;
begin
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  insert into public.referral_invitation_links(inviter_profile_id) values (current_profile_id) on conflict (inviter_profile_id) do nothing;
  return query select link.id, link.version from public.referral_invitation_links link where link.inviter_profile_id=current_profile_id;
end;
$$;

create or replace function public.rotate_my_referral_invitation()
returns table (link_id uuid, version integer)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid;
begin
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  insert into public.referral_invitation_links(inviter_profile_id) values(current_profile_id) on conflict(inviter_profile_id) do nothing;
  return query update public.referral_invitation_links link set version=link.version+1, token_digest=null, rotated_at=now()
    where link.inviter_profile_id=current_profile_id returning link.id, link.version;
end;
$$;
