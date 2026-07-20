alter table public.account_onboarding add column completed_at timestamptz;
create table public.nest_search_rate_limits (
  auth_user_id uuid primary key references auth.users(id) on delete cascade,
  window_started_at timestamptz not null default now(),
  request_count integer not null default 0 check(request_count>=0),
  updated_at timestamptz not null default now()
);
alter table public.nest_search_rate_limits enable row level security;
revoke all on public.nest_search_rate_limits from anon, authenticated;

create or replace function public.complete_nest_setup(selected_latitude double precision, selected_longitude double precision)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding; profile_record public.profiles;
  lat_step double precision:=2.0/111.32; lon_step double precision; normalized_lat double precision; normalized_lon double precision;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if selected_latitude is null or selected_longitude is null or selected_latitude<-90 or selected_latitude>90 or selected_longitude<-180 or selected_longitude>180 then raise exception 'Invalid nest coordinate' using errcode='22023'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
  if onboarding_record.auth_user_id is null then raise exception 'Onboarding not found' using errcode='22023'; end if;
  select * into strict profile_record from public.profiles where auth_user_id=current_user_id for update;
  if onboarding_record.stage='completed' and onboarding_record.completed_at is not null then return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record)); end if;
  if onboarding_record.stage<>'nestSetup' or onboarding_record.tutorial_collected_at is null then raise exception 'Nest setup is unavailable' using errcode='22023'; end if;
  normalized_lat:=round(selected_latitude/lat_step)*lat_step;
  lon_step:=2.0/(111.32*greatest(cos(radians(selected_latitude)),.05));
  normalized_lon:=round(selected_longitude/lon_step)*lon_step;
  update public.profiles set home_latitude=normalized_lat,home_longitude=normalized_lon,home_label_key='onboarding.privateNestLabel',postal_base_street='',postal_base_neighborhood='',postal_base_city='',postal_base_state='',postal_base_country='',updated_at=now() where id=profile_record.id returning * into profile_record;
  update public.account_onboarding set stage='completed',completed_at=coalesce(completed_at,now()),updated_at=now() where auth_user_id=current_user_id returning * into onboarding_record;
  return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record));
end $$;
revoke all on function public.complete_nest_setup(double precision,double precision) from public;
grant execute on function public.complete_nest_setup(double precision,double precision) to authenticated;
