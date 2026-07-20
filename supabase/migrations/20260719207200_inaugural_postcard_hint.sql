alter table public.account_onboarding add column inaugural_postcard_hint_seen_at timestamptz;
create or replace function public.acknowledge_inaugural_postcard_hint()
returns public.account_onboarding language plpgsql security definer set search_path=public,auth as $$
declare current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding;
begin
 if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
 select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
 if onboarding_record.auth_user_id is null or onboarding_record.tutorial_collected_at is null then raise exception 'Tutorial postcard is not available' using errcode='22023'; end if;
 update public.account_onboarding set inaugural_postcard_hint_seen_at=coalesce(inaugural_postcard_hint_seen_at,now()),updated_at=now() where auth_user_id=current_user_id returning * into onboarding_record;
 return onboarding_record;
end $$;
revoke all on function public.acknowledge_inaugural_postcard_hint() from public;
grant execute on function public.acknowledge_inaugural_postcard_hint() to authenticated;
