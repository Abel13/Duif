# Regras do produto

This document records product decisions for DUIF after the first playable backend loop.

For the authoritative item taxonomy, consumption, ownership, acquisition, and transfer rules, see
[itens e economia](./items-and-economy.md).

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
  destination, discoveries, and return summary disappear. Eligible local mascot encounters may
  remain visible only in relation to the player's nest or current mascot; only the nest camera
  remains available for the player's journey;
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

- Speed boosts come from explicit items, equipment, skills, or versioned tutorial rules, never a
  hidden global time multiplier.
- `Lanche Revigorante` is a future pre-dispatch consumable. It occupies no travel slot because it
  is consumed at confirmed departure; one may affect the complete outbound/return cycle.
- A found snack remains a pending route reward and enters inventory only through final collection.
- The tutorial's First Journey Boost is separate: automatic, tutorial-only, never inventory, and
  never reusable even when its acceleration visual language resembles the snack.
- Normal deliveries remain available without a boost. Boosts shorten time but never unlock
  otherwise inaccessible routes, rewards, or social content.
- Approved initial snack values are `+5%` for the common version and `+10%` for the improved
  version, always within the global effective-speed cap; acquisition rates and Seed prices remain
  unresolved in the [active roadmap](./roadmap.md).

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

Local mascot encounters:

- The shipped regional-viewport traffic model is planned for replacement. It must not become a
  way to browse mascots flying anywhere in the world.
- Another player's mascot may be eligible only in relation to an authorized local anchor: the
  viewing player's **currently selected** nest or a specific owned mascot. Panning, zooming, or
  searching another region never changes that authorization boundary. When the selected mascot is
  traveling far from the nest, eligibility uses that mascot's authoritative position; when the nest
  is selected, eligibility uses the nest.
- The backend resolves eligibility around the selected anchor from private geometry. The client
  receives only the minimum sanitized encounter data and never a global delivery set, exact nest,
  precise distance, private endpoint, or reusable live trail.
- Default encounter radius is 1000 km. The authoritative radius is backend-configured and editable
  from the administrative panel; the client must not hardcode the only source of truth.
- Encounter eligibility refresh cadence is 5 minutes. Switching selection rapidly must reuse a
  still-valid per-anchor cache and must not force a full re-query when that cache remains fresh.
- Each selection returns at most 5 sanitized encounter results.
- Encounter visibility starts enabled and can be disabled in profile privacy settings. A player
  who opts out does not appear through local discovery.
- A local mascot can open a deliberately small public profile and friendship-request action under
  the reporting, blocking, cooldown, and surprise rules planned in the [roadmap](./roadmap.md).
- Accepted friendship does not authorize advance tracking of an incoming surprise delivery. The
  approaching mascot and sender remain hidden from the recipient until correspondence is opened.

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

- Every account can use the permanent base postcard. The inaugural postcard is available after its
  tutorial inventory reward is collected.
- City postcards remain catalog-backed but their city list and artwork belong to a later dedicated
  art plan; the current catalog does not fabricate city art.
- Permanent city/event cards and finite paid-art copies are different ownership modes. Sending a
  permanent unlocked card never decrements it; sending a paid-art card consumes one granted copy.
- Every Lugar Memorável has one paired official postcard. The first eligible passage that
  unlocks the place also unlocks that permanent postcard for the mascot owner's profile,
  idempotently. It can be sent without being consumed.
- User-uploaded photo postcards are excluded from the first commercial shop prototype.
- May include a short written message on the back. The current prototype uses 180
  characters.
- A future photo-postcard release requires explicit sender consent, reporting, blocking,
  content removal, and a moderation process before uploads can go live.

Stickers:

- One to three owned copies may be sent as sticker correspondence, including repeated copies of the
  same design when quantity permits.
- Dispatch atomically removes the sender's copies. They remain in delivery escrow and are added to
  the recipient's balance only after outbound arrival.
