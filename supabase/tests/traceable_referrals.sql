begin;

-- An invitation is private: only the aggregate and the public host name are exposed by RPCs.
insert into auth.users(id,email,aud,role,email_confirmed_at,created_at,updated_at)
values ('10000000-0000-4000-8000-000000009901','referrer@example.test','authenticated','authenticated',now(),now(),now());
insert into public.profiles(id,auth_user_id,display_name,home_latitude,home_longitude,home_label_key,postal_base_street,postal_base_neighborhood,postal_base_city,postal_base_state,postal_base_country)
values ('20000000-0000-4000-8000-000000009901','10000000-0000-4000-8000-000000009901','Host Postal',0,0,'onboarding.privateNestLabel','','','','','');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009901',true);
select public.ensure_my_referral_invitation();
update public.referral_invitation_links set token_digest=encode(extensions.digest('signed-test-token-which-is-long-enough-to-be-stored','sha256'),'hex') where inviter_profile_id='20000000-0000-4000-8000-000000009901';
do $$ begin
  if (select inviter_name from public.resolve_referral_invitation('signed-test-token-which-is-long-enough-to-be-stored')) <> 'Host Postal' then raise exception 'Referral resolver did not return the permitted public name'; end if;
  if exists(select 1 from public.resolve_referral_invitation('wrong-token')) then raise exception 'Invalid token resolved'; end if;
end $$;

-- A signup token is captured once and becomes qualified only after onboarding completion.
insert into auth.users(id,email,aud,role,email_confirmed_at,raw_user_meta_data,created_at,updated_at)
values ('10000000-0000-4000-8000-000000009902','invitee@example.test','authenticated','authenticated',now(),jsonb_build_object('duif_referral_token','signed-test-token-which-is-long-enough-to-be-stored'),now(),now());
insert into public.account_onboarding(auth_user_id,stage,display_name) values('10000000-0000-4000-8000-000000009902','welcome','Invitee One');
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009902',true);
do $$ begin
  if public.capture_referral_invitation('signed-test-token-which-is-long-enough-to-be-stored') <> 'captured' then raise exception 'New account was not captured'; end if;
  if public.capture_referral_invitation('signed-test-token-which-is-long-enough-to-be-stored') <> 'already_attributed' then raise exception 'Attribution was not idempotent'; end if;
end $$;
update public.account_onboarding set stage='completed',completed_at=now() where auth_user_id='10000000-0000-4000-8000-000000009902';
do $$ begin
  if (select count(*) from public.referral_attributions where inviter_profile_id='20000000-0000-4000-8000-000000009901' and qualified_at is not null) <> 1 then raise exception 'Onboarding completion did not qualify referral'; end if;
end $$;

-- Four further distinct completions make exactly one pending Owl grant.
insert into auth.users(id,email,aud,role,email_confirmed_at,created_at,updated_at)
select format('10000000-0000-4000-8000-00000000990%s',n)::uuid, format('invitee%s@example.test',n),'authenticated','authenticated',now(),now(),now() from generate_series(3,6) n;
insert into public.account_onboarding(auth_user_id,stage,display_name)
select format('10000000-0000-4000-8000-00000000990%s',n)::uuid,'welcome'::public.onboarding_stage,format('Invitee %s',n) from generate_series(3,6) n;
insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version)
select format('10000000-0000-4000-8000-00000000990%s',n)::uuid,'20000000-0000-4000-8000-000000009901',link.id,link.version from generate_series(3,6) n cross join public.referral_invitation_links link where link.inviter_profile_id='20000000-0000-4000-8000-000000009901';
update public.account_onboarding set stage='completed',completed_at=now() where auth_user_id between '10000000-0000-4000-8000-000000009903' and '10000000-0000-4000-8000-000000009906';
do $$ begin
  if (select status from public.referral_owl_rewards where owner_profile_id='20000000-0000-4000-8000-000000009901') <> 'pending' then raise exception 'Five qualifications did not unlock Owl'; end if;
end $$;
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009901',true);
select public.claim_referral_owl('Luar');
do $$ begin
  if (select count(*) from public.player_mascots where owner_profile_id='20000000-0000-4000-8000-000000009901' and template_id='00000000-0000-4000-8000-000000000204') <> 1 then raise exception 'Owl was not granted exactly once'; end if;
end $$;

rollback;
