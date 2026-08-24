# Release operations

The roadmap is the only source for milestone status and scope: [roadmap.md](./roadmap.md). This document contains only the remote release gate and its operational history.

## Local validation baseline

Local migrations, frontend tests, production build, and transactional database suites must pass before a release candidate is considered ready. Local success does not imply remote deployment.

## Remote release gate

The linked Supabase project is `zeuzkzfefulpqafchcsy`. Deployment access was operational by
2026-08-24, when the segmented-weather migrations and `weather-travel-resolver` were published and
Open-Meteo persisted three forecasts successfully. Remote release remains manual: Git and Vercel
pushes do not apply Supabase migrations, publish Edge Functions, or configure secrets.

For each release:

1. Review the remote migration list; never infer it from local state.
2. Apply pending migrations with `supabase db push --linked`.
3. Deploy `asset-studio`, `geonames-refresh`, and `weather-travel-resolver` when their code or
   dependencies change; publish the weather resolver with `--no-verify-jwt` because it uses its
   dedicated cron secret.
4. Run the documented GeoNames administrative refresh when applicable.
5. Configure production redirects, PKCE, SMTP, password/rate-limit policy, refresh-token rotation, and `VITE_DUIF_REQUIRE_PWA_INSTALL=true`.
6. Run account, onboarding, first-send, and administrator smoke tests.
7. Invoke the weather resolver and require HTTP `200`, `applied > 0`, `failed = 0`,
   `circuitOpen = false`, `fallback = false`, and recent `openMeteo` cache rows.
8. Record the deployed migration head and validation results in the release record.

This gate is not authorization to reset a remote database. Use [player-data-reset.md](./player-data-reset.md) only with explicit approval.