- Sticker copies do not add travel slots beyond the one slot used by the sticker correspondence.
- Attaching stickers to letters/postcards remains a later composition extension.

Return correspondence:

- One correspondence uses one natural travel slot in the implemented baseline.
- Outbound content is unloaded at arrival. The recipient may confirm one return letter while the
  mascot prepares, using one newly freed slot.
- Return rest lasts at least 30 minutes and at most 60 minutes. A reply confirmed before minute 30
  departs at minute 30; from minutes 30–60 it departs immediately; without a reply it departs at
  minute 60.
- Confirmation is definitive and idempotent. The returning letter remains hidden from the original
  sender until the mascot arrives and the correspondence is opened.

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

 Friends are real users connected by a postal code. Referral invitations are a separate,
 opt-in acquisition mechanism and never create friendship automatically.

Rules:

- A postal code only allows a friendship request.
- The invite does not reveal location details.
- Sending correspondence requires an accepted friendship.
- Users who are not accepted friends cannot send to each other.

### Postal friendship codes

- Each player has one private, regenerable Postal Friend Code used to request friendship.
- A valid code creates a pending request; only its recipient can accept or decline it.
- Pending requests show only the sender nickname. City and nest data become available only after
  acceptance through existing sanitized friend contracts.
- Codes are not authentication credentials and never appear in public profiles, traffic, or
  player-search results.
- The recipient sees visible received content based on what was sent: letter, postcard,
  sticker, gift, or future correspondence type.

### Traceable invitations

- An invitation link is signed, regenerable, and records at most one inviter for a newly created
  account; it is not a login credential or a friendship request.
- A referral qualifies only after email confirmation and completed onboarding. Clicks, duplicate
  accounts, incomplete registrations, self-referrals, and an already-attributed account do not
  count.
- The backend owns attribution, rate limits, qualification, counting, and the immutable audit
  record. The inviter sees aggregate progress only, never invitee email or private location data.
- Five distinct qualified referrals grant one account-bound mascot, **Lume the Owl**, exactly once.
  It is a non-starter night-route specialist and cannot be traded, sold, or duplicated by retries.
- Invitation links remain valid until regenerated. An accepted invitation is retained for seven
  days, and an attribution frozen during signup is not changed by later regeneration.
- Qualification requires confirmed email and collection of the first tutorial route. Ordinary
  account deletion preserves anonymized qualified progress; only an audited admin fraud
  invalidation removes it. A Lume already collected is never revoked.

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

### Mandatory first route

- The first owned mascot must complete the persisted 5-minute tutorial before a real nest can be
  configured or normal gameplay can open.
- Tutorial time is authoritative and continues while the application is closed; instructional
  cards do not pause travel.
- A versioned First Journey Boost shortens only the tutorial. It is not an item, cannot be reused,
  and never changes the mascot's normal attributes, skills, or delivery modifiers.
- Preparation, outbound travel, discovery, destination, return, arrival, and collection are
  acknowledged in order and cannot be skipped through generic onboarding actions.
- The tutorial grants exactly the Inaugural Postcard found at 50% of the outbound leg and the First
  Route Stamp after return. Neither item enters inventory before final collection.
- Tutorial coordinates are fixed public fiction and never derive from the player's location. The
  delivery is absent from social traffic and ordinary delivery history.

Each new account chooses exactly one active starter archetype. The archetype defines the initial
species, portrait, attributes, trait, skills, appearance, and equipment snapshot. The naming field
starts empty so historical archetype suggestions do not bias players toward repeated names. The
player must confirm a literal mascot name, which remains unchanged when the interface language
changes. Retrying provisioning cannot grant a second starter mascot.

Mascots level up by completing deliveries. The approved three-layer progression, formulas,
curves, skill-XP triggers, and economy guardrails are specified in [Progressão e XP](./progression.md).

Rules:

- Every mascot uses the same base XP formula. Species, archetype, traits, and skills must not
  grant a permanent multiplier to all earned XP.
