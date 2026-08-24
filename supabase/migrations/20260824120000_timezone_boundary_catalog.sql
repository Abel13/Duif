-- Versioned IANA timezone boundaries used only to resolve a delivery's visual
-- timezone. Boundary geometry is never readable by game clients.
create extension if not exists postgis with schema extensions;

create table public.timezone_boundary_imports (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source = 'timezone-boundary-builder'),
  version text not null check (char_length(btrim(version)) between 1 and 80),
  source_sha256 text not null check (source_sha256 ~ '^[0-9a-f]{64}$'),
  boundary_count integer not null check (boundary_count > 0),
  imported_at timestamptz not null default now(),
  unique (source, version)
);

create table public.timezone_boundaries (
  id bigint generated always as identity primary key,
  import_id uuid not null references public.timezone_boundary_imports(id) on delete cascade,
  time_zone text not null check (time_zone ~ '^[A-Za-z0-9_+-]+/[A-Za-z0-9_+/-]+$' or time_zone = 'UTC'),
  geometry extensions.geometry(MultiPolygon, 4326) not null,
  priority smallint not null default 0,
  created_at timestamptz not null default now(),
  unique (import_id, time_zone)
);

create index timezone_boundaries_geometry_idx on public.timezone_boundaries using gist (geometry);
create index timezone_boundaries_import_idx on public.timezone_boundaries (import_id, priority desc);
alter table public.timezone_boundary_imports enable row level security;
alter table public.timezone_boundaries enable row level security;
revoke all on public.timezone_boundary_imports, public.timezone_boundaries from public, anon, authenticated;

create or replace function public.resolve_delivery_visual_timezone(delivery_id uuid, latitude double precision, longitude double precision)
returns text
language plpgsql security definer set search_path = public, auth, extensions, pg_temp as $$
declare resolved_timezone text;
begin
  if auth.uid() is null then raise exception 'Authentication required' using errcode = '28000'; end if;
  if latitude not between -90 and 90 or longitude not between -180 and 180 then
    raise exception 'Invalid coordinates' using errcode = '22023';
  end if;
  if not exists (
    select 1 from public.deliveries delivery
    join public.profiles sender on sender.id = delivery.sender_profile_id
    left join public.profiles receiver on receiver.id = delivery.receiver_profile_id
    where delivery.id = resolve_delivery_visual_timezone.delivery_id
      and auth.uid() in (sender.auth_user_id, receiver.auth_user_id)
  ) then raise exception 'Forbidden' using errcode = '42501'; end if;

  select boundary.time_zone into resolved_timezone
  from public.timezone_boundaries boundary
  join public.timezone_boundary_imports imported on imported.id = boundary.import_id
  where extensions.ST_Covers(boundary.geometry, extensions.ST_SetSRID(extensions.ST_MakePoint(longitude, latitude), 4326))
  order by imported.imported_at desc, boundary.priority desc, boundary.id
  limit 1;
  return coalesce(resolved_timezone, 'UTC');
end $$;

revoke all on function public.resolve_delivery_visual_timezone(uuid, double precision, double precision) from public, anon;
grant execute on function public.resolve_delivery_visual_timezone(uuid, double precision, double precision) to authenticated;
