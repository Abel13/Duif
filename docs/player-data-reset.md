# Player Data Reset Runbook

Milestone 37 separates official catalogs from player-owned state. Never run this operation from
an application startup, migration, seed, or deployment hook.

## Preserved data

- `mascot_templates` (the three starter archetypes);
- `correspondence_options`;
- `reward_items`;
- `route_reward_points`;
- migrations, translations, and official packaged assets;
- previous rows in `player_data_reset_audit`.

Everything in Auth plus profiles, owned mascots, friendships, deliveries, correspondence content,
delivery rewards, route discoveries, and inventory is deleted.

## Prerequisites

Install PostgreSQL client tools (`psql`, `pg_dump`) and obtain the direct database URL. Keep URLs,
allowlists, and backups outside the repository. Copy `supabase/admin/reset-allowlist.example` to an
external directory and replace its line with the exact `project-ref|database-hostname` pair.

## Local

Rebuild from migrations and the catalog-only seed:

```sh
npx supabase db reset
```

The administrative runner can also report counts without deleting:

```sh
scripts/reset-player-data.sh --environment local --db-url "$LOCAL_DB_URL" \
  --project-ref local --operator "$USER"
```

Use the displayed `RESET-local-<total>` token with `--execute --confirmation` only after reviewing
the counts.

## Remote

First run without `--execute`. Then repeat with the exact token shown by the dry-run:

```sh
scripts/reset-player-data.sh --environment remote --db-url "$REMOTE_DB_URL" \
  --project-ref "$PROJECT_REF" --operator "$USER" \
  --allowlist "$RESET_ALLOWLIST" --backup-dir "$BACKUP_DIR"

scripts/reset-player-data.sh --environment remote --db-url "$REMOTE_DB_URL" \
  --project-ref "$PROJECT_REF" --operator "$USER" \
  --allowlist "$RESET_ALLOWLIST" --backup-dir "$BACKUP_DIR" \
  --execute --confirmation "RESET-$PROJECT_REF-<total>"
```

The runner refuses a remote reset unless the project ref and database hostname match the allowlist,
the confirmation matches current counts, and a non-empty custom-format dump of `auth` and `public`
has been created. It writes the counts and backup identifier to `player_data_reset_audit` in the
same transaction as the deletion.

## Verification and recovery

Run `supabase/admin/player_data_counts.sql`; every returned count must be zero. Verify separately
that the preserved catalog counts are non-zero and match the release record. To recover, stop writes
and restore the custom dump into an empty compatible project with `pg_restore`; never merge an old
player dump over an active environment.