- Mascot base XP uses the approved formula `15 + totalDistanceKm^0.8 × 6`, resolved once for
  the delivery and shared by every mascot. Total distance includes outbound and return
  (`distanceKm * 2`).
- Novelty rewards meaningful first-time route context, such as a first delivery to a destination;
  it belongs to the delivery and player history, not to a mascot species.
- Route bonuses are transparent, delivery-context bonuses. Correspondence type may later supply
  one, but it must not turn a species into the universally fastest way to level.
- Situational affinity may apply a small, explicit bonus only when its route condition is met,
  such as an urban, long-distance, night, or coastal route. It is never a permanent XP bonus and
  must remain capped conservatively.
- Affinity may instead affect travel style or reward discovery. This is preferred whenever the
  same identity can be expressed without changing XP.
- The player should choose a mascot for affection, visual identity, and travel style—not because
  one species farms XP more efficiently than every other choice.
- Reputação Postal, mascot XP, and skill XP are separate progressions with distinct sources.
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

Approved mascot identities for the planned skill redesign:

- Nuvem specializes in safety, load, and long/familiar routes.
- Trovão specializes in speed, dispatch, and direct flight.
- Pipoca specializes in exploration, a wider discovery corridor, and improved rarity weight.
- Lume is the referral-unlocked owl specializing in night travel.
- Every mascot has one non-leveling innate trait, two fixed skills, and one individual skill chosen
  at mascot level 5. Skills level only through contextual use, never manual or paid training.
- Pipoca improves the efficiency of collection but never owns species-exclusive discoveries;
  every discovery remains obtainable with any mascot.
- Complete skill names, individual choices, approved maxima, and contextual triggers are versioned
  in the backend and documented in [Progressão e XP](./progression.md).

Preparation snapshot compatibility:

- New ordinary deliveries use travel modifier version `2`, with a five-minute base preparation.
- Version `1` snapshots retain their materialized preparation and timestamps, including older
  thirty-minute deliveries. They are never recalculated after dispatch.
- The tutorial keeps its independent thirty-second preparation boost.

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

Modifier boundary:

- The future unified effective-speed result is clamped between `0.60` and `1.25` of base speed.
- Current version-2 delivery snapshots keep their historical outbound/return bounds and effects;
  they are not silently recalculated. Future rule changes require a new explicit modifier version.
- Rarity changes multiply the underlying rarity weight; they never add direct percentage points or
  guarantee a rare result.
- Every changed coefficient affects only future deliveries because dispatched snapshots are
  immutable. Legacy deliveries preserve their stored timestamps and versioned behavior.

Possible level unlocks:

- functional equipment slots;
- cosmetic slots;
- cargo capacity;
- boost efficiency;
- longer routes;
- route discovery chance;
- attribute increases;
- visual titles or mascot appearance upgrades.

The approved XP curves and initial affinity values live in the XP System. Per-level stat growth and
the detailed library of skill triggers remain implementation and balance work.

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

- There is no hard general inventory limit. The meaningful limit is travel slots.
- Natural travel capacity grows from 3 slots at level 1 to 7 at level 20 according to the table in
  [Progressão e XP](./progression.md).
- Outgoing correspondence, mission cargo, gifts, and functional carried equipment consume their
  defined slots. Cosmetics and route discoveries do not.
- Backpacks use a dedicated worn position and add slots without occupying one: small `+1/-5%`
  speed, medium `+2/-10%`, and large `+3/-15%`. They are permanent and have no durability.
- Equipment with condition-based durability consumes at most one use per journey, and only when
  it actually mitigates the resolved condition. Different physical copies remain separate
  inventory instances and cannot be reserved by two mascots simultaneously.
- Items found during travel remain in delivery reward state until return collection; they do not
  retroactively compete with dispatched cargo capacity.
- Detailed slot validation, return bundles, equipment acquisition, and unresolved catalog values
  are defined by the current correspondence contract and the planned equipment work.

## Inventory, Collection, Journal, and Mailbox Rules

