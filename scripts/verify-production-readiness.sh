#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --db-url URL"
}

db_url=""
while (($#)); do
  case "$1" in
    --db-url) db_url="$2"; shift 2 ;;
    *) usage; exit 2 ;;
  esac
done

if [[ -z "$db_url" ]]; then usage; exit 2; fi

tests=(
  supabase/tests/resumable_account_onboarding.sql
  supabase/tests/initial_mascot_provisioning.sql
  supabase/tests/mandatory_tutorial_delivery.sql
  supabase/tests/geonames_nest_search.sql
  supabase/tests/asset_studio.sql
  supabase/tests/geonames_admin_refresh.sql
  supabase/tests/postal_friend_connections.sql
  supabase/tests/postal_jobs.sql
)

run_test() {
  local test_file="$1"
  echo "Checking ${test_file}"
  if command -v psql >/dev/null 2>&1; then
    psql "$db_url" -v ON_ERROR_STOP=1 -f "$test_file"
    return
  fi

  if [[ "$db_url" != *127.0.0.1* && "$db_url" != *localhost* ]]; then
    echo "psql is required for a non-local database." >&2
    exit 4
  fi

  local project_name container_id
  project_name="$(basename "$PWD")"
  container_id="$(docker ps --filter "label=com.supabase.cli.project=${project_name}" --filter "name=supabase_db_" --format '{{.ID}}' | head -n 1)"
  if [[ -z "$container_id" ]]; then
    echo "No local Supabase database container was found." >&2
    exit 4
  fi
  docker exec -i "$container_id" psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$test_file"
}

for test_file in "${tests[@]}"; do run_test "$test_file"; done

echo "Production-readiness database checks passed. Every listed test ends with ROLLBACK."
