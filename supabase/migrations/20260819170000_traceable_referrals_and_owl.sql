-- Milestone 48A: private, attributable invitations and the one-time Owl reward.
create table public.referral_invitation_links (
  id uuid primary key default gen_random_uuid(),
  inviter_profile_id uuid not null unique references public.profiles(id) on delete cascade,
  version integer not null default 1 check (version > 0),
  token_digest text,
  created_at timestamptz not null default now(),
  rotated_at timestamptz not null default now()
);

create table public.referral_signup_tokens (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  token_digest text not null,
  created_at timestamptz not null default now()
);

create table public.referral_attributions (
  invitee_auth_user_id uuid primary key references auth.users(id) on delete cascade,
  inviter_profile_id uuid not null references public.profiles(id) on delete cascade,
  invitation_link_id uuid not null references public.referral_invitation_links(id) on delete restrict,
  invitation_version integer not null check (invitation_version > 0),
  captured_at timestamptz not null default now(),
  qualified_at timestamptz
);

create table public.referral_audit_events (
  id uuid primary key default gen_random_uuid(),
  inviter_profile_id uuid references public.profiles(id) on delete set null,
  invitee_auth_user_id uuid references auth.users(id) on delete set null,
  event_type text not null check (event_type in ('captured', 'qualified', 'owl_available', 'owl_claimed')),
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb
);

create table public.referral_owl_rewards (
  owner_profile_id uuid primary key references public.profiles(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'claimed')),
  mascot_id uuid unique references public.player_mascots(id) on delete restrict,
  available_at timestamptz not null default now(),
  claimed_at timestamptz
);

create table public.referral_capture_rate_limits (
  auth_user_id uuid not null references auth.users(id) on delete cascade,
  bucket_start timestamptz not null,
  attempt_count integer not null default 1 check (attempt_count > 0),
  primary key (auth_user_id, bucket_start)
);

create index referral_attributions_inviter_idx on public.referral_attributions(inviter_profile_id) where qualified_at is not null;

alter table public.referral_invitation_links enable row level security;
alter table public.referral_signup_tokens enable row level security;
alter table public.referral_attributions enable row level security;
alter table public.referral_audit_events enable row level security;
alter table public.referral_owl_rewards enable row level security;
alter table public.referral_capture_rate_limits enable row level security;
revoke all on public.referral_invitation_links, public.referral_signup_tokens, public.referral_attributions,
  public.referral_audit_events, public.referral_owl_rewards, public.referral_capture_rate_limits from anon, authenticated;

create or replace function public.capture_referral_signup_token()
returns trigger language plpgsql security definer set search_path=public,auth as $$
declare supplied_token text;
begin
  supplied_token := new.raw_user_meta_data ->> 'duif_referral_token';
  if supplied_token is not null and length(supplied_token) between 40 and 512 then
    insert into public.referral_signup_tokens(auth_user_id, token_digest)
    values (new.id, encode(extensions.digest(supplied_token, 'sha256'), 'hex'))
    on conflict (auth_user_id) do nothing;
  end if;
  return new;
end;
$$;

drop trigger if exists capture_duif_referral_signup_token on auth.users;
create trigger capture_duif_referral_signup_token
  after insert on auth.users for each row execute function public.capture_referral_signup_token();

create or replace function public.ensure_my_referral_invitation()
returns table (link_id uuid, version integer)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid;
begin
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  insert into public.referral_invitation_links(inviter_profile_id)
  values (current_profile_id) on conflict (inviter_profile_id) do nothing;
  return query select link.id, link.version from public.referral_invitation_links link where link.inviter_profile_id=current_profile_id;
end;
$$;

create or replace function public.store_my_referral_invitation_digest(link_id uuid, link_version integer, digest_value text)
returns void language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid;
begin
  if digest_value !~ '^[a-f0-9]{64}$' then raise exception 'Invalid invitation token' using errcode='22023'; end if;
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  update public.referral_invitation_links set token_digest=digest_value
    where id=link_id and inviter_profile_id=current_profile_id and version=link_version;
  if not found then raise exception 'Invitation unavailable' using errcode='22023'; end if;