Inventory, collection, the mascot's travel journal, and mailbox are related but not identical.

Definitions:

- Inventory is the player's owned item storage.
- Collection is the player-facing area for discovered travel rewards and collectible
  progress.
- Mailbox, or "Caixa Postal" in pt-BR UI, is the received-correspondence inventory:
  letters, postcards, stickers, gifts, and visible received items from friends.
- `Diário de Viagem` is a permanent discovery record inside each mascot profile. It replaces the
  proposal for a separate primary Album surface and is not inventory.
- Cargo is the pet's delivery-specific carrying limit.

Rules:

- Received correspondence should use the product metaphor "Caixa Postal" instead of a
  generic inventory label.
- The bottom-nav entry remains "Coleção" for discovered items. The dedicated received-
  correspondence mailbox is accessed from the Ninho, keeping the primary mobile navigation
  focused on the five game surfaces.
- The mailbox is part of owned content, but it is not the same thing as the collection.
- Ninho is the player-owned hub for their read-only personal identity, mascot area, and mailbox.
  It is not a mascot profile: individual mascot details remain in the mascot area.
- Until their systems exist, Sementes, Cristais, account level, and account XP may be displayed as
  explicitly neutral zero values. The Ninho must not imply a purchasable balance, earned
  progression, achievements, editable profile, or user-uploaded avatar.
- The default player avatar is a neutral silhouette. Player profile data stays owner-only until a
  separately approved visitor-profile and privacy model exists.
- A received letter becomes readable only by its recipient when its delivery reaches the
  destination. It remains private to the delivery participants; the sender does not receive an
  inbox entry for their own letter.
- The collection may retain notebook-page styling, but discovery records belong to the mascot's
  `Diário de Viagem`; visible collection controls use filter language such as `Filtrar coleção`.
- Functional items, consumables, cosmetics, postcards, stickers, rewards, and materials may
  all live in inventory.
- Collection should highlight progress and discoveries.

### Postal finishing for sent correspondence

- Every sent correspondence item requires exactly one official stamp and one compatible official
  postmark. Every account owns the reusable default pair from the start.
- Collection stamps and postal marks are visual correspondence cosmetics, distinct from the
  Seeds currency and from permanent route-discovery journal records.
- A player may replace either default with one owned official personalized cosmetic. Selections
  are mandatory but neither default nor personalized cosmetics are consumed, transferred, or
  altered by a send.
- Personalized stamps and postmarks may later be earned, received, or sold through the approved
  shop model; their acquisition, price, and payment rules remain a separate milestone.
- The backend validates ownership at send time and snapshots the chosen official identities on the
  delivery. Sender and recipient render that snapshot rather than a mutable current selection.
- Postal marks may use the delivery's already-safe city/country label and delivery dates, but must
  never reveal street, neighborhood, nest coordinates, or a live location.
- User-created marks, uploads, freehand art, public galleries, and stamp trading remain out of
  scope until a separate moderation and trading design is approved.

Duplicate item policies:

- Unique: one copy only.
- Stackable: repeated items increase quantity.
- Duplicate allowed: multiple copies can exist, possibly with different stats.
- Convert on duplicate: repeat drops convert into fragments, Seeds, or upgrade
  progress.

Category defaults:

- stackable supplies and materials use quantities;
- equipment with stats allows separate copies because instances may later have different
  stats or upgrade state;
- simple cosmetics are unique, and the shop must prevent purchasing a second owned copy;
- duplicate postcards, badges, and collection stamps convert into collection progress;
- duplicate conversion rates, quantities, and any overflow reward remain balancing
  decisions for a later milestone.
- Until that conversion system exists, the Collection may group repeat non-equipment items
  visually and show their quantity. This is presentation only: every acquired inventory record
  remains intact and no duplicate is deleted, converted, or awarded currency.

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
- currency Seeds;
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
  currency named Seeds.

Deliveries created before this version keep `route_discovery_version = null`. They receive no
backfill and continue using the local visual fallback, preserving their historical outcome.

