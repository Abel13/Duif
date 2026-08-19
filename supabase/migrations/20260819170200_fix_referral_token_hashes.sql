create or replace function public.capture_referral_signup_token()
returns trigger language plpgsql security definer set search_path=public,auth as $$
declare supplied_token text;
begin
  supplied_token := new.raw_user_meta_data ->> 'duif_referral_token';
  if supplied_token is not null and length(supplied_token) between 40 and 512 then
    insert into public.referral_signup_tokens(auth_user_id, token_digest) values (new.id, encode(extensions.digest(supplied_token, 'sha256'), 'hex')) on conflict (auth_user_id) do nothing;
  end if;
  return new;
end;
$$;

create or replace function public.resolve_referral_invitation(invitation_token text)
returns table (inviter_name text) language plpgsql security definer set search_path=public,auth as $$
begin
  return query select profile.display_name from public.referral_invitation_links link join public.profiles profile on profile.id=link.inviter_profile_id where link.token_digest=encode(extensions.digest(invitation_token,'sha256'),'hex');
end;
$$;

create or replace function public.capture_referral_invitation(invitation_token text)
returns text language plpgsql security definer set search_path=public,auth as $$
declare current_user_id uuid:=auth.uid(); bucket timestamptz:=date_trunc('minute',now()); attempts integer; signup_token public.referral_signup_tokens; selected_link public.referral_invitation_links; inviter_id uuid; email_confirmed timestamptz;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  insert into public.referral_capture_rate_limits(auth_user_id,bucket_start) values(current_user_id,bucket) on conflict(auth_user_id,bucket_start) do update set attempt_count=public.referral_capture_rate_limits.attempt_count+1 returning attempt_count into attempts;
  if attempts > 10 then raise exception 'Invitation rate limit reached' using errcode='22023'; end if;
  select * into signup_token from public.referral_signup_tokens where auth_user_id=current_user_id;
  if signup_token.auth_user_id is null or signup_token.token_digest<>encode(extensions.digest(invitation_token,'sha256'),'hex') then return 'not_new_account'; end if;
  select email_confirmed_at into email_confirmed from auth.users where id=current_user_id; if email_confirmed is null then return 'email_unconfirmed'; end if;
  select * into selected_link from public.referral_invitation_links where token_digest=signup_token.token_digest; if selected_link.id is null then return 'invalid'; end if;
  if exists(select 1 from public.referral_attributions where invitee_auth_user_id=current_user_id) then return 'already_attributed'; end if;
  select id into inviter_id from public.profiles where id=selected_link.inviter_profile_id; if inviter_id is null then return 'invalid'; end if;
  if exists(select 1 from public.profiles where id=inviter_id and auth_user_id=current_user_id) then return 'self_referral'; end if;
  insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version) values(current_user_id,inviter_id,selected_link.id,selected_link.version) on conflict(invitee_auth_user_id) do nothing;
  if not found then return 'already_attributed'; end if;
  insert into public.referral_audit_events(inviter_profile_id,invitee_auth_user_id,event_type,metadata) values(inviter_id,current_user_id,'captured',jsonb_build_object('linkVersion',selected_link.version)); return 'captured';
end;
$$;
