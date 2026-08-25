-- Complete M58 with registered prestige artwork, future automatic selection and safe mission identities.
insert into public.official_assets(asset_key,asset_type) values
('prestige.border.firstHorizon','prestigeBorder'),
('prestige.border.routeAtlas','prestigeBorder'),
('prestige.border.letterSky','prestigeBorder'),
('prestige.border.nestAmongStars','prestigeBorder') on conflict(asset_key) do nothing;

with versions(asset_key,path,alt_key,bytes) as (values
('prestige.border.firstHorizon','/assets/prestige/first-horizon.webp','prestige.firstHorizon.name',49320),
('prestige.border.routeAtlas','/assets/prestige/route-atlas.webp','prestige.routeAtlas.name',55948),
('prestige.border.letterSky','/assets/prestige/letter-sky.webp','prestige.letterSky.name',56372),
('prestige.border.nestAmongStars','/assets/prestige/nest-among-stars.webp','prestige.nestAmongStars.name',59408))
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select a.id,1,'packaged','active',v.path,'image/webp',512,512,v.bytes,v.alt_key,false,'DUIF',jsonb_build_object('milestone',58,'kind','illustratedCircularPrestigeFrame','transparentCenter',true)
from versions v join public.official_assets a using(asset_key)
where not exists(select 1 from public.official_asset_versions existing where existing.asset_id=a.id and existing.version=1);

create or replace function public.m58_auto_select_first_prestige() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
declare border_key text;
begin
  if new.level<20 or new.level<=old.level or exists(select 1 from public.mascot_prestige_selections where mascot_id=new.id) then return new; end if;
  select catalog_key into border_key from public.mascot_prestige_border_catalog where status='active' and minimum_level<=new.level order by minimum_level desc limit 1;
  if border_key is not null then insert into public.mascot_prestige_selections(mascot_id,border_catalog_key,selected_manually) values(new.id,border_key,false) on conflict do nothing; end if;
  return new;
end $$;
drop trigger if exists m58_auto_select_first_prestige_after_level on public.player_mascots;
create trigger m58_auto_select_first_prestige_after_level after update of level on public.player_mascots for each row execute function public.m58_auto_select_first_prestige();

-- A persisted job offer is the official authority for mission identity. The origin is
-- migrated only when the immutable label still confirms the currently registered city.
update public.deliveries d set route_identity=jsonb_build_object(
  'version',3,'origin','city:'||p.home_city_geoname_id,'destination','mission:'||o.template_catalog_key,
  'pairKey',public.m58_route_pair_key('city:'||p.home_city_geoname_id,'mission:'||o.template_catalog_key),
  'originSource','verifiedProfileGeonameId','destinationSource','postalJobOffer')
from public.postal_job_runs run join public.postal_job_offers o on o.id=run.offer_id join public.profiles p on p.id=run.profile_id
where d.id=run.delivery_id and p.home_city_geoname_id is not null and d.origin_place_label ilike '%'||p.postal_base_city||'%'
and coalesce((d.route_identity->>'version')::integer,0)<3;

insert into public.delivery_familiarity_completions(delivery_id,mascot_id,route_pair_key,completed_at)
select id,mascot_id,route_identity->>'pairKey',coalesce(updated_at,now()) from public.deliveries
where status='completed' and not is_tutorial and coalesce((route_identity->>'version')::integer,0)=3 on conflict do nothing;
insert into public.mascot_route_familiarity(mascot_id,route_pair_key,completed_count,last_completed_at)
select mascot_id,route_pair_key,count(*),max(completed_at) from public.delivery_familiarity_completions group by mascot_id,route_pair_key
on conflict(mascot_id,route_pair_key) do update set completed_count=excluded.completed_count,last_completed_at=excluded.last_completed_at;