end;
$$;

create or replace function public.rotate_my_referral_invitation()
returns table (link_id uuid, version integer)
language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid;
begin
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  insert into public.referral_invitation_links(inviter_profile_id) values(current_profile_id)
    on conflict(inviter_profile_id) do nothing;
  return query update public.referral_invitation_links link set version=link.version+1, token_digest=null, rotated_at=now()
    where link.inviter_profile_id=current_profile_id returning link.id, link.version;
end;
$$;

create or replace function public.resolve_referral_invitation(invitation_token text)
returns table (inviter_name text)
language plpgsql security definer set search_path=public,auth as $$
begin
  return query select profile.display_name
    from public.referral_invitation_links link join public.profiles profile on profile.id=link.inviter_profile_id
    where link.token_digest=encode(extensions.digest(invitation_token, 'sha256'), 'hex');
end;
$$;

create or replace function public.capture_referral_invitation(invitation_token text)
returns text language plpgsql security definer set search_path=public,auth as $$
declare current_user_id uuid:=auth.uid(); bucket timestamptz:=date_trunc('minute',now()); attempts integer;
  signup_token public.referral_signup_tokens; selected_link public.referral_invitation_links; inviter_id uuid; email_confirmed timestamptz;
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
  select * into selected_link from public.referral_invitation_links where token_digest=signup_token.token_digest;
  if selected_link.id is null then return 'invalid'; end if;
  if exists(select 1 from public.referral_attributions where invitee_auth_user_id=current_user_id) then return 'already_attributed'; end if;
  select id into inviter_id from public.profiles where id=selected_link.inviter_profile_id;
  if inviter_id is null then return 'invalid'; end if;
  if exists(select 1 from public.profiles where id=inviter_id and auth_user_id=current_user_id) then return 'self_referral'; end if;
  insert into public.referral_attributions(invitee_auth_user_id,inviter_profile_id,invitation_link_id,invitation_version)
    values(current_user_id,inviter_id,selected_link.id,selected_link.version) on conflict(invitee_auth_user_id) do nothing;
  if not found then return 'already_attributed'; end if;
  insert into public.referral_audit_events(inviter_profile_id,invitee_auth_user_id,event_type,metadata)
    values(inviter_id,current_user_id,'captured',jsonb_build_object('linkVersion',selected_link.version));
  return 'captured';
end;
$$;

create or replace function public.qualify_referral_on_onboarding_complete()
returns trigger language plpgsql security definer set search_path=public,auth as $$
declare attribution public.referral_attributions; total integer;
begin
  if new.stage<>'completed' or old.stage='completed' then return new; end if;
  select * into attribution from public.referral_attributions where invitee_auth_user_id=new.auth_user_id and qualified_at is null for update;
  if attribution.invitee_auth_user_id is null then return new; end if;
  if not exists(select 1 from auth.users where id=new.auth_user_id and email_confirmed_at is not null) then return new; end if;
  update public.referral_attributions set qualified_at=now() where invitee_auth_user_id=new.auth_user_id and qualified_at is null;
  if not found then return new; end if;
  insert into public.referral_audit_events(inviter_profile_id,invitee_auth_user_id,event_type)
    values(attribution.inviter_profile_id,new.auth_user_id,'qualified');
  select count(*) into total from public.referral_attributions where inviter_profile_id=attribution.inviter_profile_id and qualified_at is not null;
  if total>=5 then
    insert into public.referral_owl_rewards(owner_profile_id) values(attribution.inviter_profile_id) on conflict(owner_profile_id) do nothing;
    if found then insert into public.referral_audit_events(inviter_profile_id,event_type,metadata)
      values(attribution.inviter_profile_id,'owl_available',jsonb_build_object('qualifiedCount',total)); end if;
  end if;
  return new;
end;
$$;