### Colecionáveis do Ninho de origem

Ao concluir a criação do Ninho, o perfil recebe automaticamente o cartão postal oficial da sua
cidade, quando essa cidade possui um cartão ativo no catálogo. Ninhos localizados no Brasil também
recebem o selo do estado que contém suas coordenadas canônicas. Essas concessões pertencem ao
perfil, são permanentes e idempotentes: visitas ou rotas posteriores não duplicam o mesmo cartão ou
selo. Contas já concluídas recebem os colecionáveis por backfill usando o GeoName ID e as
coordenadas persistidas do Ninho; dados ausentes ou não canônicos não são inferidos por texto.

### Lugares Memoráveis

Lugares Memoráveis são descobertas permanentes do perfil, separadas da carga de rota. Em novas
viagens não tutoriais, o backend materializa pontos a até 25 km da ida e desbloqueia o lugar no
instante estimado da passagem. O retorno não duplica o encontro e viagens anteriores à versão da
regra não recebem backfill.

Somente o dono do mascote desbloqueia o lugar. Lugares bloqueados não são enviados ao cliente; os
desbloqueados permanecem disponíveis no mapa para todos os mascotes do perfil. Na primeira
passagem, o mesmo ato concede de forma idempotente o cartão postal oficial permanente vinculado ao
lugar. O cartão não ocupa carga, não é consumido ao enviar e não pode ser concedido novamente.

Além desse cartão pareado, Lugares Memoráveis não concedem inventário, XP, Reputação Postal,
moeda, bônus de rota ou acesso exclusivo.

Os critérios editoriais, candidatos e briefs dessa família ficam no [catálogo de Lugares
Memoráveis](../design/world-landmark-catalog.md). Ele não altera as regras acima, nem torna uma
entrada proposta disponível no runtime.

## Shop and Monetization Rules

The shop may eventually include cosmetics, social content, optional boosts, fuel, and two
currencies: **Seeds** as the common currency and **Crystals** as the premium currency.

Currency boundaries:

- Seeds are earned from deliveries, route rewards, collection progress, and events.
- Seeds are standardized balance tokens. They are not collectible route or album items.
- Crystals may eventually be purchased, but are restricted to visual expression
  and social content.
- Crystals may buy cosmetics, stickers, postcards, and profile or equipment
  decoration.
- Crystals cannot directly buy mascot or player XP, attributes, route rewards,
  cargo capacity, required travel-time reductions, or exclusive gameplay access.
- Crystals cannot be converted into Seeds or transferred between players.
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
  Crystal-to-Seed conversion.
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

- non-capacity level unlocks from mascot level 1–20 and Reputação Postal unlock cadence;
- reward formulas, discovery taxonomy, regional content, and rarity/drop tables;
- remaining skill coefficients, contextual XP triggers, and anti-farming rules;
- Seeds and Crystal earning curves, prices, purchase limits, and paid-card pack size;
- equipment durability, repair prices, launch catalog, and Lanche Revigorante acquisition rates;
- slot costs for future gift/content subtypes;
- duplicate conversion rates, quantities, and overflow rewards;
- moderation implementation/operations for local encounters and friendship safety;
- weather provider, coefficients, cache/scheduler operations, and fallback monitoring;
- final map tile provider and map visual art direction.
## Private nest activation

The real nest is selected after the player chooses their starter mascot and before the mandatory tutorial. City search uses the imported GeoNames
catalog only to position the OpenStreetMap view; the search text is not retained. The player then
chooses an area manually. The server rounds that point to an approximately 2 km cell before
storing it for route calculations and keeps the selected GeoNames city as the route's postal city.
Accepted friends may see one another's city; unknown players receive only the broad regional
representation. Streets, neighborhoods, exact clicked coordinates, and nest addresses are never
displayed. GeoNames is refreshed manually every six months; Google Places is reserved for a
future, explicit point-of-interest flow.
