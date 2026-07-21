# Product

DUIF is a slow social game about messenger animals.

Players own animals that carry letters, cards, stickers, and collectible objects across the world. The game combines mascot collection, asynchronous travel, social interaction, light progression, and cosmetic customization.

The first version should focus on making the player care about their mascots and enjoy the act of sending something to another player.

As of July 2026, the implemented prototype validates the complete send-travel-return-collect
loop, authenticated persistence with mock fallbacks, multi-mascot map travel, deterministic
route discoveries, inventory, friends, regional postal traffic, and a read-only shop preview.
Milestones 37 through 47 are planned to replace the prototype account bridge with secure
registration, one user-named starter mascot, mandatory installed-mobile onboarding, a persisted
16-minute tutorial route, privacy-safe nest activation, and an administrative asset studio.

Detailed product rules for travel, slow social, privacy, map rewards, inventory, progression,
and shop direction live in:

`docs/product-rules.md`

## Core Concept

Each new player chooses exactly one of the three official starter archetypes and gives that mascot
a personal name. Additional mascot acquisition is deferred to a later product decision.

Each animal has its own:

- name;
- species;
- speed;
- attributes;
- level;
- experience;
- equipment;
- visual customization;
- current travel status.

Players use these animals to send correspondence to friends. A correspondence can be a letter, card, sticker, collectible item, or event-specific object.

When an animal is sent, it travels from the player’s origin to the destination, delivers the item, and then returns to its origin.

The travel is asynchronous and uses real elapsed time. The server does not need to update
position every second. Instead, travel progress is calculated from stored timestamps,
coordinates, route, and effective speed.

## Core Loop

The main gameplay loop is:

1. The player chooses a friend.
2. The player chooses one of their messenger animals.
3. The player chooses what to send.
4. The animal starts traveling from origin to destination.
5. The player checks the animal’s travel progress.
6. The animal delivers the correspondence.
7. The animal returns home.
8. The player collects rewards, experience, and possible items found during the trip.
9. The player upgrades or customizes the animal.
10. The player sends another correspondence.

The loop should feel simple, collectible, and social.

## Player Fantasy

The player should feel like they are managing a small team of charming postal companions.

The mascots are not just units with stats. They should feel personal, expressive, and worth customizing.

The game should evoke:

- sending something thoughtful to a friend;
- waiting for a companion to return;
- collecting postal objects from around the world;
- improving a favorite animal over time;
- seeing friends’ mascots and profiles;
- building small social rituals around sending and receiving.

## Initial MVP Goal

The MVP should validate the following question:

Can players enjoy viewing, sending, waiting for, and customizing messenger animals?

The MVP should not try to validate every future system at once.

## MVP Scope

The first playable MVP should include:

- basic player profile;
- three starter mascots;
- mascot detail screen;
- mock or simple friend system;
- ability to send a correspondence to a friend;
- calculated travel duration;
- outbound and return states;
- simple reward collection;
- basic inventory;
- lightweight visual customization;
- simple notification or status indicator when an animal returns.

## Out of Scope for the First MVP

Do not include in the first MVP:

- real-time chat;
- complex chat;
- full social feed;
- marketplace;
- trading;
- payments;
- advanced shop;
- complex economy;
- full 3D globe;
- weather systems;
- GPS-precise location;
- route optimization;
- moderation-heavy public posting features.

These can be explored later if the core loop is validated.

## Social Layer

The game should eventually support a lightweight social network.

Players should be able to:

- add friends;
- view friends’ profiles;
- see friends’ mascots;
- send correspondence to friends;
- receive letters, cards, stickers, or collectibles;
- build friendship progress through repeated exchanges;
- display favorite received items;
- visit a friend’s profile or postal page.

The social layer should feel personal and low-pressure, not like a noisy public feed.

The core social model is slow social:

- friendship by invite or code;
- accepted friendship required for sending;
- no real-time chat in v1;
- correspondence is the social interaction;
- the recipient receives the content when the pet reaches the destination.

