# Product Rules

This document records product decisions for DUIF after the first playable backend loop.

It should be treated as the source of truth for gameplay, privacy, social behavior, map
mechanics, rewards, inventory, and monetization direction until a more formal game design
document exists.

## Product Pillar: Slow Social

DUIF is a slow social game.

Social interaction should happen through intentional asynchronous correspondence, not
through real-time chat or a noisy public feed.

Rules:

- Players send letters, postcards, stickers, and gifts through their messenger pets.
- The travel time is part of the social experience.
- The recipient receives the correspondence when the pet reaches the destination.
- The sender follows the trip and collects travel rewards when the pet returns.
- Real-time chat is out of scope for v1.
- The correspondence history replaces a continuous chat thread.
- Notifications should feel postal and punctual, not like instant-message pressure.

Design implication:

> DUIF is a game of friendship by correspondence, meaningful waiting, and small surprises
> found during the journey.

## Travel Rules

Travel uses real elapsed time.

Rules:

- Trips should last real hours or days.
- There is no global accelerated game-speed multiplier as the default product rule.
- Every delivery has a full cycle: outbound trip, delivery at destination, return trip.
- A pet always returns to its origin after delivering.
- Rewards are only finalized into the player's inventory after the pet returns and the
  player collects them.
- A returned delivery remains current, keeps its cargo summary visible, and continues locking
  the mascot until collection.
- Collection completes and archives the delivery. It leaves the mascot's current-delivery slot
  but remains available to delivery-history consumers.
- After collection, the map becomes an idle nest view: the player's traveling mascot, route,
  destination, discoveries, and return summary disappear. Regional postal traffic remains visible
  around the camera; only the nest camera remains available for the player's journey;
  route overview, mascot, and destination camera actions are disabled.
- The frontend may animate progress in real time from timestamps, route, and speed.
- The backend remains the authority for route, timestamps, effective speed, and granted
  rewards.

Equipment changes:

- Pets can change equipment only when they are not in an active delivery.
- Equipment is locked while a pet is preparing, outbound, delivered at destination,
  returning, or waiting for uncollected reward.
- A delivery stores a snapshot of the effective speed/rules calculated at send time.
- Changing equipment later affects only future deliveries.

Boosts:

- Speed boosts should come from items or equipment, not a global time multiplier.
- Example: a jet backpack with a limited autonomy in kilometers.
- Fuel and recharge apply only to optional boost equipment.
- Normal deliveries never consume fuel and the send-travel-return-collect loop remains
  available without a boost.
- Boosts may shorten travel time, but they must not unlock routes, rewards, or social
  content that free players cannot reach.
- Fuel capacity, recharge rates, boost strength, and acquisition rates remain balancing
  decisions for a later milestone.

## Account Onboarding Rules

- A confirmed account must complete the persisted onboarding journey before normal gameplay.
- Introductory steps cannot be skipped as a group. Players may review accepted explanations, but
  going back never regresses authoritative progress.
- The public player display name is literal, unique without regard to letter case, locale-independent, normalized to NFC,
  and limited to 2–24 characters after whitespace normalization.
- Onboarding progress exists independently from `profiles`; no profile, nest, mascot, delivery,
  or inventory item is created during the introductory shell.
- Profile and initial mascot creation must remain one authoritative, idempotent operation in the
  mascot-choice stage.

## Real-Time Map Rules

The map is a core mechanic, not just a route visualization.

Rules:

- The player should be able to follow a pet moving on the map in real time.
- The pet position can be computed client-side from route, speed, timestamps, and current time.
- Routes can be straight lines in v1.
- The map should be interactive and visually customized for DUIF.
- The map should show origin, destination, outbound/return direction, pet position, and
  discovered route rewards.
- The map should eventually show cities, states, countries, event areas, and route discovery
  opportunities.

Route rewards:

- Rewards can be distributed by city, state, country, route segment, or event area.
- If a pet crosses an eligible region, the delivery can collect badges, postcards, stamps,
  souvenirs, materials, or seasonal items.
