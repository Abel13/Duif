\set ON_ERROR_STOP on
-- Generate this TSV from the pinned timezone-boundary-builder release. The
-- geometry column must be WKT MULTIPOLYGON in EPSG:4326 and the SHA must be
-- the release artifact's SHA-256, not a locally transformed file hash.
-- Required psql variables: version, source_sha256, boundaries_file
begin;
create temporary table timezone_boundary_staging (
  time_zone text,
  priority smallint,
  geometry_wkt text
) on commit drop;
\copy timezone_boundary_staging from :'boundaries_file' with (format csv, header true)

do $$
begin
  if (select count(*) from timezone_boundary_staging) < 1 then raise exception 'Timezone boundary input is empty'; end if;
  if exists (select 1 from timezone_boundary_staging where time_zone !~ '^[A-Za-z0-9_+-]+/[A-Za-z0-9_+/-]+$' and time_zone <> 'UTC') then raise exception 'Invalid IANA timezone name'; end if;
  if exists (select 1 from timezone_boundary_staging where not extensions.ST_IsValid(extensions.ST_GeomFromText(geometry_wkt,4326))) then raise exception 'Invalid timezone boundary geometry'; end if;
end $$;

insert into public.timezone_boundary_imports(source,version,source_sha256,boundary_count)
values ('timezone-boundary-builder', :'version', :'source_sha256', (select count(*) from timezone_boundary_staging))
returning id \gset

insert into public.timezone_boundaries(import_id,time_zone,priority,geometry)
select :'id'::uuid, time_zone, coalesce(priority,0), extensions.ST_Multi(extensions.ST_GeomFromText(geometry_wkt,4326))
from timezone_boundary_staging;

-- Replace any explicit UTC fallback snapshots now that authoritative civil
-- time is available. The backfill is idempotent and preserves postal content.
select public.backfill_authoritative_postmark_dates();
commit;