## Correspondence Types

Possible correspondence types:

- letters;
- cards;
- postcards;
- stickers;
- stamps;
- small gifts;
- event tokens;
- collectible souvenirs;
- friendship notes.

In the beginning, correspondence can be represented with simple mock objects.

Later, each type may have cosmetic variants, rarity, event exclusivity, and collection value.

Confirmed direction:

- letters are written by the player, have a character limit, may contain emojis, and may
  include stickers;
- postcards can be app-sold city/event cards or user-uploaded photos with a short message
  on the back;
- stickers can be sent or attached to correspondence;
- gifts are intentionally not defined yet and need a later economy/design pass.

## Mascots

Mascots are the emotional center of the game.

Initial mascots:

- Nuvem;
- Trovão;
- Pipoca.

A mascot should have:

- id;
- name;
- species;
- level;
- experience;
- attributes;
- special trait;
- equipment;
- skills;
- visual appearance;
- current delivery status.

Core attributes:

- speed;
- stamina;
- orientation;
- luck.

Mechanical direction:

- Nuvem specializes in safe, consistent long routes;
- Trovão specializes in faster direct return trips;
- Pipoca specializes in wider route exploration and later capped rarity bonuses;
- traits and skills resolve into bounded delivery modifiers at dispatch time;
- active deliveries keep an immutable modifier snapshot so later changes cannot reroll them.

Detailed attribute, trait, skill, determinism, and balancing rules live in
`docs/product-rules.md`.

## Travel System

Travel should be calculated on demand and shown live on the map.

A delivery should store:

- sender id;
- receiver id;
- animal id;
- effective mascot-modifier snapshot;
- origin coordinates;
- destination coordinates;
- distance;
- outbound start time;
- outbound arrival time;
- return start time;
- return arrival time;
- status;
- reward seed.

The UI can calculate the current status, progress, and pet position using the current time.

Possible statuses:

- available;
- preparing;
- outbound;
- delivered;
- returning;
- returned;
- completed.

The server should not need to update the animal’s position every second.

The map is a core mechanic. It shows selectable player mascots moving along their routes,
outbound/return state, regional discoveries, return cargo, and privacy-safe postal traffic.

## Location and Privacy

The game should avoid using exact home locations.

Use the product term "postal base" instead of "home address".

Allowed postal-base fields:

- street;
- neighborhood;
- city;
- state;
- country.

Visibility rules:

- street and neighborhood are private reference data;
- friends see only city, state, and country;
- non-friends do not see useful location data;
- do not collect or show house number, complement, exact postal code, or precise residential
  coordinates;
- route displays should use sanitized city/state/country labels.

The product should feel global without creating privacy risk.

## Rewards

Rewards should make travel feel meaningful.

Possible rewards:

- experience;
- currency Stamps;
- collectible stamps;
- stickers;
- equipment;
- postcards;
- feathers;
- souvenirs;
- event collectibles;
- friendship points.

Rewards can be generated from a deterministic seed based on the delivery, animal, and event context.

Mascot progression uses the same base XP formula for every species: distance, novelty, and a
route-context bonus. Species identity should shape travel style, situational affinities, and
discoveries—not provide a permanent XP-farming advantage. Exact coefficients and level curves are
defined in `product-rules.md` and remain deferred until authoritative progression is implemented.

The first version can use simple random rewards.

## Inventory

The inventory should support owned items. The album is the collectible visual experience
for viewing discoveries, rarity, empty slots, and collection progress.

Potential categories:

- stamps;
- cards;
- stickers;
- envelopes;
- equipment;
- souvenirs;
- feathers;
- seasonal items.

Inventory should support functional items, cosmetic expression, social content, and
collection goals. Pet cargo capacity is a separate delivery-specific limit.

## Customization

Customization should focus on visible, charming changes to mascots.

Examples:

- hats;
- bags;
- scarves;
- feathers;
- badges;
- delivery satchels;
- color accents;
- postcard frames;
- profile decorations.

