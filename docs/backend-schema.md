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

These match the current TypeScript game unions closely enough for future mapping work.

## Seed Data

`supabase/seed.sql` mirrors the current prototype data:

- current player profile: Abel in Sao Paulo, with private street/neighborhood seed data;
- friend profiles: Lia, Caio, and Mina, with private street/neighborhood seed data and
  public city/state/country fields;
- starter mascots: Nuvem, Trovao, and Pipoca;
- friend mascot previews: Aurora, Brisa, Tico, Atlas, and Luma;
- correspondence options: letter, postcard, sticker, and small gift;
- Nuvem's Lisbon delivery with a seeded letter content row;
- reward item definitions;
- current inventory album items.

Seeds use fixed UUIDs and `mock_key` values so the frontend mocks can be mapped to database rows later without guessing.

## Data Shape Decisions

Some nested game data is stored as `jsonb` in this first pass:

- mascot attributes;
- trait;
- equipment;
- skills;
- appearance.

This keeps the schema close to the current prototype and avoids premature normalization. These fields can be split into dedicated tables later when customization, equipping, balance, or inventory rules become interactive.

Translation keys and asset paths are stored as `text`. The database stores identifiers, not translated display copy.

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

- `profiles`;
- `player_mascots`;
- `friendships`;
- `deliveries`;
- `delivery_rewards`;
- `delivery_route_discoveries`;
- `inventory_items`.

The first policies are read-focused and tied to `profiles.auth_user_id = auth.uid()`.
Seeded rows start without an auth user, then the local auth foundation can claim the
current player profile through the `claim_current_profile` RPC.

Static definition tables are not RLS-gated in this first pass:

- `mascot_templates`;
- `correspondence_options`;
- `reward_items`.

The first frontend Supabase read layer uses only these public catalog tables. Player-owned
tables stay protected until DUIF adds auth or a server-side read boundary.

## Auth Foundation

DUIF uses Supabase Auth with email/password for local development. The `/auth` route
creates or signs in a local user, then calls `claim_current_profile`.

`claim_current_profile` is a `security definer` RPC that:

- requires `auth.uid()`;
- attaches `profiles.mock_key = 'player-current'` to the current auth user if the profile is unclaimed;
- returns the profile when it already belongs to the current auth user;
- rejects attempts to claim a profile already linked to another user.

This is a prototype bridge for RLS, not final onboarding. It does not create public
profiles, password reset, OAuth providers, or production auth polish.

## Frontend Read Layer

The app can optionally read public catalog data from Supabase by copying `.env.example`
to `.env.local` and setting:

```sh
VITE_SUPABASE_URL=http://127.0.0.1:56321
VITE_SUPABASE_ANON_KEY=<local anon key from supabase status>
VITE_DUIF_DATA_SOURCE=supabase
```

By default `VITE_DUIF_DATA_SOURCE=mock`, so the app keeps using local mocks. If the
Supabase URL/key are missing, the local server is stopped, or catalog rows are not
available, the UI falls back to mocks.

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

## Out Of Scope

This milestone does not include:

- production auth;
- remote Supabase project linking;
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
