create or replace function public.enrich_delivery_weather_summary() returns trigger
language plpgsql security definer set search_path=public,pg_temp as $$
declare segment public.delivery_route_segments%rowtype;
begin
  if new.travel_weather_summary is null then return new; end if;
  select * into segment from public.delivery_route_segments where delivery_id=new.id and state<>'completed' order by estimated_start_at limit 1;
  if segment.id is null then select * into segment from public.delivery_route_segments where delivery_id=new.id order by estimated_end_at desc limit 1; end if;
  if segment.id is not null then
    new.travel_weather_summary:=new.travel_weather_summary||jsonb_build_object(
      'isDay',coalesce((segment.weather_snapshot->>'isDay')::boolean,true),
      'conditionImpactMultiplier',coalesce((segment.modifiers->>'weather')::numeric,1)
    );
  end if;
  return new;
end $$;
create trigger enrich_delivery_weather_summary_before_update before update of travel_weather_summary on public.deliveries for each row execute function public.enrich_delivery_weather_summary();
update public.deliveries set travel_weather_summary=travel_weather_summary where travel_weather_summary is not null;
revoke all on function public.enrich_delivery_weather_summary() from public,anon,authenticated;
