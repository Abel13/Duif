-- Fix two production RPC errors without changing their public signatures.

create or replace function public.get_delivery_progression_award(delivery_id uuid)
returns jsonb
language plpgsql
security definer
set search_path=public,auth
as $$
declare
  current_profile_id uuid;
  award public.delivery_progression_awards;
  enriched jsonb;
begin
  if auth.uid() is null then
    raise exception 'Authentication required' using errcode='28000';
  end if;

  select profile.id into current_profile_id
  from public.profiles profile
  where profile.auth_user_id=auth.uid();

  select progression.* into award
  from public.delivery_progression_awards progression
  where progression.delivery_id=get_delivery_progression_award.delivery_id;

  if award.delivery_id is null then return null; end if;
  if award.profile_id<>current_profile_id then
    raise exception 'Only the delivery owner may read progression' using errcode='42501';
  end if;

  select coalesce(
    jsonb_agg(
      base.item||jsonb_build_object(
        'appliedEffects',coalesce(contextual.applied_effects,'[]'::jsonb)
      )
      order by base.ordinality
    ),
    '[]'::jsonb
  ) into enriched
  from jsonb_array_elements(award.skill_awards) with ordinality base(item,ordinality)
  left join public.delivery_skill_awards contextual
    on contextual.delivery_id=award.delivery_id
   and contextual.skill_id=base.item->>'skillId';

  return jsonb_set(to_jsonb(award),'{skill_awards}',enriched);
end;
$$;

revoke all on function public.get_delivery_progression_award(uuid) from public,anon;
grant execute on function public.get_delivery_progression_award(uuid) to authenticated;
