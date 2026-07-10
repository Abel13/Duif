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

- `profiles`: player or friend profile, display name, home coordinates, and optional future auth user link.
- `mascot_templates`: static starter mascot definitions.
- `player_mascots`: owned mascot state copied from templates for a profile.
- `friendships`: simple profile-to-profile relationship with friendship level and exchange count.

### Delivery Loop

- `correspondence_options`: static sendable correspondence types.
- `deliveries`: sender, receiver, mascot, coordinates, timestamps, status, speed, and reward seed.
- `reward_items`: static reward item definitions.
- `delivery_rewards`: reward generated for a delivery, including XP and collection state.
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

- current player profile: Abel in Sao Paulo;
- friend profiles: Lia, Caio, and Mina;
- starter mascots: Nuvem, Trovao, and Pipoca;
- friend mascot previews: Aurora, Brisa, Tico, Atlas, and Luma;
- correspondence options: letter, postcard, sticker, and small gift;
- Nuvem's Lisbon delivery;
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

## RLS Strategy

RLS is enabled on player-owned or relationship-sensitive tables:

- `profiles`;
- `player_mascots`;
- `friendships`;
- `deliveries`;
- `delivery_rewards`;
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

Gameplay screens still do not read `player_mascots`, `deliveries`, `friendships`,
`delivery_rewards`, or `inventory_items` from the browser yet. Auth now makes those
reads possible in the next milestone, but this milestone keeps gameplay on mocks.

## Out Of Scope

This milestone does not include:

- production auth;
- remote Supabase project linking;
- Edge Functions;
- Storage buckets for real assets;
- Mapa;
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
