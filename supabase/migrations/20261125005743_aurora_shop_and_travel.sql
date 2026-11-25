-- The three onboarding templates and the referral owl keep their existing acquisition paths.
insert into public.official_translation_keys (translation_key) values
  ('aurora.name'),
  ('aurora.species'),
  ('appearance.friendAuroraPortrait'),
  ('aurora.horizon.name'),
  ('aurora.horizon.description'),
  ('aurora.skyReading.name'),
  ('aurora.skyReading.description'),
  ('aurora.attentivePath.name'),
  ('aurora.attentivePath.description'),
  ('aurora.forager.name'),
  ('aurora.forager.description'),
  ('aurora.nestMemory.name'),
  ('aurora.nestMemory.description'),
  ('aurora.pioneer.name'),
  ('aurora.pioneer.description')
on conflict do nothing;

insert into public.mascot_templates
  (id,catalog_key,suggested_name_key,species_key,base_level,base_xp,next_level_xp,
   attributes,trait,equipment,skills,appearance,status)
values ('00000000-0000-4000-8000-000000000205','mascot-aurora','aurora.name','aurora.species',
  1,0,public.progression_next_level_xp('mascot',1),
  '{"speed":7,"stamina":6,"orientation":9,"luck":7}',
  '{"id":"trait-aurora-horizon","nameKey":"aurora.horizon.name","descriptionKey":"aurora.horizon.description","effect":"eventDiscovery"}',
  '[]','[
    {"id":"skill-aurora-sky-reading","nameKey":"aurora.skyReading.name","descriptionKey":"aurora.skyReading.description","category":"fixed","level":1},
    {"id":"skill-aurora-attentive-path","nameKey":"aurora.attentivePath.name","descriptionKey":"aurora.attentivePath.description","category":"fixed","level":1},
    {"id":"skill-aurora-forager","nameKey":"aurora.forager.name","descriptionKey":"aurora.forager.description","category":"individual","level":1},
    {"id":"skill-aurora-nest-memory","nameKey":"aurora.nestMemory.name","descriptionKey":"aurora.nestMemory.description","category":"individual","level":1},
    {"id":"skill-aurora-pioneer","nameKey":"aurora.pioneer.name","descriptionKey":"aurora.pioneer.description","category":"individual","level":1}
  ]','{"primaryColor":"#6998bf","accentColor":"#bd7949","portraitPlaceholderKey":"appearance.friendAuroraPortrait","portraitAssetKey":"mascot.portrait.aurora"}','active');

create unique index one_aurora_per_profile on public.player_mascots(owner_profile_id)
  where template_id='00000000-0000-4000-8000-000000000205';

create function public.get_aurora_offer() returns table(price integer, owned boolean)
language sql stable security invoker set search_path='' as $$
  select 500, exists(select 1 from public.player_mascots p
    where p.owner_profile_id=public.current_profile_id() and p.template_id=t.id)
  from public.mascot_templates t where t.catalog_key='mascot-aurora' and t.status='active'
$$;

create function public.purchase_aurora() returns uuid
language plpgsql security definer set search_path='' as $$
declare
  actor uuid;
  template public.mascot_templates;
  mascot_id uuid;
  price integer;
begin
  select id into actor from public.profiles where auth_user_id=auth.uid() for update;
  if actor is null then raise exception 'Authentication required' using errcode='42501'; end if;
  select * into strict template from public.mascot_templates where catalog_key='mascot-aurora' and status='active';
  select id into mascot_id from public.player_mascots where owner_profile_id=actor and template_id=template.id;
  if found then return mascot_id; end if;
  select offer.price into strict price from public.get_aurora_offer() offer;
  update public.profile_seed_balances set quantity=quantity-price,updated_at=now()
    where profile_id=actor and quantity>=price;
  if not found then raise exception 'Insufficient seeds' using errcode='22023'; end if;
  insert into public.player_mascots(id,owner_profile_id,template_id,name,level,xp,next_level_xp,
    attributes,trait,equipment,skills,appearance,is_starter)
  values(gen_random_uuid(),actor,template.id,'Aurora',template.base_level,template.base_xp,template.next_level_xp,
    template.attributes,template.trait,template.equipment,template.skills,template.appearance,false)
  returning id into mascot_id;
  return mascot_id;
end $$;

