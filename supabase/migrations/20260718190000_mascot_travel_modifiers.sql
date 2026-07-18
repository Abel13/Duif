alter table public.deliveries
  add column travel_modifiers jsonb;

comment on column public.deliveries.travel_modifiers is
  'Immutable versioned snapshot of mascot and route travel modifiers resolved at dispatch.';

create or replace function public.derive_mascot_travel_modifiers(
  mascot_attributes jsonb,
  mascot_trait jsonb,
  mascot_skills jsonb,
  route_distance_km numeric
)
returns jsonb
language plpgsql
immutable
set search_path = public
as $$
declare
  orientation_value numeric := least(10, greatest(0, case
    when jsonb_typeof(mascot_attributes -> 'orientation') = 'number'
      then (mascot_attributes ->> 'orientation')::numeric
    else 0
  end));
  luck_value numeric := least(10, greatest(0, case
    when jsonb_typeof(mascot_attributes -> 'luck') = 'number'
      then (mascot_attributes ->> 'luck')::numeric
    else 0
  end));
  quick_dispatch_level numeric := 0;
  crosswind_level numeric := 0;
  shiny_thing_level numeric := 0;
  happy_detour_level numeric := 0;
  long_route_level numeric := 0;
  is_long_route boolean := case
    when route_distance_km is null or route_distance_km = 'NaN'::numeric or route_distance_km < 0
      then false
    else route_distance_km >= 500
  end;
  preparation_reduction numeric;
  outbound_speed_multiplier numeric;
  safe_route_mitigation numeric;
  total_long_route_mitigation numeric;
  remaining_long_route_penalty numeric;
  direct_flight_multiplier numeric;
  return_speed_multiplier numeric;
  discovery_radius_multiplier numeric;
  rarity_weight_multiplier numeric;
begin
  select
    coalesce(max(case when skill ->> 'id' = 'skill-trovao-quick-dispatch' and jsonb_typeof(skill -> 'level') = 'number' then least(10, greatest(0, (skill ->> 'level')::numeric)) end), 0),
    coalesce(max(case when skill ->> 'id' = 'skill-trovao-crosswind' and jsonb_typeof(skill -> 'level') = 'number' then least(10, greatest(0, (skill ->> 'level')::numeric)) end), 0),
    coalesce(max(case when skill ->> 'id' = 'skill-pipoca-shiny-thing' and jsonb_typeof(skill -> 'level') = 'number' then least(10, greatest(0, (skill ->> 'level')::numeric)) end), 0),
    coalesce(max(case when skill ->> 'id' = 'skill-pipoca-detour' and jsonb_typeof(skill -> 'level') = 'number' then least(10, greatest(0, (skill ->> 'level')::numeric)) end), 0),
    coalesce(max(case when skill ->> 'id' = 'skill-nuvem-long-route' and jsonb_typeof(skill -> 'level') = 'number' then least(10, greatest(0, (skill ->> 'level')::numeric)) end), 0)
  into quick_dispatch_level, crosswind_level, shiny_thing_level, happy_detour_level, long_route_level
  from jsonb_array_elements(coalesce(mascot_skills, '[]'::jsonb)) as skill;

  preparation_reduction := least(0.2, quick_dispatch_level * 0.05);
  outbound_speed_multiplier := least(1.15, greatest(0.85, 1 - least(0.15, happy_detour_level * 0.02)));
  safe_route_mitigation := case when mascot_trait ->> 'effect' = 'deliveryReward' then 0.5 else 0 end;
  total_long_route_mitigation := least(1, safe_route_mitigation + least(0.5, long_route_level * 0.25));
  remaining_long_route_penalty := case when is_long_route then 0.1 * (1 - total_long_route_mitigation) else 0 end;
  direct_flight_multiplier := case when mascot_trait ->> 'effect' = 'fastReturn' then 1.1 else 1 end;
  return_speed_multiplier := least(
    1.25,
    greatest(0.75, outbound_speed_multiplier * direct_flight_multiplier / (1 + remaining_long_route_penalty))
  );
  discovery_radius_multiplier := least(
    1.3,
    greatest(
      1,
      1 + orientation_value * 0.01 + crosswind_level * 0.02 + happy_detour_level * 0.03
        + case when mascot_trait ->> 'effect' = 'rareFind' then 0.15 else 0 end
    )
  );
  rarity_weight_multiplier := least(1.3, greatest(1, 1 + luck_value * 0.02 + shiny_thing_level * 0.03));

  return jsonb_build_object(
    'version', 1,
    'preparationMinutes', round(30 * (1 - preparation_reduction), 2),
    'outboundSpeedMultiplier', round(outbound_speed_multiplier, 4),
    'returnSpeedMultiplier', round(return_speed_multiplier, 4),
    'discoveryRadiusMultiplier', round(discovery_radius_multiplier, 4),
    'rarityWeightMultiplier', round(rarity_weight_multiplier, 4),
    'longRouteConsistency', round(1 - remaining_long_route_penalty, 4),
    'isLongRoute', is_long_route
  );
end;
$$;

create or replace function public.resolve_delivery_travel_modifiers()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  selected_mascot public.player_mascots;
  snapshot jsonb;
  dispatch_requested_at timestamptz;
  outbound_duration interval;
  return_duration interval;
begin
  if new.travel_modifiers is not null then
    return new;
  end if;

  select * into selected_mascot
  from public.player_mascots
  where id = new.mascot_id;

  if selected_mascot.id is null then
    raise exception 'Mascot not found while resolving travel modifiers' using errcode = '23503';
  end if;

  snapshot := public.derive_mascot_travel_modifiers(
    selected_mascot.attributes,
    selected_mascot.trait,
    selected_mascot.skills,
    new.distance_km
  );
  dispatch_requested_at := new.outbound_start_at;
  outbound_duration := (new.distance_km / new.animal_speed_kmh / (snapshot ->> 'outboundSpeedMultiplier')::numeric) * interval '1 hour';
  return_duration := (new.distance_km / new.animal_speed_kmh / (snapshot ->> 'returnSpeedMultiplier')::numeric) * interval '1 hour';

  new.travel_modifiers := snapshot;
  new.outbound_start_at := dispatch_requested_at + ((snapshot ->> 'preparationMinutes')::numeric * interval '1 minute');
  new.outbound_arrival_at := new.outbound_start_at + outbound_duration;
  new.return_start_at := new.outbound_arrival_at + interval '30 minutes';
  new.return_arrival_at := new.return_start_at + return_duration;
  new.status := 'preparing';

  return new;
end;
$$;

create trigger resolve_delivery_travel_modifiers_before_insert
before insert on public.deliveries
for each row execute function public.resolve_delivery_travel_modifiers();

create or replace function public.prevent_delivery_travel_modifier_changes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if old.travel_modifiers is distinct from new.travel_modifiers then
    raise exception 'Delivery travel modifiers are immutable' using errcode = '22023';
  end if;

  return new;
end;
$$;

create trigger prevent_delivery_travel_modifier_changes_before_update
before update of travel_modifiers on public.deliveries
for each row execute function public.prevent_delivery_travel_modifier_changes();

revoke all on function public.derive_mascot_travel_modifiers(jsonb, jsonb, jsonb, numeric) from public;
revoke all on function public.resolve_delivery_travel_modifiers() from public;
revoke all on function public.prevent_delivery_travel_modifier_changes() from public;
