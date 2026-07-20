# Backend Schema

This document describes the first local Supabase foundation for DUIF.

The goal of the backend foundation is to model the current playable loop while keeping
frontend migration gradual and safe.

## Local Ports

DUIF uses non-default Supabase ports because another local app already uses the default Supabase range.

- API: `http://127.0.0.1:56321`
- Database: `postgresql://postgres:postgres@127.0.0.1:56322/postgres`
- Studio: `http://127.0.0.1:56323`
- Inbucket/Mailpit: `http://127.0.0.1:56324`
- Analytics: `56327`
- Edge runtime inspector: `56328`
- Pooler, when enabled later: `56329`

The pooler and imgproxy services are currently disabled by the local config.

## Tables

The initial schema lives in `supabase/migrations/20260709200000_initial_duif_schema.sql`.

### Core Player Data

- `account_onboarding`: server-owned progress and reserved public display name tied directly to
  an Auth user before a profile exists.
- `profiles`: player or friend profile, display name, private calculation coordinates,
  postal-base fields, and optional future auth user link.
- `mascot_templates`: static starter mascot definitions.
- `player_mascots`: owned mascot state copied from templates for a profile.
- `friendships`: simple profile-to-profile relationship with friendship level and exchange count.

### Delivery Loop

- `correspondence_options`: static sendable correspondence types.
- `deliveries`: sender, receiver, mascot, coordinates, timestamps, status, speed, reward seed,
  immutable travel modifiers, and nullable route-discovery version.
- `delivery_correspondence_contents`: persisted letter/postcard/sticker/gift prototype
  content attached to a delivery.
- `reward_items`: static reward item definitions.
- `delivery_rewards`: reward generated for a delivery, including XP and collection state.
- `route_reward_points`: read-only regional discovery catalog with corridor radius and item link.
- `delivery_route_discoveries`: authoritative per-delivery cargo with route progress, corridor
  distance, and idempotent collection references.
- `inventory_items`: player-owned inventory item state.

## Enums

The schema uses PostgreSQL enums for stable game categories:

- `delivery_status`
- `correspondence_type`
- `reward_rarity`
- `inventory_category`
- `onboarding_stage`

These match the current TypeScript game unions closely enough for future mapping work.

## Seed Data

`supabase/seed.sql` contains only player-independent official catalogs: starter archetypes,
correspondence options, reward items, and route discovery points. Player profiles, owned mascots,
friendships, deliveries, collection progress, and Auth users are never seeded.

Official records use stable UUIDs for relationships and `catalog_key` for internal catalog
selection. Player-owned rows use UUIDs only. There is no `mock_key` compatibility contract.

Official translated fields reference `official_translation_keys`. A catalog record may be
incomplete while its status is `draft`, but the database rejects activation unless every direct
and nested key is registered for both `pt-BR` and `en-US`. Public catalog reads return only
`active` records.

## Data Shape Decisions

Some nested game data is stored as `jsonb` in this first pass:

- mascot attributes;
- trait;
- equipment;
- skills;
- appearance.

This keeps the schema close to the current prototype and avoids premature normalization. These fields can be split into dedicated tables later when customization, equipping, balance, or inventory rules become interactive.

Translation keys and asset paths are stored as `text`. The database stores identifiers, not
translated display copy. User-authored mascot names, correspondence, and postal-address text stay
literal and are never translated automatically.

## Postal Base Privacy

`profiles` now stores explicit postal-base fields:

- `postal_base_street`
- `postal_base_neighborhood`
- `postal_base_city`
- `postal_base_state`
- `postal_base_country`

Street, neighborhood, latitude, and longitude are private calculation/reference data. The
frontend social surfaces should render only city, state, and country for accepted friends.

Accepted-friend reads use the `get_accepted_friend_profiles` RPC instead of direct
`profiles` reads. The RPC returns only the friend profile id/mock key, display name,
city/state/country, friendship level, exchange count, and favorite note key.

## RLS Strategy

RLS is enabled on player-owned or relationship-sensitive tables:

- `account_onboarding`;
- `profiles`;
- `player_mascots`;
- `friendships`;
- `deliveries`;
- `delivery_rewards`;
- `delivery_route_discoveries`;
- `inventory_items`.

The first policies are read-focused and tied to `profiles.auth_user_id = auth.uid()`.
The clean foundation contains no seeded profiles. Profiles will be provisioned independently by
the onboarding RPC introduced in a later milestone.

Static definition tables are not RLS-gated in this first pass:

- `mascot_templates`;
- `correspondence_options`;
- `reward_items`.

The first frontend Supabase read layer uses only these public catalog tables. Player-owned
tables stay protected until DUIF adds auth or a server-side read boundary.

## Auth Foundation

DUIF uses Supabase Auth with email/password. Registration requires email confirmation and an
eight-character password containing letters and numbers. Public registration and recovery
responses do not disclose whether an address is registered. The legacy `claim_current_profile`
RPC remains removed: authentication creates only an Auth user, while a confirmed session without
a profile is routed to onboarding. `begin_or_resume_onboarding` creates or returns the caller's
versioned progress row, and `advance_account_onboarding` permits only the next linear stage while
holding the row lock. Browser roles may read only their own row and cannot write it directly.
Profile and initial mascot provisioning are performed together by `provision_initial_mascot`.
The RPC locks the onboarding row, consumes its selected archetype and literal mascot-name draft,
copies the official template snapshot, creates exactly one starter mascot, and advances exclusively
to `tutorial`. Repeated calls return the same profile and mascot. Browser roles cannot create or
alter the draft directly; `save_initial_mascot_draft` is the only write boundary during
`mascotChoice`.

