#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --db-url URL --operator LABEL [--source-date YYYY-MM-DD]"
}

db_url=""; operator_label=""; source_date="$(date -u +%F)"
while (($#)); do
  case "$1" in
    --db-url) db_url="$2"; shift 2 ;;
    --operator) operator_label="$2"; shift 2 ;;
    --source-date) source_date="$2"; shift 2 ;;
    *) usage; exit 2 ;;
  esac
done

if [[ -z "$db_url" || -z "$operator_label" ]]; then usage; exit 2; fi
if ! date -u -j -f %F "$source_date" +%F >/dev/null 2>&1 && ! date -u -d "$source_date" +%F >/dev/null 2>&1; then
  echo "--source-date must use YYYY-MM-DD."; exit 2
fi

working_dir="$(mktemp -d)"
container_id=""; container_cities_file=""; container_admin1_file=""; container_import_sql=""
cleanup() {
  if [[ -n "$container_id" ]]; then
    docker exec "$container_id" rm -f "$container_cities_file" "$container_admin1_file" "$container_import_sql" >/dev/null 2>&1 || true
  fi
  rm -rf "$working_dir"
}
trap cleanup exit
archive="$working_dir/cities15000.zip"; admin1_file="$working_dir/admin1CodesASCII.txt"
cities_file="$working_dir/cities15000.txt"

curl --fail --location --silent --show-error \
  https://download.geonames.org/export/dump/cities15000.zip \
  --output "$archive"
unzip -p "$archive" cities15000.txt > "$cities_file"
curl --fail --location --silent --show-error https://download.geonames.org/export/dump/admin1CodesASCII.txt --output "$admin1_file"

if [[ ! -s "$cities_file" ]] || [[ "$(awk 'END { print NR }' "$cities_file")" -lt 1000 ]]; then
  echo "Downloaded GeoNames cities15000 dump is invalid or unexpectedly small."; exit 3
fi
if [[ ! -s "$admin1_file" ]] || [[ "$(awk 'END { print NR }' "$admin1_file")" -lt 100 ]]; then
  echo "Downloaded GeoNames admin1CodesASCII dump is invalid or unexpectedly small."; exit 3
fi

source_sha256="$(shasum -a 256 "$archive" | awk '{print $1}')"
admin1_source_sha256="$(shasum -a 256 "$admin1_file" | awk '{print $1}')"
host_import_sql="$working_dir/import-geonames.sql"
sed -e "s|__CITIES_FILE__|$cities_file|g" -e "s|__ADMIN1_FILE__|$admin1_file|g" supabase/admin/import_geonames_cities.sql > "$host_import_sql"

if command -v psql >/dev/null 2>&1; then
  psql "$db_url" -v ON_ERROR_STOP=1 \
    -v source_date="$source_date" \
    -v source_sha256="$source_sha256" \
    -v admin1_source_sha256="$admin1_source_sha256" \
    -v operator_label="$operator_label" \
    -f "$host_import_sql"
  exit 0
fi

if [[ "$db_url" != *127.0.0.1* && "$db_url" != *localhost* ]]; then
  echo "psql is required to import into a remote database."; exit 4
fi

project_name="$(basename "$PWD")"
container_id="$(docker ps --filter "label=com.supabase.cli.project=$project_name" --filter "name=supabase_db_" --format '{{.ID}}' | head -n 1)"
if [[ -z "$container_id" ]]; then
  echo "psql is unavailable and no local Supabase database container was found."; exit 4
fi

container_cities_file="/tmp/duif-cities15000-$$.txt"
container_admin1_file="/tmp/duif-admin1-$$.txt"
container_import_sql="/tmp/duif-import-geonames-$$.sql"
docker cp "$cities_file" "$container_id:$container_cities_file"
docker cp "$admin1_file" "$container_id:$container_admin1_file"
sed -e "s|__CITIES_FILE__|$container_cities_file|g" -e "s|__ADMIN1_FILE__|$container_admin1_file|g" supabase/admin/import_geonames_cities.sql > "$host_import_sql"
docker cp "$host_import_sql" "$container_id:$container_import_sql"
docker exec "$container_id" psql -U postgres -d postgres -v ON_ERROR_STOP=1 \
  -v source_date="$source_date" \
  -v source_sha256="$source_sha256" \
  -v admin1_source_sha256="$admin1_source_sha256" \
  -v operator_label="$operator_label" \
  -f "$container_import_sql"
