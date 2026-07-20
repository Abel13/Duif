create or replace function public.complete_nest_setup(
  selected_latitude double precision,
  selected_longitude double precision,
  selected_city_geoname_id bigint
)
returns jsonb language plpgsql security definer set search_path=public,auth as $$
declare current_user_id uuid:=auth.uid(); onboarding_record public.account_onboarding; profile_record public.profiles;
  city_record public.geonames_cities;
  lat_step double precision:=2.0/111.32; lon_step double precision; normalized_lat double precision; normalized_lon double precision;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  if selected_latitude is null or selected_longitude is null or selected_latitude<-90 or selected_latitude>90 or selected_longitude<-180 or selected_longitude>180 then raise exception 'Invalid nest coordinate' using errcode='22023'; end if;
  if selected_city_geoname_id is null then raise exception 'A nest city is required' using errcode='22023'; end if;
  select * into onboarding_record from public.account_onboarding where auth_user_id=current_user_id for update;
  if onboarding_record.auth_user_id is null then raise exception 'Onboarding not found' using errcode='22023'; end if;
  select * into strict profile_record from public.profiles where auth_user_id=current_user_id for update;
  if onboarding_record.stage='completed' and onboarding_record.completed_at is not null then return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record)); end if;
  if onboarding_record.stage<>'nestSetup' or onboarding_record.tutorial_collected_at is null then raise exception 'Nest setup is unavailable' using errcode='22023'; end if;
  select * into city_record from public.geonames_cities where geoname_id=selected_city_geoname_id and is_active;
  if city_record.geoname_id is null then raise exception 'Selected nest city is unavailable' using errcode='22023'; end if;
  normalized_lat:=round(selected_latitude/lat_step)*lat_step;
  lon_step:=2.0/(111.32*greatest(cos(radians(selected_latitude)),.05));
  normalized_lon:=round(selected_longitude/lon_step)*lon_step;
  update public.profiles set home_latitude=normalized_lat,home_longitude=normalized_lon,home_label_key='onboarding.privateNestLabel',home_city_geoname_id=city_record.geoname_id,postal_base_street='',postal_base_neighborhood='',postal_base_city=city_record.name,postal_base_state=coalesce(city_record.admin1_code,''),postal_base_country=city_record.country_code,updated_at=now() where id=profile_record.id returning * into profile_record;
  update public.account_onboarding set stage='completed',completed_at=coalesce(completed_at,now()),updated_at=now() where auth_user_id=current_user_id returning * into onboarding_record;
  return jsonb_build_object('profile',to_jsonb(profile_record),'onboarding',to_jsonb(onboarding_record));
end $$;

do $$
declare traffic_definition text;
begin
  select pg_get_functiondef(p.oid) into traffic_definition
  from pg_proc p join pg_namespace n on n.oid=p.pronamespace
  where n.nspname='public' and p.proname='get_nearby_postal_traffic'
    and pg_get_function_identity_arguments(p.oid) = 'center_latitude double precision, center_longitude double precision, viewport_north double precision, viewport_east double precision, viewport_south double precision, viewport_west double precision';
  traffic_definition := replace(traffic_definition,
    'concat_ws('', '', owner_profile.postal_base_state, owner_profile.postal_base_country) as origin_public_region',
    'case when exists (select 1 from public.friendships f where f.status = ''accepted'' and current_profile_id in (f.requester_profile_id, f.addressee_profile_id) and d.sender_profile_id in (f.requester_profile_id, f.addressee_profile_id)) then concat_ws('', '', owner_profile.postal_base_city, owner_profile.postal_base_state, owner_profile.postal_base_country) else concat_ws('', '', owner_profile.postal_base_state, owner_profile.postal_base_country) end as origin_public_region');
  traffic_definition := replace(traffic_definition,
    'concat_ws('', '', receiver_profile.postal_base_state, receiver_profile.postal_base_country) as destination_public_region',
    'case when exists (select 1 from public.friendships f where f.status = ''accepted'' and current_profile_id in (f.requester_profile_id, f.addressee_profile_id) and d.sender_profile_id in (f.requester_profile_id, f.addressee_profile_id)) then concat_ws('', '', receiver_profile.postal_base_city, receiver_profile.postal_base_state, receiver_profile.postal_base_country) else concat_ws('', '', receiver_profile.postal_base_state, receiver_profile.postal_base_country) end as destination_public_region');
  execute traffic_definition;
end $$;
