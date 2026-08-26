-- Complete M58 with registered prestige artwork, future automatic selection and safe mission identities.
insert into public.official_assets(asset_key,asset_type) values
('prestige.border.firstHorizon','prestigeBorder'),
('prestige.border.routeAtlas','prestigeBorder'),
('prestige.border.letterSky','prestigeBorder'),
('prestige.border.nestAmongStars','prestigeBorder') on conflict(asset_key) do nothing;

-- prestigeBorder was introduced immediately before this migration. Publish its
-- runtime budget before writing the first versions so fresh environments do not
-- validate the 512 px artwork against the generic 256 px fallback.
create or replace function public.validate_official_asset_version()
returns trigger language plpgsql set search_path = public as $$
declare
  selected_type public.official_asset_type;
  max_bytes integer;
  max_dimension integer;
begin
  select asset_type into selected_type from public.official_assets where id = new.asset_id;
  if selected_type is null then raise exception 'Unknown official asset' using errcode = '23503'; end if;
  if jsonb_typeof(new.metadata) <> 'object' or new.metadata ->> 'kind' <> selected_type::text then
    raise exception 'Asset metadata does not match its type' using errcode = '23514';
  end if;
  if (selected_type = 'currencyIcon' and new.mime_type <> 'image/svg+xml')
    or (selected_type <> 'currencyIcon' and new.mime_type <> 'image/webp') then
    raise exception 'Asset MIME type does not match its type' using errcode = '23514';
  end if;

  max_bytes := case selected_type
    when 'mascotPortrait' then 153600
    when 'postcardArtwork' then 262144
    when 'nestArtwork' then 81920
    when 'prestigeBorder' then 81920
    when 'navigationIcon' then 30720
    when 'currencyIcon' then 15360
    when 'texture' then 81920
    else 61440
  end;
  max_dimension := case selected_type
    when 'mascotPortrait' then 640
    when 'postcardArtwork' then 1600
    when 'nestArtwork' then 640
    when 'prestigeBorder' then 512
    when 'texture' then 512
    when 'navigationIcon' then 160
    when 'currencyIcon' then 128
    when 'equipmentIcon' then 192
    else 256
  end;
  if new.byte_size > max_bytes or new.width > max_dimension or new.height > max_dimension then
    raise exception 'Asset exceeds its runtime budget' using errcode = '23514';
  end if;
  if selected_type = 'postcardArtwork' and new.width * 2 <> new.height * 3 then
    raise exception 'Postcard artwork must use a 3:2 ratio' using errcode = '23514';
  end if;
  if not new.is_decorative and not public.translation_key_is_official(new.alt_text_key) then
    raise exception 'Asset alt text is not fully translated' using errcode = '23514';
  end if;
  return new;
end $$;

with versions(asset_key,path,alt_key,bytes) as (values
('prestige.border.firstHorizon','/assets/prestige/first-horizon.webp','prestige.firstHorizon.name',49320),
('prestige.border.routeAtlas','/assets/prestige/route-atlas.webp','prestige.routeAtlas.name',55948),
('prestige.border.letterSky','/assets/prestige/letter-sky.webp','prestige.letterSky.name',56372),
('prestige.border.nestAmongStars','/assets/prestige/nest-among-stars.webp','prestige.nestAmongStars.name',59408))
insert into public.official_asset_versions(asset_id,version,source,status,packaged_path,mime_type,width,height,byte_size,alt_text_key,is_decorative,author,metadata)
select a.id,1,'packaged','active',v.path,'image/webp',512,512,v.bytes,v.alt_key,false,'DUIF',jsonb_build_object('milestone',58,'kind','prestigeBorder','artDirection','illustratedCircularPrestigeFrame','transparentCenter',true)
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
