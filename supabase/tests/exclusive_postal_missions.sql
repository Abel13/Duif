begin;

insert into public.profiles(id,auth_user_id,display_name,home_latitude,home_longitude,home_label_key,postal_base_street,postal_base_neighborhood,postal_base_city,postal_base_state,postal_base_country,home_city_geoname_id)
values ('00000000-0000-4000-8000-000000000901','10000000-0000-4000-8000-000000000901','Exclusive mission test',31.22222,121.45806,'locations.test','','','Shanghai','','CN',1796236);
insert into public.player_mascots(id,owner_profile_id,template_id,name,level,xp,next_level_xp,attributes,trait,equipment,skills,appearance)
select '00000000-0000-4000-8000-000000000902','00000000-0000-4000-8000-000000000901',id,'Mission mascot',1,0,150,attributes,trait,equipment,skills,appearance
from public.mascot_templates where catalog_key='mascot-nuvem';

do $$
declare function_body text; generated integer; mission_id uuid;
begin
  if not exists(select 1 from pg_class where relnamespace='public'::regnamespace and relname='exclusive_postal_missions') then
    raise exception 'exclusive missions table is missing';
  end if;
  if not exists(select 1 from pg_indexes where schemaname='public' and indexname='exclusive_postal_missions_one_open_per_mascot') then
    raise exception 'exclusive missions need one open offer per mascot';
  end if;
  if not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname='prepare_exclusive_postal_missions')
    or not exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname='dispatch_exclusive_postal_mission') then
    raise exception 'exclusive mission authority is missing';
  end if;
  select pg_get_functiondef('public.prepare_exclusive_postal_missions(timestamptz,integer)'::regprocedure) into function_body;
  if position('interval ''7 days''' in function_body)=0 then
    raise exception 'daily expiry contract is missing';
  end if;
  select pg_get_functiondef('public.exclusive_mission_local_day(timestamptz)'::regprocedure) into function_body;
  if position('America/Sao_Paulo' in function_body)=0 then raise exception 'daily mission timezone is missing'; end if;
  select pg_get_functiondef('public.dispatch_exclusive_postal_mission(uuid)'::regprocedure) into function_body;
  if position('Route exceeds mascot flight range' in function_body)=0 or position('Mission cargo does not fit' in function_body)=0 then
    raise exception 'exclusive dispatch does not revalidate gameplay';
  end if;
  select pg_get_functiondef('public.accept_exclusive_postal_mission(uuid)'::regprocedure) into function_body;
  if position('Mascot is unavailable' in function_body)=0 or position('for update' in function_body)=0 then
    raise exception 'exclusive acceptance does not protect a mascot in flight';
  end if;
  select pg_get_functiondef('public.claim_exclusive_postal_mission_generations(integer)'::regprocedure) into function_body;
  if position('cargo_slots integer' in function_body)=0 or position('auth.role()<>''service_role''' in function_body)=0 then
    raise exception 'generator claim does not expose only the authorized mission limit';
  end if;
  if not exists(select 1 from pg_trigger where tgname='exclusive_postal_mission_credit_on_completion' and not tgisinternal) then
    raise exception 'exclusive mission reward trigger is missing';
  end if;

  generated:=public.prepare_exclusive_postal_missions(timestamptz '2026-08-30 03:10:00+00',100);
  if (select count(*) from public.exclusive_postal_missions where mascot_id='00000000-0000-4000-8000-000000000902')<>1 then
    raise exception 'daily generation did not create one mission';
  end if;
  perform public.prepare_exclusive_postal_missions(timestamptz '2026-08-30 04:00:00+00',100);
  if (select count(*) from public.exclusive_postal_missions where mascot_id='00000000-0000-4000-8000-000000000902')<>1 then
    raise exception 'generation was not idempotent for one daily mascot offer';
  end if;
  select id into mission_id from public.exclusive_postal_missions where mascot_id='00000000-0000-4000-8000-000000000902';
  update public.exclusive_postal_missions set status='expired',expired_at=timestamptz '2026-08-30 04:00:00+00' where id=mission_id;
  perform public.prepare_exclusive_postal_missions(timestamptz '2026-08-30 05:00:00+00',100);
  if (select count(*) from public.exclusive_postal_missions where mascot_id='00000000-0000-4000-8000-000000000902')<>1 then
    raise exception 'an expired mission was replaced on the same local day';
  end if;
  perform public.prepare_exclusive_postal_missions(timestamptz '2026-08-31 03:10:00+00',100);
  if (select count(*) from public.exclusive_postal_missions where mascot_id='00000000-0000-4000-8000-000000000902')<>2 then
    raise exception 'an expired mission did not become eligible on the next local day';
  end if;
end $$;

rollback;