revoke all on function public.get_aurora_offer(), public.purchase_aurora() from public,anon;
grant execute on function public.get_aurora_offer(), public.purchase_aurora() to authenticated;

alter function public.preview_mascot_skill_modifiers(uuid,text,numeric) rename to preview_mascot_skill_modifiers_pre_aurora;
revoke all on function public.preview_mascot_skill_modifiers_pre_aurora(uuid,text,numeric) from public,anon,authenticated;
create function public.preview_mascot_skill_modifiers(target_mascot_id uuid,destination_key text,distance_km numeric)
returns jsonb language plpgsql security definer set search_path='' as $$
declare snapshot jsonb;
begin
  snapshot:=public.preview_mascot_skill_modifiers_pre_aurora(target_mascot_id,destination_key,distance_km);
  if snapshot->>'traitId'='trait-aurora-horizon' then
    select snapshot || jsonb_build_object('skillRulesVersion',60,'skillEffects',jsonb_agg(e ||
      jsonb_build_object('weatherDependent',true,'impact',jsonb_build_object('kind',case e->>'skillId'
        when 'skill-aurora-sky-reading' then 'speed' when 'skill-aurora-nest-memory' then 'returnSpeed'
        when 'skill-aurora-attentive-path' then 'corridor' else 'chance' end,
        'value',(e->>'level')::integer * case e->>'skillId' when 'skill-aurora-nest-memory' then .008
        when 'skill-aurora-sky-reading' then .005 when 'skill-aurora-attentive-path' then .005 else .01 end)) order by ord))
    into snapshot from jsonb_array_elements(snapshot->'skillEffects') with ordinality as effects(e,ord);
  end if;
  return snapshot;
end $$;
revoke all on function public.preview_mascot_skill_modifiers(uuid,text,numeric) from public,anon;
grant execute on function public.preview_mascot_skill_modifiers(uuid,text,numeric) to authenticated;

-- Resolve stable route identities after the regular flight snapshot has been assembled.
create function public.snapshot_aurora_context() returns trigger
language plpgsql security definer set search_path='' as $$
declare known_count integer; first_visit boolean;
begin
  select count(*) filter (where prior.route_identity->>'pairKey'=new.route_identity->>'pairKey'),
    count(*) filter (where prior.route_identity->>'destination'=new.route_identity->>'destination')=0
    into known_count,first_visit from public.deliveries prior
    where prior.mascot_id=new.mascot_id and prior.status='completed' and not prior.is_tutorial;
  new.travel_modifiers:=jsonb_set(jsonb_set(new.travel_modifiers,'{skillContext,familiarity}',to_jsonb(known_count)),
    '{skillContext,firstDestination}',to_jsonb(first_visit));
  return new;
end $$;
create trigger z_snapshot_aurora_context before insert on public.deliveries for each row
when (new.travel_modifiers->>'traitId'='trait-aurora-horizon' and not new.is_tutorial)
execute function public.snapshot_aurora_context();

create function public.aurora_visible(weather jsonb) returns boolean
language sql immutable set search_path='' as $$
  select coalesce((weather->>'isDay')::boolean and weather->>'category' in ('clear','partlyCloudy','cloudy'),false)
$$;

create function public.aurora_effect(snapshot jsonb, skill text) returns jsonb
language sql immutable set search_path='' as $$
  select e from jsonb_array_elements(snapshot->'skillEffects') e
  where snapshot->>'skillRulesVersion'='60' and e->>'state'='active' and e->>'skillId'='skill-aurora-'||skill
$$;

