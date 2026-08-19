# Release ledger and next milestones

Updated: 2026-08-19.

## Local release state

All repository migrations through `20260819170300` are applied to the local Supabase instance.
The frontend test suite, production build, and transactional production-readiness SQL suite pass
locally. The local suite covers anonymous, onboarding, completed-onboarding, and administrator
boundaries, plus idempotency for onboarding, provisioning, tutorial collection, nest activation,
friend requests, catalog refreshes, referral attribution, qualification, and the one-time Owl
grant.

## Remote release gate

The linked Supabase project is `zeuzkzfefulpqafchcsy`. On 2026-08-19, a read-only
`supabase migration list --linked --output json` request returned HTTP 403 because the current
Supabase account lacks platform privileges. No remote migration, data import, function deployment,
or Auth setting was changed as part of this audit.

An organization owner must grant a role that can inspect and deploy the linked project (or provide
an approved deployment credential). Once access exists, execute this order against the identified
project only:

1. Read and review the remote migration list; do not infer it from local state.
2. Apply the pending migrations with `supabase db push --linked`.
3. Deploy `asset-studio` and `geonames-refresh`.
4. Import GeoNames using the documented administrative refresh or CLI recovery path.
5. Configure the production HTTPS redirect allow-list, PKCE, SMTP templates, password rules, rate
   limits, refresh-token rotation, and `VITE_DUIF_REQUIRE_PWA_INSTALL=true`.
6. Run the new-account, confirmation, reset-password, install-gate, onboarding, first send, and
   administrator smoke tests.
7. Record the deployed migration head and smoke-test result before opening the app to players.

This is a release-operation dependency, not an invitation to reset the remote database. The reset
runbook remains [player-data-reset.md](./player-data-reset.md).

## Product sequence

### Completed locally: Milestone 48A — Traceable Invitations and Owl Reward

The referral system is implemented locally. It keeps invitation attribution separate from
friendship, qualifies only confirmed and completed accounts, awards the Owl exactly once after
five distinct qualifiers, and exposes no invitee list. Production deployment also requires the
`REFERRAL_INVITE_SIGNING_SECRET` Edge Function secret before `referral-invite` is deployed.

### Proposed Milestone 52 — Official Postcards and Stickers

Expand the real correspondence path from MVP letters to official, catalog-backed postcard and
sticker variants. Include backend validation, recipient mailbox rendering, and inventory ownership
rules. Exclude user uploads, gifts, trading, payment, and randomized paid rewards.

### Proposed Milestone 52A — Personal Postal Finishing

Make one official stamp and one postmark mandatory on every outgoing correspondence. Every player
starts with a reusable default pair and may replace either with an owned personalized cosmetic.
Personalized stamps and marks may later come from collection, received correspondence, or the
shop; none are consumed or change the currency/economy model in this milestone.

### Proposed Milestone 53 — Quiet Delivery Notices

Add private in-app notices for delivered correspondence and returned mascots, with idempotent read
state and deep links into the mailbox or map. Keep browser push notifications, real-time tracking,
and social feeds outside this slice.

### Proposed Milestone 54 — Collection Expression Review

After observing real correspondence and route rewards, define the smallest safe slice for favorite
received items and duplicate collection handling. Do not add purchasing, conversion currencies, or
trading until that review is complete.