- Seeded reward points represent eligible regions with a corridor radius in kilometers around
  the route. New authenticated deliveries persist their deterministic discoveries; local
  fixtures remain only for mock mode and legacy deliveries.
- Discovery during the trip is based on outbound route progress: a reward can appear as
  discovered once the pet has passed that point on the outbound leg.
- The player may see discoveries during the journey.
- The final reward collection remains tied to the pet returning home.
- The backend is authoritative for which map rewards are materialized and granted.

Nearby pets:

- The map shows sanitized postal traffic near the currently queried camera region.
- Postal traffic is part of the default map experience while remaining visually secondary to
  the player's selected route.
- Nearby pets should be treated as postal traffic, not as a real-time chat or MMO layer.
- Mascot identity is public in the interactive prototype: name, species, official portrait,
  integer trip progress, and state/province plus country at each route end may be shown.
- Player identity remains private for non-friends. Friends may show the known owner's name and
  link to an already accessible friend profile; public non-friend mascots expose neither.
- Visibility is selected authoritatively from the camera viewport plus a 25% margin and limited
  to the 10 closest results. The viewport is sampled on entry and every five minutes, not on
  every pan or zoom.
- The backend may use complete private coordinates for eligibility and ordering. The client only
  receives deterministic regionalized route endpoints and positions calculated on that same
  public geometry, never exact private addresses or residential endpoints.
- The backend decides which pets are eligible to appear based on privacy, friendship,
  visibility rules, viewport proximity, and current active deliveries.
- Returned or completed traffic disappears from the map. A delivery without a valid scheduled
  return must not remain indefinitely at its destination.
- The frontend can animate visible pets from route snapshots, timestamps, and speed instead
  of receiving live position updates every second.
- Leaving the visible range removes the mascot from the map and list. An already open detail
  panel may retain only the last public snapshot and must label it as out of range.

Technical direction:

- Validate the real map stack early with MapLibre GL JS.
- Use a real map spike before deeper inventory/shop implementation.
- Production tile provider, custom tiles, and final map art direction are separate decisions.

## Correspondence Rules

Correspondence is the main social interaction.

Letters:

- Written by the player.
- Have a character limit. The current prototype uses 500 characters.
- May contain emojis.
- May include stickers purchased or earned in the shop.
- Should feel personal and expressive.

Postcards:

- Can be app-sold cards based on cities, events, routes, or collections.
- User-uploaded photo postcards are excluded from the first commercial shop prototype.
- May include a short written message on the back. The current prototype uses 180
  characters.
- A future photo-postcard release requires explicit sender consent, reporting, blocking,
  content removal, and a moderation process before uploads can go live.

Stickers:

- Can be sold in the shop.
- Can be sent as standalone correspondence.
- Can be attached to letters/postcards if the later composition rules allow it.
- The current prototype uses mock sticker ids and does not consume inventory.

Gifts:

- The first gift scope is limited to transferable stickers, postcards, and simple cosmetics.
- Gifts require an accepted friendship and an identified sender.
- Gifts cannot contain currency, fuel, materials, functional equipment, account-bound
  premium items, or randomized surprise bundles.
- Paid loot boxes and paid randomized gifts are not allowed.
- The current prototype persists only an optional note for small gifts.

Reward impact:

- Correspondence type may eventually affect rewards, but reward formulas are not final.
- v1 should avoid locking a complex reward economy too early.

## Social and Friends Rules

Friends are real users connected by invite or code.

Rules:

- A player can invite another player by code or link.
- The invite only allows a friendship request.
- The invite does not reveal location details.
- Sending correspondence requires an accepted friendship.
- Users who are not accepted friends cannot send to each other.
- The recipient sees visible received content based on what was sent: letter, postcard,
  sticker, gift, or future correspondence type.

Friend location visibility:

- Accepted friends may see only city, state, and country.
- Street and neighborhood are never shown to other players.
- Non-friends should not see useful location data.
- Sending uses sanitized postal-base data, not a real residential address.

