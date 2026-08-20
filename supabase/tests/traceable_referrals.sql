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
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009901',true);
select public.rotate_my_referral_invitation();
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009902',true);
do $$ begin
  if public.capture_referral_invitation('signed-test-token-which-is-long-enough-to-be-stored') <> 'already_attributed' then raise exception 'Signup attribution was not frozen'; end if;
  if public.capture_referral_invitation('signed-test-token-which-is-long-enough-to-be-stored') <> 'already_attributed' then raise exception 'Attribution was not idempotent'; end if;
end $$;
update public.account_onboarding set stage='completed',tutorial_collected_at=now(),completed_at=now() where auth_user_id='10000000-0000-4000-8000-000000009902';
do $$ begin
  if (select count(*) from public.referral_attributions where inviter_profile_id='20000000-0000-4000-8000-000000009901' and qualified_at is not null) <> 1 then raise exception 'Onboarding completion did not qualify referral'; end if;
end $$;

-- Neither an unconfirmed account nor a completed stage without tutorial collection qualifies.
insert into auth.users(id,email,aud,role,created_at,updated_at)
values ('10000000-0000-4000-8000-000000009908','unconfirmed@example.test','authenticated','authenticated',now(),now());
insert into public.account_onboarding(auth_user_id,stage,display_name)
values('10000000-0000-4000-8000-000000009908','welcome','Unconfirmed Invitee');
insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version)
select '10000000-0000-4000-8000-000000009908','20000000-0000-4000-8000-000000009901',id,version from public.referral_invitation_links where inviter_profile_id='20000000-0000-4000-8000-000000009901';
update public.account_onboarding set stage='completed',tutorial_collected_at=now(),completed_at=now() where auth_user_id='10000000-0000-4000-8000-000000009908';
insert into auth.users(id,email,aud,role,email_confirmed_at,created_at,updated_at)
values ('10000000-0000-4000-8000-000000009909','no-route@example.test','authenticated','authenticated',now(),now(),now());
insert into public.account_onboarding(auth_user_id,stage,display_name)
values('10000000-0000-4000-8000-000000009909','welcome','No Route Invitee');
insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version)
select '10000000-0000-4000-8000-000000009909','20000000-0000-4000-8000-000000009901',id,version from public.referral_invitation_links where inviter_profile_id='20000000-0000-4000-8000-000000009901';
update public.account_onboarding set stage='completed',completed_at=now() where auth_user_id='10000000-0000-4000-8000-000000009909';
do $$ begin
  if exists(select 1 from public.referral_attributions where invitee_auth_user_id in ('10000000-0000-4000-8000-000000009908','10000000-0000-4000-8000-000000009909') and qualified_at is not null) then raise exception 'Ineligible referral qualified'; end if;
end $$;

-- Four further distinct completions make exactly one pending Owl grant.
insert into auth.users(id,email,aud,role,email_confirmed_at,created_at,updated_at)
select format('10000000-0000-4000-8000-00000000990%s',n)::uuid, format('invitee%s@example.test',n),'authenticated','authenticated',now(),now(),now() from generate_series(3,6) n;
insert into public.account_onboarding(auth_user_id,stage,display_name)
select format('10000000-0000-4000-8000-00000000990%s',n)::uuid,'welcome'::public.onboarding_stage,format('Invitee %s',n) from generate_series(3,6) n;
insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version)
select format('10000000-0000-4000-8000-00000000990%s',n)::uuid,'20000000-0000-4000-8000-000000009901',link.id,link.version from generate_series(3,6) n cross join public.referral_invitation_links link where link.inviter_profile_id='20000000-0000-4000-8000-000000009901';
update public.account_onboarding set stage='completed',tutorial_collected_at=now(),completed_at=now() where auth_user_id between '10000000-0000-4000-8000-000000009903' and '10000000-0000-4000-8000-000000009906';
do $$ begin
  if (select status from public.referral_owl_rewards where owner_profile_id='20000000-0000-4000-8000-000000009901') <> 'pending' then raise exception 'Five qualifications did not unlock Owl'; end if;
