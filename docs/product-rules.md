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
- The current prototype represents these regions as small mocked reward points with an
  eligibility radius in kilometers around the straight route.
- Discovery during the trip is based on outbound route progress: a reward can appear as
  discovered once the pet has passed that point on the outbound leg.
- The player may see discoveries during the journey.
- The final reward collection remains tied to the pet returning home.
- The backend should be authoritative for which map rewards are granted.

Nearby pets:

- The map should explore showing other pets passing near the player's active pet.
- This may become part of the default map experience if it makes the world feel alive
  without creating noisy real-time social pressure.
- Nearby pets should be treated as postal traffic, not as a real-time chat or MMO layer.
- The first prototype uses mixed safe visibility: friends can show friend and mascot names,
  while non-friends appear as anonymous traveling pets.
- The client should not receive exact private addresses or precise personal location data
  for other players.
- The backend should decide which pets are eligible to appear based on privacy, friendship,
  visibility rules, viewport/route proximity, and current active deliveries.
- The frontend can animate visible pets from route snapshots, timestamps, and speed instead
  of receiving live position updates every second.

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
- Convert on duplicate: repeat drops convert into fragments, soft currency, or upgrade
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
- soft currency;
- route discoveries;
- event collectibles.

Open design question:

- Exact reward formula and rarity tables are not defined yet.

## Shop and Monetization Rules

The shop may eventually include cosmetics, social content, optional boosts, fuel, and two
currencies. Their final player-facing names are intentionally undecided.

Currency boundaries:

- Free currency is earned from deliveries, route rewards, collection progress, and events.
- Premium currency may eventually be purchased, but is restricted to visual expression
  and social content.
- Premium currency may buy cosmetics, stickers, postcards, and profile or equipment
  decoration.
- Premium currency cannot directly buy mascot or player XP, attributes, route rewards,
  cargo capacity, required travel-time reductions, or exclusive gameplay access.
- Premium currency cannot be converted into free currency or transferred between players.
- Earning curves, prices, currency names, purchase limits, and regional pricing remain
  deferred until balance and payment milestones.

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
  premium-to-free currency conversion.
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
- final currency names, earning curves, prices, and purchase limits;
- fuel capacity, recharge rates, boost strength, and acquisition rates;
- cargo units and item weights;
- duplicate conversion rates, quantities, and overflow rewards;
- moderation implementation and operations for user-written letters and future photo
  postcards;
- final map tile provider and map visual art direction.