## Postal Base and Privacy Rules

DUIF should use the term "postal base" instead of "home address" in product UI.

Allowed postal-base fields:

- street;
- neighborhood;
- city;
- state;
- country.

Privacy rules:

- Street and neighborhood are private reference data.
- Friends see only city, state, and country.
- Do not collect or display house number, complement, precise postal code, or exact
  residential coordinates.
- The game should never expose a user's real full address.
- Route display should use sanitized labels such as "Sao Paulo, SP, Brazil".
- Coordinates used for calculation should be approximate and derived from city/region/base,
  not precise residence.

Backend implications:

- Direct social reads of profile location must be sanitized.
- RLS or RPCs should allow:
  - the current user to read their own full postal-base data;
  - accepted friends to read only city/state/country;
  - secure server-side functions to access private fields only for calculation.
- UI should avoid rendering raw private location fields.

## Mascot Progression Rules

Each new account chooses exactly one active starter archetype. The archetype defines the initial
species, portrait, attributes, trait, skills, appearance, and equipment snapshot. The naming field
starts empty so historical archetype suggestions do not bias players toward repeated names. The
player must confirm a literal mascot name, which remains unchanged when the interface language
changes. Retrying provisioning cannot grant a second starter mascot.

Mascots level up by completing deliveries.

Rules:

- Mascot XP comes primarily from kilometers traveled.
- Because every delivery includes outbound and return, XP should consider total distance
  traveled: `distanceKm * 2`.
- Delivery type may later apply modifiers.
- Player XP and mascot XP both exist, but their formulas can differ.
- Mascot XP represents travel practice and route experience.
- Player XP represents overall account progression.
- There is no consumable stamina/energy system.

Stamina:

- Stamina is a passive attribute, not an energy meter.
- It may help long routes, cargo penalties, return consistency, or boost efficiency.

### Mascot Mechanical Identity

Choosing a mascot should change how a delivery behaves, without creating a mandatory best
mascot or making route content inaccessible to players who choose another companion.

Attribute direction:

- Speed and stamina determine the base speed using the provisional formula
  `28 + speed * 4 + stamina * 2` kilometers per hour.
- A route becomes long at `500 km`. Long routes add `10%` to return duration before
  mitigation.
- Orientation expands the effective route-discovery corridor by `1%` per point.
- Luck adds `2%` per point to a deterministic rarity-weight multiplier; it never guarantees
  a rare reward.
- Attribute and skill bonuses must use explicit caps so later progression cannot create
  unbounded speed, discovery, or rarity advantages.

Starter mascot identities:

- Nuvem is the safe long-route specialist. `Rota Segura` mitigates half of the long-route
  penalty, while the current level of `Rota Longa` mitigates the remainder.
- Trovão is the direct-flight specialist. `Voo Direto` increases effective return speed by
  `10%`, without moving outbound discovery thresholds.
- Pipoca is the exploration specialist. `Achador Curioso` adds `15` percentage points to
  the route-discovery corridor.

Skill direction:

- `Rota Longa` mitigates `25%` of the long-route penalty per level, capped at `50%`.
- `Pouso Suave` favors safe completion or later duplicate-preservation rules.
- `Despacho Rápido` reduces the base `30` minute preparation by `5%` per level, capped at
  `20%`.
- `Instinto de Vento Cruzado` expands discovery reach by `2%` per level.
- `Coisa Brilhante` adds `3%` of rarity weight per level.
- `Desvio Feliz` expands discovery reach by `3%` per level and reduces effective travel
  speed by `2%` per level.
- Skill level scales an existing effect; it should not introduce hidden unrelated bonuses.

Determinism and authority:

- Mascot, attribute, trait, skill, equipment, and route modifiers are resolved when the
  delivery is created.
- A delivery stores an immutable snapshot of its effective travel modifiers.
- Changing a mascot or equipment after dispatch affects only future deliveries.
- Random-looking reward outcomes use a stable delivery seed so reopening the app cannot
  reroll discoveries.