end $$;

-- A confirmed fraud invalidation is admin-only, audited, and suspends an unclaimed reward.
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000009902","app_metadata":{}}',true);
do $$ begin
  perform public.admin_invalidate_referral(
    (select id from public.referral_attributions where invitee_auth_user_id='10000000-0000-4000-8000-000000009906'),
    'Unauthorized invalidation attempt'
  );
  raise exception 'Non-admin invalidated a referral';
exception when insufficient_privilege then null;
end $$;
update auth.users set raw_app_meta_data=jsonb_build_object('duif_role','admin') where id='10000000-0000-4000-8000-000000009901';
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000009901","app_metadata":{"duif_role":"admin"}}',true);
select public.admin_invalidate_referral(
  (select id from public.referral_attributions where invitee_auth_user_id='10000000-0000-4000-8000-000000009906'),
  'Confirmed disposable account abuse'
);
do $$ begin
  if exists(select 1 from public.referral_owl_rewards where owner_profile_id='20000000-0000-4000-8000-000000009901') then raise exception 'Pending Owl was not suspended'; end if;
  if (select count(*) from public.referral_attributions where inviter_profile_id='20000000-0000-4000-8000-000000009901' and qualified_at is not null and invalidated_at is null) <> 4 then raise exception 'Invalid referral still counted'; end if;
end $$;

-- A replacement fifth legitimate completion makes the reward available again.
insert into auth.users(id,email,aud,role,email_confirmed_at,created_at,updated_at)
values ('10000000-0000-4000-8000-000000009907','invitee7@example.test','authenticated','authenticated',now(),now(),now());
insert into public.account_onboarding(auth_user_id,stage,display_name)
values('10000000-0000-4000-8000-000000009907','welcome','Invitee Seven');
insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version)
select '10000000-0000-4000-8000-000000009907','20000000-0000-4000-8000-000000009901',id,version
from public.referral_invitation_links where inviter_profile_id='20000000-0000-4000-8000-000000009901';
update public.account_onboarding set stage='completed',tutorial_collected_at=now(),completed_at=now()
where auth_user_id='10000000-0000-4000-8000-000000009907';
select set_config('request.jwt.claim.sub','10000000-0000-4000-8000-000000009901',true);
select public.claim_referral_owl('Luar');
do $$ begin
  if (select count(*) from public.player_mascots where owner_profile_id='20000000-0000-4000-8000-000000009901' and template_id='00000000-0000-4000-8000-000000000204') <> 1 then raise exception 'Owl was not granted exactly once'; end if;
  begin
    perform public.claim_referral_owl('Outra Lume');
    raise exception 'Owl was claimed twice';
  exception when invalid_parameter_value then null;
  end;
  if (select appearance->>'portraitAssetKey' from public.mascot_templates where catalog_key='mascot-owl') <> 'mascot.portrait.lume' then raise exception 'Lume portrait was not registered on the catalog'; end if;
  if not exists(select 1 from public.official_asset_versions version join public.official_assets asset on asset.id=version.asset_id where asset.asset_key='mascot.portrait.lume' and version.status='active' and version.packaged_path='/assets/mascots/portraits/lume.webp') then raise exception 'Lume official asset is unavailable'; end if;
end $$;

-- Normal account deletion anonymizes the invited account without removing earned progress.
delete from auth.users where id='10000000-0000-4000-8000-000000009903';
do $$ begin
  if not exists(select 1 from public.referral_attributions where invitee_auth_user_id is null and inviter_profile_id='20000000-0000-4000-8000-000000009901' and qualified_at is not null) then raise exception 'Deleted invitee attribution was not preserved'; end if;
  if (select status from public.referral_owl_rewards where owner_profile_id='20000000-0000-4000-8000-000000009901') <> 'claimed' then raise exception 'Claimed Owl changed after invitee deletion'; end if;
end $$;

rollback;