The introduction persists `welcome`, `travel`, `discoveries`, `returnCollection`, and
`displayName` before handing off to `mascotChoice`. Future stages are already represented as
`tutorial`, `nestSetup`, and `completed`, but this milestone does not create their gameplay data.
The reserved player display name is normalized to NFC with collapsed whitespace, remains literal,
must contain 2 to 24 characters, and is reserved uniquely without regard to letter case.
Mascot names follow the same normalization and length rules. Localized Nuvem, Trovão, and Pipoca
labels are suggestions only. The provisional profile uses neutral coordinates and empty postal
fields with `onboarding.tutorialNestLabel`; it is not the player's real nest and must be replaced
by the later nest-activation flow.

The mandatory first route is stored as a real delivery with `is_tutorial = true` and a unique
per-sender constraint. `start_or_resume_tutorial_delivery` fixes its authoritative timeline at one
minute of preparation, seven outbound, one at the destination, and seven returning. Instruction
acknowledgements are linear and time-gated on `account_onboarding`; elapsed time never pauses while
the PWA is closed. Generic delivery collection and generic `tutorial → nestSetup` advancement reject
this flow. `collect_tutorial_delivery` alone inserts the two deterministic inventory items,
completes the delivery, and advances onboarding atomically and idempotently.

Local confirmation and recovery messages can be inspected through Inbucket. Equivalent remote
password, confirmation, redirect-allowlist, and SMTP settings must be applied only after the
remote project passes the Milestone 37 identification, backup, and reset gate.

## Frontend Read Layer

Supabase is the only runtime data source. Copy `.env.example` to `.env.local` and set:

```sh
VITE_SUPABASE_URL=http://127.0.0.1:56321
VITE_SUPABASE_ANON_KEY=<local anon key from supabase status>
```

If configuration is missing or the service cannot be reached, the UI shows a localized
service-unavailable state. It never falls back to player, delivery, inventory, social, or catalog
fixtures. Protected routes require both a session and the correct persisted journey stage; an
unfinished account is redirected to `/onboarding` rather than receiving an invented profile.

The current read layer intentionally reads only:

- `mascot_templates`;
- later public catalog rows such as `correspondence_options` and `reward_items`.

The mascot detail screen is the first authenticated gameplay consumer. When Supabase
data mode is enabled and the user is signed in, it reads `player_mascots` and matching
`deliveries` through RLS.

The send flow is the first authenticated gameplay write. It uses the
`create_delivery_from_selection` RPC to create rows in `deliveries`. The RPC validates
the current profile, owned mascot, accepted friendship, and active correspondence option
before inserting. It also computes route distance, travel timestamps, status, and reward
seed server-side.

The same RPC now accepts a `content_payload` JSON object and writes
`delivery_correspondence_contents`. It validates prototype limits before inserting:

- letters require 1 to 500 characters;
- postcards allow a city/event/photo placeholder variant and up to 180 message characters;
- stickers allow 1 to 3 mock sticker ids;
- small gifts allow an optional note up to 180 characters.

There is no direct insert policy for correspondence content. Delivery participants can read
content through RLS, and writes go through the RPC.

Reward collection is the second authenticated gameplay write. It uses the
`collect_delivery_reward` RPC to validate the current profile, verify that the delivery
has returned, lock it against concurrent collection, create or reuse the deterministic
`delivery_rewards` row, collect every materialized route discovery, mark the delivery as
`completed`, and return the primary item plus `routeInventoryItems`. Only the sender who
owns the traveling mascot may collect; both delivery participants may read discoveries.

New deliveries materialize every eligible `route_reward_points` row in an `after insert`
trigger and receive `route_discovery_version = 1`, including routes with no eligible point.
Legacy deliveries remain nullable and are not backfilled. Browser roles have no insert,
update, or delete policies for the point catalog or discovery rows.

Friend profile reads for social UI use `get_accepted_friend_profiles`, not unrestricted
`profiles` rows. The owner can still read their own full profile through RLS. The reward
collection screen can use authenticated delivery/reward data, and the collection inventory
screen now reads `inventory_items` for the current profile through the existing owner RLS
policy. Caixa Postal, delivery history, equipment management, and inventory writes outside
reward collection remain future milestones.

Regional postal traffic uses the authenticated `get_nearby_postal_traffic` RPC. The function
reads complete active-delivery coordinates behind RLS, expands the supplied viewport by 25%,
excludes the caller and blocked relationships, and returns at most 10 results ordered from the
camera center. Its response contains deterministic quarter-degree route geometry and regional
labels; exact endpoints, addresses, city labels, and non-friend owner identity never leave the
database. The browser interpolates these public snapshots between five-minute refreshes.

## Official asset registry

`official_assets` provides stable typed identities for gameplay and illustrated UI art.
`official_asset_versions` stores immutable version metadata, active-only public reads, packaged
paths today, and mutually exclusive Storage locations for the future administrative studio.
Browser roles cannot mutate the registry, and activation remains migration-only until
Milestone 46.

## Clean account foundation

`supabase/seed.sql` contains only official catalog records. Player-owned state and Auth users are
removed using the explicit runbook in `docs/player-data-reset.md`; the operation is not a migration
or deploy hook. Remote execution requires an exact allowlist, reviewed counts, a mandatory backup,
a typed token, and an append-only audit row.

## Out Of Scope

This milestone does not include:

- production auth;
- automatic remote project selection or destructive reset during deploy;
- Edge Functions;
- Storage buckets for real assets;
- additional map persistence beyond route discoveries and regional traffic;
- Loja;
- trading;
- chat;
- payments;
- push notifications.

## Verification

The local schema should be reproducible with:

```sh
supabase start
supabase db reset
supabase gen types typescript --local > src/integrations/supabase/database.types.ts
```

The generated database types live in `src/integrations/supabase/database.types.ts`.
