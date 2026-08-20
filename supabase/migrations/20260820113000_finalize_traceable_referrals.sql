-- Close Milestone 48A: durable attribution, fraud invalidation, and the official Lume portrait.

alter table public.referral_attributions add column id uuid default gen_random_uuid();
alter table public.referral_attributions drop constraint referral_attributions_pkey;
alter table public.referral_attributions alter column id set not null;
alter table public.referral_attributions add primary key (id);
alter table public.referral_attributions drop constraint referral_attributions_invitee_auth_user_id_fkey;
alter table public.referral_attributions alter column invitee_auth_user_id drop not null;
alter table public.referral_attributions
  add constraint referral_attributions_invitee_auth_user_id_fkey
  foreign key (invitee_auth_user_id) references auth.users(id) on delete set null;
create unique index referral_attributions_active_invitee_idx
  on public.referral_attributions(invitee_auth_user_id) where invitee_auth_user_id is not null;

alter table public.referral_attributions
  add column invalidated_at timestamptz,
  add column invalidated_by_auth_user_id uuid references auth.users(id) on delete set null,
  add column invalidation_reason text,
  add constraint referral_attributions_invalidation_complete check (
    (invalidated_at is null and invalidated_by_auth_user_id is null and invalidation_reason is null)
    or
    (invalidated_at is not null and invalidated_by_auth_user_id is not null
      and char_length(invalidation_reason) between 10 and 500)
  );

alter table public.referral_audit_events drop constraint referral_audit_events_event_type_check;
alter table public.referral_audit_events add constraint referral_audit_events_event_type_check
  check (event_type in ('captured', 'qualified', 'owl_available', 'owl_claimed', 'referral_invalidated'));

-- Freeze a valid inviter snapshot as soon as auth creates the invited account. Email confirmation
-- and tutorial completion still gate qualification; rotation only affects later signups.
create or replace function public.capture_referral_signup_token()
returns trigger language plpgsql security definer set search_path=public,auth as $$
declare
  supplied_token text;
  supplied_digest text;
  selected_link public.referral_invitation_links;
begin
  supplied_token := new.raw_user_meta_data ->> 'duif_referral_token';
  if supplied_token is null or length(supplied_token) not between 40 and 512 then return new; end if;
  supplied_digest := encode(extensions.digest(supplied_token, 'sha256'), 'hex');
  insert into public.referral_signup_tokens(auth_user_id, token_digest)
  values (new.id, supplied_digest) on conflict (auth_user_id) do nothing;
  select * into selected_link from public.referral_invitation_links where token_digest=supplied_digest;
  if selected_link.id is null then return new; end if;
  if exists(select 1 from public.profiles where id=selected_link.inviter_profile_id and auth_user_id=new.id) then return new; end if;
  insert into public.referral_attributions(
    invitee_auth_user_id, inviter_profile_id, invitation_link_id, invitation_version
  ) values (new.id, selected_link.inviter_profile_id, selected_link.id, selected_link.version)
  on conflict (invitee_auth_user_id) where invitee_auth_user_id is not null do nothing;
  if found then
    insert into public.referral_audit_events(inviter_profile_id,invitee_auth_user_id,event_type,metadata)
    values(selected_link.inviter_profile_id,new.id,'captured',jsonb_build_object('linkVersion',selected_link.version,'capturedAt','signup'));
  end if;
  return new;
end;
$$;

