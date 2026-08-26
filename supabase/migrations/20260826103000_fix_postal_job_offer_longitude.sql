-- Preserve existing cycles and offers while fixing destination generation for new offers.

create or replace function public.postal_job_offer_payload(target_mascot_id uuid)
returns jsonb language plpgsql security definer set search_path=public,auth,pg_temp as $$
declare
  me uuid; pet public.player_mascots; cycle public.postal_job_cycles;
  offer public.postal_job_offers; template public.official_postal_job_templates;
  bearing double precision; angular double precision; lat double precision; lon double precision;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode='28000'; end if;
  select profile.id into me from public.profiles profile where profile.auth_user_id=auth.uid();
  select mascot.* into pet from public.player_mascots mascot
    where mascot.id=target_mascot_id and mascot.owner_profile_id=me for update;
  if pet.id is null then raise exception 'Mascot not found' using errcode='42501'; end if;

  select job_cycle.* into cycle from public.postal_job_cycles job_cycle
    where job_cycle.profile_id=me and job_cycle.mascot_id=pet.id and job_cycle.completed_at is null for update;
  if cycle.id is null then
    insert into public.postal_job_cycles(profile_id,mascot_id) values(me,pet.id) returning * into cycle;
  end if;

  select job_offer.* into offer from public.postal_job_offers job_offer
    where job_offer.cycle_id=cycle.id and job_offer.status in ('offered','accepted') for update;
  if offer.id is null then
    select candidate.* into template from public.official_postal_job_templates candidate
      where candidate.status='active' and pet.level>=candidate.min_mascot_level
        and (candidate.max_mascot_level is null or pet.level<=candidate.max_mascot_level)
        and not exists(select 1 from public.postal_job_offers used
          where used.cycle_id=cycle.id and used.template_catalog_key=candidate.catalog_key)
      order by md5(candidate.catalog_key||cycle.id::text) limit 1;
    if template.catalog_key is null then raise exception 'No postal job is available' using errcode='22023'; end if;

    bearing:=radians((('x'||substr(md5(cycle.id::text||template.catalog_key),1,8))::bit(32)::bigint % 360 + 360) % 360);
    angular:=((template.min_distance_km+template.max_distance_km)/2)/6371;
    select degrees(asin(sin(radians(profile.home_latitude))*cos(angular)
      +cos(radians(profile.home_latitude))*sin(angular)*cos(bearing))) into lat
      from public.profiles profile where profile.id=me;
    select degrees(radians(profile.home_longitude)+atan2(
      sin(bearing)*sin(angular)*cos(radians(profile.home_latitude)),
      cos(angular)-sin(radians(profile.home_latitude))*sin(radians(lat)))) into lon
      from public.profiles profile where profile.id=me;
    lon:=mod((lon+540)::numeric,360::numeric)::double precision-180;

    insert into public.postal_job_offers(cycle_id,template_catalog_key,destination_latitude,destination_longitude,distance_km)
      values(cycle.id,template.catalog_key,lat,lon,round(((template.min_distance_km+template.max_distance_km)/2)::numeric,2))
      returning * into offer;
  end if;

  select selected.* into template from public.official_postal_job_templates selected
    where selected.catalog_key=offer.template_catalog_key;
  return jsonb_build_object('offer',to_jsonb(offer),'template',to_jsonb(template),
    'replacementsRemaining',3-cycle.replacement_count);
end $$;

revoke all on function public.postal_job_offer_payload(uuid) from public,anon;
grant execute on function public.postal_job_offer_payload(uuid) to authenticated;
