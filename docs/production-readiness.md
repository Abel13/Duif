# Production readiness

This checklist covers the production baseline through Milestone 55. Run it against a local database
after migrations, then repeat only the documented configuration and verification steps in the
explicitly identified remote project. Do not use a production project as a test target.

## Verification

```sh
npm test
npm run build
scripts/verify-production-readiness.sh \
  --db-url "postgresql://postgres:postgres@127.0.0.1:56322/postgres"
```

The database script covers anonymous, onboarding, completed-onboarding, and administrator
boundaries through the account, tutorial, nest-search, asset, catalog-refresh, and friendship
contracts. Every SQL test opens a transaction and finishes with `ROLLBACK`.

The runtime audit is intentionally strict: authenticated page and Supabase integration code must
not import `mockData`, `mockRewardCollection`, or a prototype player identity. Static official
catalogs may remain bundled only when they carry stable catalog keys and translation keys; they are
not a fallback for player-owned data.

## Remote configuration

Before release, configure Supabase Auth for the production HTTPS origin:

- enable email confirmations; keep password login enabled and anonymous sign-in disabled;
- require at least eight characters with letters and digits;
- use PKCE email links and allow-list only the production `/auth/callback` and
  `/auth/reset-password` URLs, plus deliberate local-development URLs;
- configure production SMTP and the localized confirmation and reset templates in
  `supabase/templates/email/`;
- retain refresh-token rotation, a one-hour JWT lifetime, and rate limits for sign-in/sign-up,
  email delivery, token verification, and token refresh;
- set `VITE_DUIF_REQUIRE_PWA_INSTALL=true` only in the production web environment;
- deploy `asset-studio` and `geonames-refresh` after their dependencies change;
- configure `WEATHER_RESOLVER_CRON_SECRET` in the Edge Function and the matching
  `duif_weather_resolver_cron_secret` in Vault, then deploy `weather-travel-resolver` with
  `--no-verify-jwt` after its migrations;
- remember that Git/Vercel deployment does not apply Supabase migrations or publish Edge Functions.

Validate the weather resolver through `net._http_response`: require HTTP `200`, `applied > 0`,
`failed = 0`, `circuitOpen = false`, and `fallback = false`. Recent rows in
`weather_forecast_cache` must use `source = 'openMeteo'`. The initial production validation on
2026-08-24 applied three forecasts successfully.

The public app always shows generic confirmation, resend, sign-in, and recovery responses. Never
surface whether an e-mail address exists, and never put service-role or database credentials in a
Vite environment variable.

## Recovery and rollback

Password reset links exchange a PKCE code in the browser, immediately remove it from the URL, and
sign out all sessions after a successful password change. Invalid or expired links return to the
generic recovery surface.

For player-data operations, follow [the reset runbook](./player-data-reset.md); it identifies the
project, records a backup where required, and preserves official catalogs. Asset activation and
archive/restore procedures are in [the asset-studio guide](./asset-studio.md). GeoNames refreshes
are atomic and retain their audit history; the CLI recovery procedure is in
[the GeoNames guide](./geonames.md).