-- Runs between the existing contextual skill resolver and the equipment/speed clamp.
create function public.apply_aurora_segment() returns trigger
language plpgsql security definer set search_path='' as $$
declare snapshot jsonb; effect jsonb; applied jsonb:='[]'; speed numeric:=1;
begin
  select travel_modifiers into snapshot from public.deliveries where id=new.delivery_id;
  if snapshot->>'traitId' is distinct from 'trait-aurora-horizon' then return new; end if;
  if public.aurora_visible(new.weather_snapshot) then
    if new.weather_snapshot->>'category'='clear' then
      effect:=public.aurora_effect(snapshot,'sky-reading');
      if effect is not null then
        applied:=applied||jsonb_build_array(effect);
        speed:=speed+(effect#>>'{impact,value}')::numeric;
      end if;
    end if;
    if new.leg='return' and (snapshot#>>'{skillContext,familiarity}')::int>=3 then
      effect:=public.aurora_effect(snapshot,'nest-memory');
      if effect is not null then
        applied:=applied||jsonb_build_array(effect);
        speed:=speed+(effect#>>'{impact,value}')::numeric;
      end if;
    end if;
  end if;
  new.modifiers:=new.modifiers||jsonb_build_object('skills',speed,'skillEffects',applied||
    coalesce(new.modifiers->'auroraDiscoveryEffects','[]'::jsonb));
  return new;
end $$;
create trigger aa_apply_aurora_segment before insert or update of weather_snapshot,state,effective_speed_kmh
on public.delivery_route_segments for each row when (new.state='planned')
execute function public.apply_aurora_segment();

-- The immutable reward draw and its XP evidence use the same segment forecast at dispatch.
create function public.record_aurora_discovery_effect(segment uuid,effect jsonb) returns void
language sql set search_path='' as $$
  update public.delivery_route_segments set modifiers=modifiers || jsonb_build_object(
    'auroraDiscoveryEffects',coalesce(modifiers->'auroraDiscoveryEffects','[]'::jsonb)||jsonb_build_array(effect),
    'skillEffects',coalesce(modifiers->'skillEffects','[]'::jsonb)||jsonb_build_array(effect))
  where id=segment and effect is not null
    and not coalesce(modifiers->'auroraDiscoveryEffects','[]'::jsonb) @> jsonb_build_array(effect)
$$;

create or replace function public.materialize_delivery_route_discoveries()
returns trigger language plpgsql security definer set search_path='' as $$
declare
  point public.route_reward_points;
  segment public.delivery_route_segments;
  pioneer_point public.route_reward_points;
  pioneer_segment uuid;
  pioneer_progress numeric;
  pioneer_distance double precision;
  pioneer jsonb:=public.aurora_effect(new.travel_modifiers,'pioneer');
  attentive jsonb:=public.aurora_effect(new.travel_modifiers,'attentive-path');
  scale_x double precision;
  dx double precision; dy double precision; px double precision; py double precision;
  progress double precision; distance_km double precision;
  base_radius numeric:=greatest(1,coalesce((new.travel_modifiers->>'discoveryRadiusMultiplier')::numeric,1));
  radius numeric;
  visible boolean;
begin
  for point in select * from public.route_reward_points
    where status='active' and catalog_key<>'route-tutorial-inaugural-postcard' order by catalog_key loop
    -- Project onto the route in the same local plane used by the original discovery rule.
    scale_x:=6371*cos(radians((new.origin_latitude+new.destination_latitude+point.latitude)/3));
    dx:=scale_x*radians(new.destination_longitude-new.origin_longitude);
    dy:=6371*radians(new.destination_latitude-new.origin_latitude);
    px:=scale_x*radians(point.longitude-new.origin_longitude);
    py:=6371*radians(point.latitude-new.origin_latitude);
    progress:=coalesce(least(1,greatest(0,(px*dx+py*dy)/nullif(dx*dx+dy*dy,0))),0);
    distance_km:=sqrt(power(px-progress*dx,2)+power(py-progress*dy,2));
    radius:=base_radius;
    visible:=false;
    if new.travel_modifiers->>'traitId'='trait-aurora-horizon' then
      select * into segment from public.delivery_route_segments where delivery_id=new.id and leg='outbound'
        and route_fraction_start<=progress and route_fraction_end>=progress order by segment_index limit 1;
      visible:=public.aurora_visible(segment.weather_snapshot);
      if visible then
        radius:=radius+.05;
        if attentive is not null and (new.travel_modifiers#>>'{skillContext,familiarity}')::integer>=3 then
          radius:=radius+(attentive#>>'{impact,value}')::numeric;
          perform public.record_aurora_discovery_effect(segment.id,attentive);
        end if;
      end if;
    end if;
    if distance_km<=point.eligibility_radius_km*radius then
      insert into public.delivery_route_discoveries(id,delivery_id,route_reward_point_id,reward_item_id,route_progress,distance_from_route_km)
      values(gen_random_uuid(),new.id,point.id,point.reward_item_id,round(progress::numeric,6),round(distance_km::numeric,4))
      on conflict(delivery_id,route_reward_point_id) do nothing;
    elsif visible and pioneer is not null and (new.travel_modifiers#>>'{skillContext,firstDestination}')::boolean
      and point.kind in ('postcard','souvenir','badge','stamp') and distance_km<=point.eligibility_radius_km*1.25
      and (pioneer_distance is null or distance_km<pioneer_distance) then
      pioneer_point:=point;
      pioneer_segment:=segment.id;
      pioneer_progress:=progress;
      pioneer_distance:=distance_km;
    end if;
  end loop;
  if pioneer_point.id is not null then
    perform public.record_aurora_discovery_effect(pioneer_segment,pioneer);
    if random()<.20*(1+(pioneer#>>'{impact,value}')::numeric) then
      insert into public.delivery_route_discoveries(id,delivery_id,route_reward_point_id,reward_item_id,route_progress,distance_from_route_km)
      values(gen_random_uuid(),new.id,pioneer_point.id,pioneer_point.reward_item_id,round(pioneer_progress,6),round(pioneer_distance::numeric,4))
      on conflict(delivery_id,route_reward_point_id) do nothing;
    end if;
  end if;
  update public.deliveries set route_discovery_version=1 where id=new.id;
  return new;
end $$;

create or replace function public.materialize_seed_packages() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare
  luck integer; n integer; i integer; total_weight numeric; chance numeric;
  roll double precision; selected public.seed_package_catalog; draw text;
  effect jsonb:=public.aurora_effect(new.travel_modifiers,'forager');
  route_leg text; progress double precision; segment public.delivery_route_segments;
  opportunity_chance numeric;
begin
  if new.is_tutorial then return new; end if;
  n := least(5, floor(new.distance_km * 2 / 100)::integer);
  if n < 1 then return new; end if;
  select greatest(0, least(100, coalesce((attributes->>'luck')::integer, 0)))
    into luck from public.player_mascots where id = new.mascot_id;
  select coalesce(sum(base_chance_percent),0) into total_weight
    from public.seed_package_catalog where status='active' and min_distance_km <= new.distance_km * 2;
  if total_weight <= 0 then return new; end if;
  chance := least(95, total_weight * least(1.3, 1 + luck * 0.02));
  for i in 0..n-1 loop
    draw := gen_random_uuid()::text;
    roll := random() * total_weight;
    select c.* into selected from (
      select s.*, sum(s.base_chance_percent) over (order by s.tier, s.catalog_key) as upper_bound
      from public.seed_package_catalog s
      where s.status='active' and s.min_distance_km <= new.distance_km * 2
    ) c where roll < c.upper_bound order by c.tier, c.catalog_key limit 1;
    route_leg:=case when random()<.5 then 'outbound' else 'returning' end;
    progress:=greatest(.000001,least(.999999,random()));
    opportunity_chance:=chance;
    if effect is not null then
      select * into segment from public.delivery_route_segments where delivery_id=new.id
        and leg=case when route_leg='returning' then 'return' else 'outbound' end
        and route_fraction_start<=progress and route_fraction_end>=progress order by segment_index limit 1;
      if public.aurora_visible(segment.weather_snapshot) then
        opportunity_chance:=least(95,chance*(1+(effect#>>'{impact,value}')::numeric));
        if opportunity_chance>chance then perform public.record_aurora_discovery_effect(segment.id,effect); end if;
      end if;
    end if;
    insert into public.delivery_seed_package_opportunities
      (delivery_id, opportunity_index, segment_index, catalog_version, eligible_packages,
       mascot_luck_snapshot, seed_value, result_package_key, result_seed_quantity,
       result_calculated_at, leg, leg_progress, effective_chance)
    values (new.id, i, coalesce(segment.segment_index,0), 1, '[]'::jsonb, luck, draw,
      case when random() * 100 < opportunity_chance then selected.catalog_key end, null,
      now(), route_leg, progress, opportunity_chance);
    update public.delivery_seed_package_opportunities set result_seed_quantity=selected.seed_quantity
      where delivery_id=new.id and opportunity_index=i and result_package_key is not null;
  end loop;
  return new;
end $$;

revoke all on function public.record_aurora_discovery_effect(uuid,jsonb), public.apply_aurora_segment(),
  public.snapshot_aurora_context(), public.aurora_effect(jsonb,text), public.aurora_visible(jsonb)
  from public, anon, authenticated;
