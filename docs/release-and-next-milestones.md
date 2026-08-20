# Release operations

The roadmap is the only source for milestone status and scope: [roadmap.md](./roadmap.md). This document contains only the remote release gate and its operational history.

## Local validation baseline

Local migrations, frontend tests, production build, and transactional database suites must pass before a release candidate is considered ready. Local success does not imply remote deployment.

## Remote release gate

The linked Supabase project is `zeuzkzfefulpqafchcsy`. On 2026-08-19, a read-only `supabase migration list --linked --output json` request returned HTTP 403 because the current Supabase account lacks platform privileges. No remote migration, data import, function deployment, or Auth setting was changed by that audit.

An organization owner must grant a role that can inspect and deploy the identified project (or provide an approved deployment credential). Then:

1. Review the remote migration list; never infer it from local state.
2. Apply pending migrations with `supabase db push --linked`.
3. Deploy `asset-studio` and `geonames-refresh` when their migrations require them.
4. Run the documented GeoNames administrative refresh when applicable.
5. Configure production redirects, PKCE, SMTP, password/rate-limit policy, refresh-token rotation, and `VITE_DUIF_REQUIRE_PWA_INSTALL=true`.
6. Run account, onboarding, first-send, and administrator smoke tests.
7. Record the deployed migration head and smoke-test result in the release record.

This gate is not authorization to reset a remote database. Use [player-data-reset.md](./player-data-reset.md) only with explicit approval.