- The client may preview modifier effects, but the backend becomes authoritative when route
  discoveries are persisted.
- Paid cosmetics and Crystals never improve these modifiers.

Initial implementation boundary:

- Discovery-radius and rarity multipliers are capped at `1.30`; outbound speed is bounded
  between `0.85` and `1.15`, and return speed between `0.75` and `1.25`.
- The rarity multiplier is snapshotted now but only becomes authoritative input for reward
  selection when persisted route discoveries are introduced.
- `Pouso Suave`, duplicate preservation, cargo effects, and equipment synergies remain
  deferred because no safe-completion or cargo mechanic consumes them yet.
- These coefficients are provisional balancing values. Changing them affects only future
  deliveries because every dispatched delivery stores a versioned immutable snapshot.
- Legacy deliveries without a snapshot preserve their stored timestamps and use neutral
  discovery and rarity multipliers.

Possible level unlocks:

- functional equipment slots;
- cosmetic slots;
- cargo capacity;
- boost efficiency;
- longer routes;
- route discovery chance;
- attribute increases;
- visual titles or mascot appearance upgrades.

Open balancing question:

- Exact XP curve and per-level stat growth are not defined yet.

## Equipment, Cosmetics, and Cargo Rules

Equipment can be functional, cosmetic, or a functional item with cosmetic customization.

Functional equipment:

- Can affect attributes or travel rules.
- Examples: jet backpack, cargo bag, compass, route goggles.
- May affect speed, cargo capacity, route discovery, fuel usage, or reward odds.

Cosmetics:

- Change appearance only.
- Can be applied to pets or equipment.
- Should not affect gameplay stats.

Cargo:

- There is no hard general inventory limit in v1.
- The important limit is pet cargo capacity during a delivery.
- Cargo capacity depends on pet attributes, level, equipment, boosts, and item category.
- Cosmetics do not consume cargo.
- Materials and fuel may stack.
- Items found during travel belong to delivery/cargo state until the pet returns and the
  player collects them.

Open balancing question:

- Exact cargo units, item weights, and equipment slot counts are not defined yet.

## Inventory and Album Rules

Inventory, collection, album, and mailbox are related but not identical.

Definitions:

- Inventory is the player's owned item storage.
- Collection is the player-facing area for discovered travel rewards and collectible
  progress.
- Mailbox, or "Caixa Postal" in pt-BR UI, is the received-correspondence inventory:
  letters, postcards, stickers, gifts, and visible received items from friends.
- Album is a visual metaphor inside collection for pages, empty slots, rarity, and
  completion progress. It is not the whole inventory system.
- Cargo is the pet's delivery-specific carrying limit.

Rules:

- Received correspondence should use the product metaphor "Caixa Postal" instead of a
  generic inventory label.
- The current bottom-nav entry should use "Coleção" for discovered items, not "Caixa
  Postal", until a dedicated received-correspondence mailbox exists.
- The mailbox is part of owned content, but it is not the same thing as the collection.
- The album can remain a UI metaphor inside collection, but avoid using "album categories"
  as visible copy; use filter language such as "Filtrar coleção" for category controls.
- Functional items, consumables, cosmetics, postcards, stickers, rewards, and materials may
  all live in inventory.
- Collection should highlight progress and discoveries.

Duplicate item policies:

- Unique: one copy only.
- Stackable: repeated items increase quantity.
- Duplicate allowed: multiple copies can exist, possibly with different stats.
- Convert on duplicate: repeat drops convert into fragments, Stamps, or upgrade
  progress.

Category defaults:

- fuel and materials are stackable;
- equipment with stats allows separate copies because instances may later have different
  stats or upgrade state;
- simple cosmetics are unique, and the shop must prevent purchasing a second owned copy;
- duplicate postcards, badges, and collection stamps convert into collection progress;
- duplicate conversion rates, quantities, and any overflow reward remain balancing
  decisions for a later milestone.

## Reward Rules

Rewards should motivate travel, collection, map exploration, and mascot progression.

Confirmed factors:

