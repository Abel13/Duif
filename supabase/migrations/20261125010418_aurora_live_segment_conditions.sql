-- The travel clock stores sunrise/sunset in daylight windows. Recompute the speed
-- before equipment applies its clamp; keep evidence of bonuses already used for XP.
create function public.aurora_active_speed() returns trigger
language plpgsql security definer set search_path='' as $$
declare
  snapshot jsonb;
  weather jsonb:=new.weather_snapshot;
  daylight boolean;
  effect jsonb;
  speed numeric:=1;
  applied jsonb;
begin
  select travel_modifiers into snapshot from public.deliveries where id=new.delivery_id;
  if snapshot->>'traitId' is distinct from 'trait-aurora-horizon' then return new; end if;
  select is_day into daylight from public.delivery_route_daylight_windows
    where segment_id=new.id and ended_at is null order by started_at desc limit 1;
  if found then weather:=weather||jsonb_build_object('isDay',daylight); end if;
  applied:=case when old.state='active' then coalesce(old.modifiers->'skillEffects','[]'::jsonb)
    else coalesce(new.modifiers->'auroraDiscoveryEffects','[]'::jsonb) end;
  if public.aurora_visible(weather) then
    for effect in select e from jsonb_array_elements(snapshot->'skillEffects') e
      where e->>'state'='active' and (
        (e->>'skillId'='skill-aurora-sky-reading' and weather->>'category'='clear')
        or (e->>'skillId'='skill-aurora-nest-memory' and new.leg='return'
          and (snapshot#>>'{skillContext,familiarity}')::int>=3)) loop
      speed:=speed+(effect#>>'{impact,value}')::numeric;
      if not applied @> jsonb_build_array(effect) then applied:=applied||jsonb_build_array(effect); end if;
    end loop;
  end if;
  new.modifiers:=new.modifiers||jsonb_build_object('skills',speed,'skillEffects',applied,'auroraActive',true);
  return new;
end $$;

create trigger aa_aurora_active_speed before update of state,effective_speed_kmh,weather_snapshot
on public.delivery_route_segments for each row when (new.state='active') execute function public.aurora_active_speed();

create function public.aurora_active_eta() returns trigger
language plpgsql set search_path='' as $$
declare remaining interval;
begin
  remaining:=old.estimated_end_at-greatest(old.estimated_start_at,new.updated_at);
  if remaining>interval '0 seconds' and new.effective_speed_kmh>0 then
    new.estimated_end_at:=greatest(old.estimated_start_at,new.updated_at)
      + remaining*(old.effective_speed_kmh/new.effective_speed_kmh)::double precision;
  end if;
  return new;
end $$;
create trigger z_aurora_active_eta before update of state,effective_speed_kmh,weather_snapshot
on public.delivery_route_segments for each row when (new.state='active' and new.modifiers ? 'auroraActive'
  and old.effective_speed_kmh is distinct from new.effective_speed_kmh) execute function public.aurora_active_eta();
revoke all on function public.aurora_active_speed(),public.aurora_active_eta() from public,anon,authenticated;
