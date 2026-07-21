-- Existing delivery snapshots are immutable. This only changes modifiers materialized for new deliveries.
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
    'version', 2,
    'preparationMinutes', greatest(3, round(5 * (1 - preparation_reduction), 2)),
    'outboundSpeedMultiplier', round(outbound_speed_multiplier, 4),
    'returnSpeedMultiplier', round(return_speed_multiplier, 4),
    'discoveryRadiusMultiplier', round(discovery_radius_multiplier, 4),
    'rarityWeightMultiplier', round(rarity_weight_multiplier, 4),
    'longRouteConsistency', round(1 - remaining_long_route_penalty, 4),
    'isLongRoute', is_long_route
  );
end;
$$;