- distance;
- rarity;
- mascot attributes;
- friend/social context;
- luck;
- route/city/state/country crossed;
- future equipment and event modifiers.

Possible reward types:

- mascot XP;
- player XP;
- badges;
- postcards;
- stamps;
- stickers;
- souvenirs;
- cosmetics;
- equipment;
- fuel;
- materials;
- currency Stamps;
- route discoveries;
- event collectibles.

Open design question:

- Exact reward formula and rarity tables are not defined yet.

### Authoritative route discoveries

For deliveries created with route-discovery version `1`, route cargo is decided once by the
backend when the delivery is created:

- every active catalog point inside `eligibility radius × mascot discovery multiplier` is
  materialized; there is no random draw that can remove an eligible point;
- the backend stores the point's projected outbound progress and distance from the route, while
  the client only decides when that stored discovery becomes visible;
- rarity potential remains in the mascot snapshot but does not change the six fixed regional
  items yet;
- route discoveries are carried during travel and enter inventory only through the atomic return
  collection;
- only the sender, who owns the traveling mascot, may collect the primary reward and route cargo;
  the recipient may view the shared delivery and its discoveries;
- repeated collection returns the same inventory records and never duplicates cargo;
- route stamps are collectible inventory items and remain distinct from the spendable common
  currency named Stamps.

Deliveries created before this version keep `route_discovery_version = null`. They receive no
backfill and continue using the local visual fallback, preserving their historical outcome.

## Shop and Monetization Rules

The shop may eventually include cosmetics, social content, optional boosts, fuel, and two
currencies: **Stamps** as the common currency and **Crystals** as the premium currency.

Currency boundaries:

- Stamps are earned from deliveries, route rewards, collection progress, and events.
- Currency Stamps are standardized balance tokens. They are not the collectible route and
  album stamps stored as inventory items.
- Crystals may eventually be purchased, but are restricted to visual expression
  and social content.
- Crystals may buy cosmetics, stickers, postcards, and profile or equipment
  decoration.
- Crystals cannot directly buy mascot or player XP, attributes, route rewards,
  cargo capacity, required travel-time reductions, or exclusive gameplay access.
- Crystals cannot be converted into Stamps or transferred between players.
- Earning curves, prices, purchase limits, and regional pricing remain deferred until
  balance and payment milestones.

Initial catalog categories:

- cosmetic equipment;
- equipment cosmetics;
- stickers;
- postcards;
- city/event cards;
- profile and equipment decorations.

Later free-economy categories may include optional boosts, fuel, and materials after their
balance rules exist. They are not part of the first commercial shop prototype.

Paid-economy guardrails:

- The complete send-travel-return-collect loop is free and never requires a purchase.
- Paid items customize or expand expression; paid gameplay power is not allowed.
- Do not sell XP, attributes, route discoveries, cargo capacity, exclusive functional
  equipment, or access to friends and destinations.
- Do not add paid loot boxes, randomized paid rewards, anonymous gifts, player trading, or
  Crystal-to-Stamp conversion.
- Account-bound premium items cannot be gifted.
- No purchase, balance, entitlement, or consumption behavior should be implied before a
  backend-authoritative ledger and purchase-validation design exists.

First prototype boundary:

- The first shop prototype is a read-only mock catalog with category filters, fictional
  prices, and visual previews.
- It has no persisted balance, purchase action, inventory consumption, backend catalog,
  payment provider, or user-uploaded photo support.

## Open Product Questions

The following topics still need explicit product decisions before deep implementation:

- exact mascot XP curve;
- exact player XP formula;
- level unlock cadence;
- reward formulas and rarity tables;
- mascot modifier coefficients, caps, long-route thresholds, and skill-level curves;
- Stamp and Crystal earning curves, prices, and purchase limits;
- fuel capacity, recharge rates, boost strength, and acquisition rates;
- cargo units and item weights;
- duplicate conversion rates, quantities, and overflow rewards;
- moderation implementation and operations for user-written letters and future photo
  postcards;
- final map tile provider and map visual art direction.