drop trigger if exists qualify_referral_on_onboarding_complete on public.account_onboarding;
create trigger qualify_referral_on_onboarding_complete after update of stage on public.account_onboarding
  for each row execute function public.qualify_referral_on_onboarding_complete();

insert into public.official_translation_keys(translation_key) values
  ('species.postalOwl'),('archetypes.suggestedNames.owl'),('appearance.owlPortrait'),
  ('traits.nightRoute.name'),('traits.nightRoute.description'),('skills.owlNightWatch.name'),('skills.owlNightWatch.description')
on conflict(translation_key) do nothing;

insert into public.mascot_templates(id,catalog_key,suggested_name_key,species_key,base_level,base_xp,next_level_xp,attributes,trait,equipment,skills,appearance,status)
values('00000000-0000-4000-8000-000000000204','mascot-owl','archetypes.suggestedNames.owl','species.postalOwl',3,160,260,
  '{"speed":6,"stamina":8,"orientation":10,"luck":7}',
  '{"id":"trait-night-route","nameKey":"traits.nightRoute.name","descriptionKey":"traits.nightRoute.description","effect":"eventDiscovery"}',
  '[]','[{"id":"skill-owl-night-watch","nameKey":"skills.owlNightWatch.name","descriptionKey":"skills.owlNightWatch.description","level":2}]',
  '{"primaryColor":"#3d414b","accentColor":"#c49a4a","portraitPlaceholderKey":"appearance.owlPortrait"}','active')
on conflict(catalog_key) do update set suggested_name_key=excluded.suggested_name_key,species_key=excluded.species_key,base_level=excluded.base_level,base_xp=excluded.base_xp,next_level_xp=excluded.next_level_xp,attributes=excluded.attributes,trait=excluded.trait,equipment=excluded.equipment,skills=excluded.skills,appearance=excluded.appearance,status=excluded.status;

create unique index if not exists player_mascots_one_referral_owl_per_owner_idx
  on public.player_mascots(owner_profile_id) where template_id='00000000-0000-4000-8000-000000000204';

create or replace function public.get_my_referral_progress()
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_profile_id uuid; link public.referral_invitation_links; reward public.referral_owl_rewards; qualified integer;
begin
  select id into current_profile_id from public.profiles where auth_user_id=auth.uid();
  if current_profile_id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  select * into link from public.referral_invitation_links where inviter_profile_id=current_profile_id;
  select * into reward from public.referral_owl_rewards where owner_profile_id=current_profile_id;
  select count(*) into qualified from public.referral_attributions where inviter_profile_id=current_profile_id and qualified_at is not null;
  return jsonb_build_object('hasInvitation',link.id is not null,'qualifiedCount',qualified,'targetCount',5,
    'owlStatus',coalesce(reward.status,'locked'),'owlMascotId',reward.mascot_id);
end;
$$;

create or replace function public.claim_referral_owl(requested_name text)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_profile public.profiles; reward public.referral_owl_rewards; template public.mascot_templates; mascot public.player_mascots; normalized_name text;
begin
  select * into current_profile from public.profiles where auth_user_id=auth.uid() for update;
  if current_profile.id is null then raise exception 'Current profile not found' using errcode='28000'; end if;
  select * into reward from public.referral_owl_rewards where owner_profile_id=current_profile.id for update;
  if reward.owner_profile_id is null or reward.status<>'pending' then raise exception 'Owl reward unavailable' using errcode='22023'; end if;
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

revoke all on function public.ensure_my_referral_invitation(), public.store_my_referral_invitation_digest(uuid,integer,text),
  public.rotate_my_referral_invitation(), public.resolve_referral_invitation(text), public.capture_referral_invitation(text),
  public.get_my_referral_progress(), public.claim_referral_owl(text) from public;
grant execute on function public.ensure_my_referral_invitation(), public.store_my_referral_invitation_digest(uuid,integer,text),
  public.rotate_my_referral_invitation(), public.capture_referral_invitation(text), public.get_my_referral_progress(), public.claim_referral_owl(text) to authenticated;
grant execute on function public.resolve_referral_invitation(text) to anon, authenticated;
