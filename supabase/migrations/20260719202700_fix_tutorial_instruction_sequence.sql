create or replace function public.acknowledge_tutorial_instruction(requested_step public.tutorial_instruction_step)
returns public.account_onboarding language plpgsql security definer set search_path=public,auth as $$
declare
  current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding;
  delivery_record public.deliveries; allowed_step public.tutorial_instruction_step; available_at timestamptz;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
  if onboarding_record.stage<>'tutorial' or onboarding_record.tutorial_delivery_id is null then
    raise exception 'Tutorial delivery is not active' using errcode='22023'; end if;
  if onboarding_record.tutorial_instruction_step=requested_step then return onboarding_record; end if;
  select * into strict delivery_record from public.deliveries where id=onboarding_record.tutorial_delivery_id and is_tutorial;
  if onboarding_record.tutorial_instruction_step is null then
    allowed_step:='preparing';
  else
    allowed_step:=case onboarding_record.tutorial_instruction_step
      when 'preparing' then 'outbound'::public.tutorial_instruction_step
      when 'outbound' then 'discovery'::public.tutorial_instruction_step
      when 'discovery' then 'destination'::public.tutorial_instruction_step
      when 'destination' then 'returning'::public.tutorial_instruction_step
      when 'returning' then 'returned'::public.tutorial_instruction_step
      when 'returned' then 'collection'::public.tutorial_instruction_step else null end;
  end if;
  if requested_step is distinct from allowed_step then raise exception 'Invalid tutorial instruction transition' using errcode='22023'; end if;
  available_at:=case requested_step
    when 'preparing' then delivery_record.created_at
    when 'outbound' then delivery_record.outbound_start_at
    when 'discovery' then delivery_record.outbound_start_at+(delivery_record.outbound_arrival_at-delivery_record.outbound_start_at)/2
    when 'destination' then delivery_record.outbound_arrival_at
    when 'returning' then delivery_record.return_start_at
    when 'returned' then delivery_record.return_arrival_at
    when 'collection' then delivery_record.return_arrival_at end;
  if clock_timestamp()<available_at then raise exception 'Tutorial instruction is not available yet' using errcode='22023'; end if;
  update public.account_onboarding set tutorial_instruction_step=requested_step,updated_at=now()
  where auth_user_id=current_user_id returning * into onboarding_record;
  return onboarding_record;
end $$;

revoke all on function public.acknowledge_tutorial_instruction(public.tutorial_instruction_step) from public;
grant execute on function public.acknowledge_tutorial_instruction(public.tutorial_instruction_step) to authenticated;