create or replace function public.capture_referral_invitation(invitation_token text)
returns text language plpgsql security definer set search_path=public,auth as $$
declare
  current_user_id uuid:=auth.uid();
  bucket timestamptz:=date_trunc('minute',now());
  attempts integer;
  signup_token public.referral_signup_tokens;
  selected_link public.referral_invitation_links;
  inviter_id uuid;
  email_confirmed timestamptz;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  insert into public.referral_capture_rate_limits(auth_user_id,bucket_start) values(current_user_id,bucket)
    on conflict(auth_user_id,bucket_start) do update set attempt_count=public.referral_capture_rate_limits.attempt_count+1
    returning attempt_count into attempts;
  if attempts > 10 then raise exception 'Invitation rate limit reached' using errcode='22023'; end if;
  select * into signup_token from public.referral_signup_tokens where auth_user_id=current_user_id;
  if signup_token.auth_user_id is null or signup_token.token_digest<>encode(extensions.digest(invitation_token,'sha256'),'hex') then return 'not_new_account'; end if;
  select email_confirmed_at into email_confirmed from auth.users where id=current_user_id;
  if email_confirmed is null then return 'email_unconfirmed'; end if;
  if exists(select 1 from public.referral_attributions where invitee_auth_user_id=current_user_id) then return 'already_attributed'; end if;
  select * into selected_link from public.referral_invitation_links where token_digest=signup_token.token_digest;
  if selected_link.id is null then return 'invalid'; end if;
  inviter_id:=selected_link.inviter_profile_id;
  if exists(select 1 from public.profiles where id=inviter_id and auth_user_id=current_user_id) then return 'self_referral'; end if;
  insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version)
    values(current_user_id,inviter_id,selected_link.id,selected_link.version)
    on conflict(invitee_auth_user_id) where invitee_auth_user_id is not null do nothing;
  if not found then return 'already_attributed'; end if;
  insert into public.referral_audit_events(inviter_profile_id,invitee_auth_user_id,event_type,metadata)
    values(inviter_id,current_user_id,'captured',jsonb_build_object('linkVersion',selected_link.version,'capturedAt','session'));
  return 'captured';
end;
$$;

create or replace function public.qualify_referral_on_onboarding_complete()
returns trigger language plpgsql security definer set search_path=public,auth as $$
declare attribution public.referral_attributions; total integer;
begin
  if new.stage<>'completed' or old.stage='completed' or new.tutorial_collected_at is null then return new; end if;
  select * into attribution from public.referral_attributions
    where invitee_auth_user_id=new.auth_user_id and qualified_at is null and invalidated_at is null for update;
  if attribution.id is null then return new; end if;
  if not exists(select 1 from auth.users where id=new.auth_user_id and email_confirmed_at is not null) then return new; end if;
  perform 1 from public.profiles where id=attribution.inviter_profile_id for update;
  update public.referral_attributions set qualified_at=now()
    where id=attribution.id and qualified_at is null and invalidated_at is null;
  if not found then return new; end if;
  insert into public.referral_audit_events(inviter_profile_id,invitee_auth_user_id,event_type)
    values(attribution.inviter_profile_id,new.auth_user_id,'qualified');
  select count(*) into total from public.referral_attributions
    where inviter_profile_id=attribution.inviter_profile_id and qualified_at is not null and invalidated_at is null;
  if total>=5 then
    insert into public.referral_owl_rewards(owner_profile_id) values(attribution.inviter_profile_id) on conflict(owner_profile_id) do nothing;
    if found then insert into public.referral_audit_events(inviter_profile_id,event_type,metadata)
      values(attribution.inviter_profile_id,'owl_available',jsonb_build_object('qualifiedCount',total)); end if;
  end if;
  return new;
end;
$$;

create or replace function public.get_my_referral_progress()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid; link public.referral_invitation_links; reward public.referral_owl_rewards; qualified integer;
begin
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  select * into link from public.referral_invitation_links where inviter_profile_id=current_profile_id;
  select * into reward from public.referral_owl_rewards where owner_profile_id=current_profile_id;
  select count(*) into qualified from public.referral_attributions
    where inviter_profile_id=current_profile_id and qualified_at is not null and invalidated_at is null;
  return jsonb_build_object('hasInvitation',link.id is not null,'qualifiedCount',qualified,'targetCount',5,
    'owlStatus',coalesce(reward.status,'locked'),'owlMascotId',reward.mascot_id);
end;
$$;

