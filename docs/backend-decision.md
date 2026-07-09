# Backend Decision

This document records the Milestone 16 backend decision for DUIF.

## Decision

DUIF is ready for a minimal backend foundation, but not for a full backend product build.

The current prototype validates enough of the core loop to justify replacing the most important mock-only state with persistent data:

1. View a mascot.
2. Choose a friend.
3. Send correspondence.
4. Track travel progress.
5. Collect rewards.
6. See inventory and social context.

The next backend milestone should start with Supabase, focused on schema, local development, generated types, and persistence boundaries. It should not introduce production auth flows, payments, shop systems, map providers, chat, trading, moderation, or a complex economy yet.

## Prototype Review

### Mascot Detail

The mascot detail screen is strong enough to become the primary authenticated landing experience.

What works:

- the three starter mascots have distinct identities;
- attributes, skills, equipment, and active delivery status are visible;
- the page works as the player's home/nest;
- route preview makes travel understandable without a real map.

Backend implication:

- mascots should persist early;
- equipment and current delivery need stable ownership relationships;
- visual asset paths should remain optional because real art is still incomplete.

### Send Flow

The send flow is understandable as a prototype.

What works:

- the player chooses a friend, mascot, and correspondence type;
- distance and estimated duration are calculated before confirmation;
- confirmation creates a local delivery with route preview.

Backend implication:

- delivery creation is the first real server action worth modeling;
- delivery timestamps should be server-generated or validated later;
- correspondence options can remain static data at first.

### Travel And Waiting

Travel progress is clear enough for backend persistence.

What works:

- progress, status, and remaining time are derived from stored timestamps;
- calculations are pure and already tested;
- the UI does not require real-time server movement.

Backend implication:

- store coordinates, speed, timestamps, status, and reward seed;
- calculate display progress on the client from persisted timestamps;
- server-side validation can be added later for reward collection.

### Rewards

Rewards are useful enough to persist, but not ready for economy balancing.

What works:

- returned deliveries can produce deterministic XP and item rewards;
- reward collection closes the current loop;
- inventory gives collected items a place to live.

Backend implication:

- completed deliveries and collected rewards should persist;
- reward generation can start deterministic and simple;
- final anti-cheat, rarity balancing, and economy controls should wait.

### Inventory

Inventory supports the collection fantasy, but should stay simple.

What works:

- categories, rarity, equipped state, and empty slots are understandable;
- item cards support future thumbnails and fallback assets;
- the album reinforces return motivation.

Backend implication:

- inventory items should persist after rewards;
- equip/unequip can wait until customization becomes interactive;
- shop and trading should remain out of scope.

### Friends

Friends make the send loop feel more natural, but the social system is still lightweight.

What works:

- friend profiles provide destinations and context;
- friend mascot previews help the world feel social;
- direct entry into send flow from a friend profile is useful.

Backend implication:

- friends can start as simple relationships between profiles;
- received correspondence can be modeled after core delivery persistence;
- friend requests, discovery, chat, blocking, and moderation should wait.

## Persistence Candidates

The first backend pass should persist only the data needed for the core loop.

### First Wave

- Player profile: id, display name, home base, created timestamp.
- Player mascots: ownership, level, XP, attributes, appearance, equipment references.
- Friends: simple player-to-player relationship or seeded contacts for local development.
- Deliveries: sender, receiver, mascot, origin, destination, timestamps, status, speed, reward seed.
- Rewards: delivery reward result, XP gained, item reference, collection timestamp.
- Inventory: owned item, category, rarity, source, equipped flag.

### Static Or Seeded Data

- Starter mascot templates.
- Correspondence options.
- Equipment definitions.
- Reward item definitions.
- Initial friend/contact data for local development.

### Later Data

- Map discoveries.
- Shop catalog.
- Currency balances.
- Purchase history.
- Trading.
- Chat.
- Notifications.
- Seasonal event state.

## Backend Options

### Recommended: Supabase

Supabase is the recommended next backend path.

Reasons:

- fastest path to Auth, PostgreSQL, Storage, and Row Level Security;
- good fit for a mobile-first PWA prototype;
- local development can be added incrementally;
- schema and generated types can align with existing TypeScript game types;
- Edge Functions can later handle delivery creation and reward collection validation.

Initial Supabase scope:

- local Supabase project setup;
- minimal schema for profiles, mascots, friendships, deliveries, rewards, and inventory;
- seed data for the current prototype entities;
- generated database types;
- no production deployment requirement yet.

### Alternative: Custom Node Backend

A custom Node/PostgreSQL backend is not recommended for the immediate next step.

It may become useful later if DUIF needs:

- complex economy services;
- advanced anti-cheat;
- queues or workers;
- custom moderation pipelines;
- high-control social graph logic;
- game server orchestration beyond simple persistence.

For now, those needs are speculative.

## Risks Of Starting Backend Too Early

- Locking the schema before the loop is fully tuned.
- Spending time on auth and permissions before the play experience is proven.
- Building shop, map, trading, or chat infrastructure too soon.
- Adding server complexity around systems that are still mock-level.
- Treating rewards as a finished economy before balance exists.

Mitigation:

- keep the next milestone as backend foundation only;
- model only the current loop;
- keep static definitions seeded or local until balance is clearer;
- avoid production auth polish and remote deployment in the first backend step.

## Out Of Scope For The First Backend

- Real map screen or map tile provider.
- Shop, payments, currency, or paid cosmetics.
- Trading or marketplace.
- Real-time chat.
- Public feed.
- Push notifications.
- Advanced anti-cheat.
- Production moderation tooling.
- Offline gameplay persistence.
- Native app work.

## Recommended Next Milestone

Milestone 17 should be:

Supabase Foundation And Data Model

The milestone should add local Supabase setup, a minimal schema, seed data, generated TypeScript database types, and documentation. It should not wire the full UI to the backend yet unless the foundation is already stable.

Success criteria for Milestone 17:

- local Supabase can start;
- migrations apply cleanly;
- seed data represents the current prototype loop;
- database types can be generated;
- RLS strategy is documented, even if policies start minimal;
- existing mock UI continues to build and test.
