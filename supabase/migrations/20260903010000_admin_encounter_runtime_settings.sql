-- Admin-editable runtime settings for local encounters (radius and related knobs).
create table if not exists public.app_runtime_settings (
  setting_key text primary key,
  setting_value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users (id) on delete set null
);

alter table public.app_runtime_settings enable row level security;
revoke all on table public.app_runtime_settings from anon, authenticated;

insert into public.app_runtime_settings (setting_key, setting_value)
values
  ('encounter.radiusKm', '1000'::jsonb),
  ('encounter.refreshMinutes', '5'::jsonb),
  ('encounter.resultLimit', '5'::jsonb)
on conflict (setting_key) do nothing;

create or replace function public.admin_get_encounter_settings()
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
begin
  if not public.is_asset_admin() then
    raise exception 'Encounter administration requires an admin role' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'radiusKm', coalesce((select setting_value #>> '{}' from public.app_runtime_settings where setting_key = 'encounter.radiusKm')::numeric, 1000),
    'refreshMinutes', coalesce((select setting_value #>> '{}' from public.app_runtime_settings where setting_key = 'encounter.refreshMinutes')::numeric, 5),
    'resultLimit', coalesce((select setting_value #>> '{}' from public.app_runtime_settings where setting_key = 'encounter.resultLimit')::numeric, 5)
  );
end;
$$;

create or replace function public.admin_update_encounter_settings(
  target_radius_km numeric,
  target_refresh_minutes numeric,
  target_result_limit numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  actor uuid := auth.uid();
begin
  perform public.assert_asset_admin_actor(actor);
  if target_radius_km is null or target_radius_km < 1 or target_radius_km > 20050 then
    raise exception 'Encounter radius must be between 1 and 20050 km' using errcode = '22023';
  end if;
  if target_refresh_minutes is null or target_refresh_minutes < 1 or target_refresh_minutes > 1440 then
    raise exception 'Encounter refresh must be between 1 and 1440 minutes' using errcode = '22023';
  end if;
  if target_result_limit is null or target_result_limit < 1 or target_result_limit > 50 then
    raise exception 'Encounter result limit must be between 1 and 50' using errcode = '22023';
  end if;

  insert into public.app_runtime_settings (setting_key, setting_value, updated_at, updated_by)
  values
    ('encounter.radiusKm', to_jsonb(round(target_radius_km)::int), now(), actor),
    ('encounter.refreshMinutes', to_jsonb(round(target_refresh_minutes)::int), now(), actor),
    ('encounter.resultLimit', to_jsonb(round(target_result_limit)::int), now(), actor)
  on conflict (setting_key) do update
    set setting_value = excluded.setting_value,
        updated_at = excluded.updated_at,
        updated_by = excluded.updated_by;

  return public.admin_get_encounter_settings();
end;
$$;

revoke all on function public.admin_get_encounter_settings() from public, anon;
revoke all on function public.admin_update_encounter_settings(numeric, numeric, numeric) from public, anon;
grant execute on function public.admin_get_encounter_settings() to authenticated;
grant execute on function public.admin_update_encounter_settings(numeric, numeric, numeric) to authenticated;
