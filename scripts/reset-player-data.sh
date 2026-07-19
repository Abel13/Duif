#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 --environment local|remote --db-url URL --project-ref REF --operator LABEL [--execute --confirmation TOKEN --allowlist FILE --backup-dir DIR]"
}

environment=""; db_url=""; project_ref=""; operator_label=""
confirmation=""; allowlist=""; backup_dir=""; execute="false"

while (($#)); do
  case "$1" in
    --environment) environment="$2"; shift 2 ;;
    --db-url) db_url="$2"; shift 2 ;;
    --project-ref) project_ref="$2"; shift 2 ;;
    --operator) operator_label="$2"; shift 2 ;;
    --confirmation) confirmation="$2"; shift 2 ;;
    --allowlist) allowlist="$2"; shift 2 ;;
    --backup-dir) backup_dir="$2"; shift 2 ;;
    --execute) execute="true"; shift ;;
    *) usage; exit 2 ;;
  esac
done

if [[ -z "$environment" || -z "$db_url" || -z "$project_ref" || -z "$operator_label" ]]; then
  usage; exit 2
fi
if [[ "$environment" != "local" && "$environment" != "remote" ]]; then
  echo "Environment must be local or remote."; exit 2
fi

database_host="$(DB_URL="$db_url" node -e 'console.log(new URL(process.env.DB_URL).hostname)')"
counts="$(psql "$db_url" -v ON_ERROR_STOP=1 -f supabase/admin/player_data_counts.sql | tr -d '[:space:]')"
total="$(COUNTS="$counts" node -e 'const c=JSON.parse(process.env.COUNTS); console.log(Object.values(c).reduce((sum,n)=>sum+Number(n),0))')"
expected="RESET-${project_ref}-${total}"

echo "Target: ${environment} ${project_ref} (${database_host})"
echo "Player data counts: ${counts}"
echo "Required confirmation: ${expected}"

if [[ "$execute" != "true" ]]; then
  psql "$db_url" -v ON_ERROR_STOP=1 -v dry_run=true -f supabase/admin/player_data_reset.sql
  exit 0
fi
if [[ "$confirmation" != "$expected" ]]; then
  echo "Confirmation token is incorrect."; exit 3
fi

timestamp="$(date -u +%Y%m%dT%H%M%SZ)"
backup_identifier="local-no-backup-required"
if [[ "$environment" == "remote" ]]; then
  if [[ -z "$allowlist" || ! -f "$allowlist" ]]; then
    echo "Remote reset requires an external allowlist file."; exit 4
  fi
  if ! awk -F '|' -v ref="$project_ref" -v host="$database_host" '$1 == ref && $2 == host { found=1 } END { exit !found }' "$allowlist"; then
    echo "Remote project ref and hostname are not allowlisted."; exit 4
  fi
  if [[ -z "$backup_dir" || ! -d "$backup_dir" ]]; then
    echo "Remote reset requires an existing backup directory outside the repository."; exit 5
  fi
  backup_path="${backup_dir%/}/duif-${project_ref}-${timestamp}.dump"
  pg_dump --format=custom --no-owner --no-privileges --schema=auth --schema=public --file="$backup_path" "$db_url"
  if [[ ! -s "$backup_path" ]]; then
    echo "Backup was not created."; exit 5
  fi
  backup_identifier="$backup_path"
fi

psql "$db_url" -v ON_ERROR_STOP=1 -v dry_run=false \
  -v environment="$environment" -v project_ref="$project_ref" \
  -v operator_label="$operator_label" -v backup_identifier="$backup_identifier" \
  -v confirmation="$confirmation" -v expected_confirmation="$expected" \
  -f supabase/admin/player_data_reset.sql

echo "Reset complete. Verifying player-owned rows are empty..."
psql "$db_url" -v ON_ERROR_STOP=1 -f supabase/admin/player_data_counts.sql