Cosmetics should not be required for early gameplay, but they should give players a reason to return and personalize their mascots.

## Economy

The first prototype should not include a complex economy. The product uses **Stamps** as the
common currency earned through play and **Crystals** as the future premium currency limited
to cosmetics and social expression. Currency Stamps are separate from collectible stamps
stored in the collection. Prices are not defined yet.

A later version may include:

- Stamps from deliveries;
- cosmetic shop;
- seasonal items;
- limited-time collections;
- optional fuel-powered boosts available without requiring payment;
- optional cosmetics bought with Crystals.

The full send-travel-return-collect loop remains free. Premium purchases cannot grant XP,
attributes, route rewards, cargo capacity, exclusive gameplay access, or required travel
speed. Paid loot boxes and Crystal-to-Stamp conversion are not allowed. Detailed
economy rules live in `docs/product-rules.md`.

## Events

Events can be added after the core loop works.

Possible event types:

- seasonal postal festivals;
- rare route encounters;
- limited-time stamps;
- special delivery requests;
- global collection challenges;
- friendship exchange events.

Events should add variety without making the base game overly complex.

## Visual Identity

The game should look like an illustrated postal notebook.

The interface should feel like:

- a sketchbook;
- a postal album;
- a travel diary;
- a desk with papers, maps, stamps, and envelopes;
- a collection of animal profile cards.

The UI should avoid generic website patterns.

Buttons and panels should look like objects from the game world, such as:

- stamps;
- paper tabs;
- labels;
- tags;
- cards;
- envelopes;
- pinned notes.

No emojis should be used in the UI.

## Tone

The product tone should be:

- warm;
- calm;
- charming;
- collectible;
- lightly playful;
- not overly childish;
- not noisy;
- not corporate.

The game should feel welcoming without relying on excessive humor or exaggerated cuteness.

## Technical Direction

The current prototype uses:

- React;
- TypeScript;
- Vite;
- CSS Modules;
- initial internationalization for `pt-BR` and `en-US`;
- Supabase-backed authenticated flows with explicit local mock fallbacks;
- MapLibre for the interactive travel map;
- no real payment system.

Travel logic should live outside UI components.

Visible UI copy should come from translation files from the first implementation.

The UI should be component-based, mobile first, responsive, and lightweight.

Mobile web is the primary product experience.

Desktop should feel like an expanded version of the same notebook, not a separate dashboard-first product.

## Performance Direction

The app should remain lightweight enough to work well as a PWA.

Avoid:

- full-screen image-based UI;
- heavy 3D rendering;
- complex map tiles in the first prototype;
- excessive blur effects;
- large unoptimized assets;
- continuous background simulations.

Prefer:

- HTML and CSS for structure;
- SVG for simple art and icons;
- optimized WebP or AVIF for mascot illustrations;
- small repeatable textures;
- timestamp-based travel calculation;
- transform and opacity for animations.

## Historical First Prototype Screen

The first screen built was the mascot detail screen.

It should include:

- mascot selector;
- mascot name;
- species;
- large mascot portrait area;
- level and experience;
- attributes;
- special trait;
- equipment;
- current travel status;
- small route preview;
- visual customization preview;
- skills;
- bottom navigation.

The goal of this screen is to establish the visual style and make the mascot feel valuable.

## Historical Success Criteria for the First Prototype

The first prototype is successful if:

- the mascot screen feels visually distinct and not like a generic website;
- the player can understand the mascot’s status quickly;
- the UI feels lightweight and responsive;
- the structure is ready for real game logic later;
- the mock data is easy to replace with backend data later;
- the mascot feels like something the player would want to customize and send on journeys.

## Long-Term Product Direction

If the core loop works, the product can expand toward:

- send flow;
- friend profiles;
- received correspondence collection;
- inventory album;
- cosmetic shop;
- events;
- route discoveries;
- richer mascot progression;
- PWA installation;
- push notifications;
- eventual native app exploration.

The product should grow from the emotional core: players caring about their messenger animals and enjoying social exchanges through them.