create or replace function public.admin_invalidate_referral(attribution_id uuid, reason text)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare target public.referral_attributions; normalized_reason text; total integer; reward public.referral_owl_rewards;
begin
  if not public.is_asset_admin() then raise exception 'Referral administration requires an admin role' using errcode='42501'; end if;
  normalized_reason:=btrim(regexp_replace(coalesce(reason,''),'[[:space:]]+',' ','g'));
  if char_length(normalized_reason) not between 10 and 500 then raise exception 'Invalid referral invalidation reason' using errcode='22023'; end if;
  select * into target from public.referral_attributions where id=attribution_id for update;
  if target.id is null then raise exception 'Referral attribution not found' using errcode='22023'; end if;
  perform 1 from public.profiles where id=target.inviter_profile_id for update;
  if target.invalidated_at is null then
    update public.referral_attributions set invalidated_at=now(),invalidated_by_auth_user_id=auth.uid(),invalidation_reason=normalized_reason
      where id=target.id returning * into target;
    insert into public.referral_audit_events(inviter_profile_id,invitee_auth_user_id,event_type,metadata)
      values(target.inviter_profile_id,target.invitee_auth_user_id,'referral_invalidated',jsonb_build_object('attributionId',target.id,'reason',normalized_reason));
  end if;
  select count(*) into total from public.referral_attributions
    where inviter_profile_id=target.inviter_profile_id and qualified_at is not null and invalidated_at is null;
  select * into reward from public.referral_owl_rewards where owner_profile_id=target.inviter_profile_id for update;
  if total<5 and reward.status='pending' then
    delete from public.referral_owl_rewards where owner_profile_id=target.inviter_profile_id and status='pending';
    reward.status:=null;
  end if;
  return jsonb_build_object('attributionId',target.id,'invalidatedAt',target.invalidated_at,
    'qualifiedCount',total,'targetCount',5,'owlStatus',coalesce(reward.status,'locked'));
end;
$$;

create or replace function public.claim_referral_owl(requested_name text)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_profile public.profiles; reward public.referral_owl_rewards; template public.mascot_templates; mascot public.player_mascots; normalized_name text; qualified integer;
begin
  select * into current_profile from public.profiles where auth_user_id=auth.uid() for update;
  if current_profile.id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  select count(*) into qualified from public.referral_attributions where inviter_profile_id=current_profile.id and qualified_at is not null and invalidated_at is null;
  select * into reward from public.referral_owl_rewards where owner_profile_id=current_profile.id for update;
  if qualified<5 or reward.owner_profile_id is null or reward.status<>'pending' then raise exception 'Owl reward unavailable' using errcode='22023'; end if;
  normalized_name:=normalize(btrim(regexp_replace(coalesce(requested_name,''),'[[:space:]]+',' ','g')),NFC);
  if normalized_name~'[[:cntrl:]]' or char_length(normalized_name) not between 2 and 24 then raise exception 'Invalid mascot name' using errcode='22023'; end if;
  select * into template from public.mascot_templates where catalog_key='mascot-owl' and status='active';
  if template.id is null then raise exception 'Owl catalog unavailable' using errcode='22023'; end if;
  insert into public.player_mascots(id,owner_profile_id,template_id,name,level,xp,next_level_xp,attributes,trait,equipment,skills,appearance,is_starter)
  values(gen_random_uuid(),current_profile.id,template.id,normalized_name,template.base_level,template.base_xp,template.next_level_xp,template.attributes,template.trait,template.equipment,template.skills,template.appearance,false)
  returning * into mascot;
  update public.referral_owl_rewards set status='claimed',mascot_id=mascot.id,claimed_at=now() where owner_profile_id=current_profile.id;
  insert into public.referral_audit_events(inviter_profile_id,event_type,metadata) values(current_profile.id,'owl_claimed',jsonb_build_object('mascotId',mascot.id));
  return jsonb_build_object('mascot',to_jsonb(mascot));
end;
$$;

revoke all on function public.admin_invalidate_referral(uuid,text) from public;
grant execute on function public.admin_invalidate_referral(uuid,text) to authenticated;

insert into public.official_assets(asset_key,asset_type)
values('mascot.portrait.lume','mascotPortrait') on conflict(asset_key) do nothing;
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select asset.id,1,'packaged','active','/assets/mascots/portraits/lume.webp','image/webp',640,640,111276,'appearance.owlPortrait',false,'DUIF',jsonb_build_object('kind','mascotPortrait')
from public.official_assets asset where asset.asset_key='mascot.portrait.lume'
on conflict(asset_id,version) do update set status=excluded.status,packaged_path=excluded.packaged_path,mime_type=excluded.mime_type,width=excluded.width,height=excluded.height,byte_size=excluded.byte_size,alt_text_key=excluded.alt_text_key,is_decorative=excluded.is_decorative,author=excluded.author,metadata=excluded.metadata;
update public.mascot_templates set appearance=(appearance-'portraitPlaceholderKey')||jsonb_build_object('portraitAssetKey','mascot.portrait.lume')
where catalog_key='mascot-owl';
update public.player_mascots set appearance=(appearance-'portraitPlaceholderKey')||jsonb_build_object('portraitAssetKey','mascot.portrait.lume')
where template_id='00000000-0000-4000-8000-000000000204';
