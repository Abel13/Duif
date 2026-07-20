# Roadmap

This roadmap defines the initial execution plan for DUIF.

DUIF should be built in small, testable milestones. Each milestone should produce a working result that can be reviewed before moving to the next step.

The goal is to avoid building the full game too early. Start with the emotional and visual
core, validate the send-travel-return loop, then validate the real map because map travel is
now a central mechanic.

## Current Roadmap State

Milestones 1 through 36A form the implemented baseline as of July 2026. Their sections remain
below as an architectural and product record, not as pending work.

Milestones 37 through 47 are the approved account, onboarding, tutorial, PWA-installation, and
catalog-administration phase. This phase replaces the prototype identity bridge with independent
accounts, removes every runtime mock fallback, provisions one user-named mascot from an official
archetype, and requires a short playable tutorial before the player's real nest is activated.
Factories and fixtures remain allowed only inside automated tests.

## Roadmap Principles

Build in this order:

1. Visual identity.
2. Mascot ownership.
3. Travel calculation.
4. Sending flow.
5. Social loop.
6. Backend and persistence for the core loop.
7. Product rules and privacy.
8. Real map validation.
9. Inventory and collection.
10. Economy and events.

Each milestone should be small enough for Codex to implement in focused tasks.

## Milestone 1: Project Foundation

Goal:

Create the base project structure, documentation, theme system, and development conventions.

Includes:

- Vite React TypeScript project;
- AGENTS.md;
- product documentation;
- visual direction documentation;
- technical decisions documentation;
- roadmap documentation;
- internationalization documentation;
- base folder structure;
- global CSS files;
- theme variables;
- initial `pt-BR` and `en-US` locale files;
- reset styles;
- initial app shell;
- initial routing setup.

Does not include:

- mascot screen;
- backend;
- authentication;
- map system;
- PWA setup;
- real art assets.

Success criteria:

- project runs locally;
- project builds successfully;
- folder structure matches documentation;
- Codex has enough context to continue safely;
- no unnecessary dependencies are added.

Suggested Codex task:

Read AGENTS.md and the docs folder before making changes.
Set up the initial project structure for the DUIF prototype.
Create the folders, global CSS files, basic App component, and initial routing. Do not implement gameplay screens yet.

## Milestone 2: Reusable UI Foundation

Goal:

Create the first reusable UI components that define the sketch postal style.

Includes:

- SketchPanel;
- StampButton;
- PaperTab;
- ItemCard;
- basic focus states;
- responsive component behavior;
- mobile-first component behavior;
- component-level CSS Modules;
- demo usage in the app shell.

Does not include:

- mascot-specific components;
- game logic;
- backend;
- maps;
- real image assets.

Success criteria:

- UI components do not look like default website components;
- components use semantic HTML;
- components are accessible by keyboard;
- styling uses theme variables;
- components are designed from mobile viewport constraints first;
- components are reusable across future screens.

Suggested Codex task:

Create the first reusable UI foundation for the sketch postal style.
Implement SketchPanel, StampButton, PaperTab, and ItemCard using TypeScript and CSS Modules. Include a small demo usage. Do not build the mascot page yet.

## Milestone 3: Mock Game Data

Goal:

Create the typed data model for the first prototype.

Includes:

- Coordinates;
- Mascot;
- EquipmentItem;
- Skill;
- Delivery;
- MascotAttributeSet;
- MascotTrait;
- mock data for Nuvem, Trovão, and Pipoca;
- placeholder travel utilities.

Does not include:

- backend;
- persistence;
- real player accounts;
- actual delivery creation;
- full economy.

Success criteria:

- all mock data is typed;
- the mascot screen can be built from mock data;
- game logic is not embedded directly in UI components;
- data labels and visible copy use translation keys with `pt-BR` and `en-US` values.

Suggested Codex task:

Create the mock game data layer.
Implement src/game/types.ts, src/game/mockData.ts, and placeholder exports in src/game/travel.ts. Add mock data for Nuvem, Trovão, and Pipoca.

## Milestone 4: Mascot Detail Screen

Goal:

Build the first polished prototype screen.

Includes:

- mascot selector;
- main mascot portrait area;
- mascot name;
- species;
- level;
- XP progress;
- attributes;
- special trait;
- equipment grid;
- current delivery card;
- visual customization preview;
- skills panel;
- bottom navigation as paper tabs;
- mobile-first responsive layout.

Does not include:

- full send flow;
- backend;
- authentication;
- real map implementation;
- real asset pipeline.

Success criteria:

- screen feels like a postal notebook page;
- screen does not look like a generic dashboard;
- mock mascot data is displayed clearly;
- visible text comes from the i18n layer;
- layout works on mobile and desktop;
- mobile layout is the primary design baseline;
- player can understand the mascot’s current state quickly;
- components are split into maintainable pieces.

Suggested Codex task:

Build the MascotDetailPage using the existing UI components and mock data.
The page should feel like an illustrated postal notebook. Use CSS Modules, semantic HTML, and responsive layout. Use placeholder art blocks only.
Use translation keys for all visible copy and verify both `pt-BR` and `en-US`.

## Milestone 5: Visual Polish Pass

Goal:

Improve the visual identity after the screen structure exists.

Includes:

- irregular paper card borders;
- stamp-like primary actions;
- paper tab navigation;
- tape corners;
- dashed ink dividers;
- level badge;
- status labels;
- subtle paper shadows;
- placeholder mascot illustration area;
- reduced generic web styling.

Does not include:

- heavy animations;
- large image assets;
- complex SVG filters;
- 3D effects;
- full-screen image UI.

Success criteria:

- UI clearly communicates sketch postal identity;
- buttons feel like postal objects;
- panels feel like paper objects;
- decoration does not hurt readability;
- performance remains lightweight.

Suggested Codex task:

Improve the mascot screen visual style.
Make panels look like paper cards, buttons like postal stamps, tabs like torn paper, and badges like postal labels. Keep everything lightweight and accessible.

## Milestone 6: Travel Calculation Utilities

Goal:

Implement the core travel math separately from the UI.

Includes:

- Haversine distance calculation;
- estimated travel duration;
- game speed multiplier;
- route progress calculation;
- delivery status calculation;
- remaining time formatting;
- basic unit tests.

Does not include:

- real-time server updates;
- background jobs;
- GPS tracking;
- real routes;
- weather;
- traffic;
- physical simulation.

Success criteria:

- travel logic works without React;
- utilities are pure and testable;
- delivery status can be calculated from timestamps;
- movement is based on elapsed time, not continuous simulation;
- tests cover key cases.

Suggested Codex task:

Implement travel calculation utilities in src/game/travel.ts and add Vitest tests.
Include distance, duration, progress, status, and remaining time helpers.

## Milestone 7: Mini Route Preview

Goal:

Add a lightweight visual route preview to the mascot detail screen.

Includes:

- small stylized route card;
- origin label;
- destination label;
- dashed route line;
- progress marker;
- distance;
- estimated remaining time.

Initial version can use a simple illustrated route, not a full world map.

Does not include:

- map tiles;
- zoom;
- pan;
- real map provider;
- 3D globe;
- complex geospatial rendering.

Success criteria:

- player understands where the mascot is going;
- route preview matches the sketch postal style;
- component is lightweight;
- component is isolated and reusable.

Suggested Codex task:

Add a lightweight route preview to the MascotTravelCard.
Do not use map tiles or a full map library yet. Use SVG/CSS to show a stylized dashed route with origin, destination, and progress marker.

## Milestone 8: Responsive Polish

Goal:

Refine the mascot experience across mobile, tablet, and desktop after the mobile-first baseline exists.

Includes:

- mobile-first layout review;
- desktop notebook layout;
- tablet horizontal mascot selector;
- mobile single-column layout;
- reachable navigation;
- comfortable tap targets;
- no horizontal overflow;
- readable text sizes;
- stable portrait area.

Does not include:

- separate native mobile app;
- platform-specific UI;
- complex gesture controls.

Success criteria:

- screen is usable on mobile;
- mobile is treated as the primary experience;
- important mascot information appears near the top;
- touch targets are comfortable;
- layout remains visually consistent;
- no content is hidden or clipped.

Suggested Codex task:

Make MascotDetailPage fully responsive.
Start from the mobile layout. Desktop should feel like an expanded open notebook. Tablet should use a horizontal mascot selector when it improves usability. Mobile should use a clean single-column layout with reachable navigation.

## Milestone 9: Send Flow Prototype

Goal:

Create the first mock flow for sending correspondence.

Includes:

- choose friend;
- choose mascot;
- choose correspondence type;
- show distance estimate;
- show duration estimate;
- confirm send;
- update mock delivery state locally.

Does not include:

- backend persistence;
- real notifications;
- real friend accounts;
- moderation;
- payments;
- inventory consumption.

Success criteria:

- player can understand the sending loop;
- flow feels connected to the mascot;
- sending creates a believable delivery state;
- UI remains consistent with postal sketchbook style.

Suggested Codex task:

Create a mock SendFlow page.
Allow the user to choose a friend, mascot, and correspondence type from mock data. On confirmation, create a local mock delivery state and show a confirmation screen.

## Milestone 10: Reward Collection Prototype

Goal:

Create the first version of animal return and reward collection.

Includes:

- returned delivery state;
- reward summary;
- XP gain;
- item found;
- collect button;
- simple inventory update in local state;
- reward presentation as an opened envelope or paper slip.

Does not include:

- complex economy;
- rarity balancing;
- backend validation;
- monetization;
- trading.

Success criteria:

- returning feels satisfying;
- player understands what was gained;
- reward UI matches the game world;
- reward data can later be moved to backend logic.

Suggested Codex task:

Create a mock reward collection flow for returned deliveries.
Show XP, collected item, and a collect action using local state only. Present rewards as postal objects, not generic modals.

## Milestone 11: Friends and Profile Prototype

Goal:

Add the first social layer using mock data.

Includes:

- friend list;
- friend profile;
- visible friend mascots;
- send action entry point;
- basic friendship level or exchange count;
- received correspondence preview.

Does not include:

- real user accounts;
- search;
- public feed;
- chat;
- moderation;
- blocking/reporting.

Success criteria:

- player can see another player’s mascots;
- sending to a friend feels natural;
- social loop is understandable;
- UI avoids looking like a generic contact list.

Suggested Codex task:

Create mock Friends and FriendProfile pages.
Use mock users and mascots. Allow navigation from a friend profile into the SendFlow. Keep the visual style postal and collectible.

## Milestone 12: Inventory Album Prototype

Goal:

Create the first version of the item collection experience.

Includes:

- inventory categories;
- item cards;
- rarity labels;
- equipped state;
- empty album slots;
- basic filtering by category;
- mock item data.

Does not include:

- item trading;
- selling;
- shop;
- backend inventory;
- complex rarity system.

Success criteria:

- inventory feels like a collectible album;
- items are easy to browse;
- cosmetics feel desirable;
- layout works on mobile.

Suggested Codex task:

Create an InventoryAlbum page using mock items.
Display categories, item cards, rarity labels, and empty album slots. The UI should feel like a postal collection album.

## Milestone 13: Real Asset Pipeline

Goal:

Prepare the app to use real visual assets safely and efficiently.

Includes:

- asset folder conventions;
- mascot portrait slots;
- thumbnails;
- equipment icons;
- texture usage;
- image loading rules;
- fallback assets.

Does not include:

- final art production;
- large asset packs;
- 3D models;
- remote asset CDN.

Success criteria:

- real art can replace placeholders without rewriting layout;
- images are optimized;
- main mascot art loads reliably;
- secondary assets can lazy-load;
- UI does not depend on one large image.

Suggested Codex task:

Prepare the asset pipeline.
Create asset path conventions, fallback image handling, and update components to accept real asset URLs while keeping current placeholders.

## Milestone 14: Basic PWA Setup

Goal:

Make the prototype installable as a PWA.

Includes:

- web app manifest;
- placeholder icons;
- theme color;
- service worker;
- static asset caching;
- offline app shell.

Does not include:

- push notifications;
- offline gameplay sync;
- background tasks;
- backend API caching.

Success criteria:

- app can be installed;
- static assets cache properly;
- app shell loads offline;
- PWA setup does not interfere with development.

Suggested Codex task:

Add basic PWA support using vite-plugin-pwa.
Create a manifest, placeholder icons, and static asset caching. Do not add push notifications yet.

## Milestone 15: Performance Review

Goal:

Review and optimize the prototype before adding backend complexity.

Includes:

- bundle review;
- image size review;
- CSS performance review;
- animation review;
- unnecessary dependency removal;
- render performance review;
- documentation of performance decisions.

Does not include:

- premature micro-optimizations;
- complex profiling infrastructure;
- backend performance work.

Success criteria:

- project builds cleanly;
- no unnecessary heavy libraries;
- animations use transform and opacity;
- images are appropriately sized;
- no heavy filters or full-screen art hacks;
- performance notes are documented.

Suggested Codex task:

Audit the front-end performance.
Run the build, review dependencies, check animation patterns, inspect large assets, and document performance decisions in docs/performance.md.

## Milestone 16: Backend Decision Point

Goal:

Decide whether the product is ready for backend implementation.

Do this only after the core interaction feels promising.

Questions to answer:

- Is the mascot detail screen compelling?
- Is the send flow understandable?
- Is waiting for the animal interesting?
- Do rewards feel worth collecting?
- Does the social loop feel natural?
- Are players likely to return?

Possible backend path:

- Supabase Auth;
- PostgreSQL;
- Supabase Storage;
- Edge Functions;
- row-level security.

Alternative path:

- custom Node.js backend;
- PostgreSQL;
- Prisma;
- Redis later if needed.

Success criteria:

- backend is added for validated needs, not speculation;
- data model is informed by the prototype;
- no unnecessary server complexity is introduced.

Decision outcome:

The Milestone 16 decision is documented in `docs/backend-decision.md`.

DUIF is ready for a minimal Supabase backend foundation, focused on the current core loop only. Mapa, Loja, trading, chat, payments, push notifications, and complex economy systems remain outside the first backend pass.

## Milestone 17: Supabase Foundation And Data Model

Goal:

Add the local backend foundation for the validated core loop without wiring the full UI to production data yet.

Includes:

- local Supabase setup;
- initial PostgreSQL migrations;
- seed data based on the current prototype;
- generated database TypeScript types;
- documented RLS strategy;
- schema coverage for profiles, mascots, friendships, deliveries, rewards, and inventory.

Does not include:

- production deployment;
- production auth polish;
- real map provider;
- shop or payments;
- trading;
- chat;
- push notifications;
- full UI migration away from mocks.

Success criteria:

- local Supabase starts successfully;
- migrations apply cleanly;
- seed data represents the current prototype loop;
- database types can be generated;
- existing app tests and build still pass;
- backend scope remains limited to persistence for the validated loop.

Implementation notes:

- local ports use the `56321-56329` range to avoid conflicts with another local Supabase app;
- schema documentation lives in `docs/backend-schema.md`.

## Milestone 18: Supabase Read Layer, Catalog First

Goal:

Add the first real frontend Supabase integration without weakening RLS or replacing the
mock-driven prototype.

Includes:

- typed Supabase browser client;
- environment-driven data source selection;
- public catalog reads from `mascot_templates`;
- pure mappers from Supabase rows to existing game types;
- mock fallback when Supabase is unavailable or disabled;
- documentation for `.env.local` setup and RLS boundaries.

Does not include:

- auth;
- writes;
- service role usage in the browser;
- reading player-owned tables from the frontend;
- migrating send, friends, inventory, rewards, or deliveries to live data.

Success criteria:

- app works with no `.env.local`;
- app can read starter mascot catalog rows when `VITE_DUIF_DATA_SOURCE=supabase`;
- `/mascots/:mascotId` keeps the same user-facing behavior;
- player-owned data remains protected behind RLS;
- tests and build continue passing.

## Milestone 19: Auth Foundation

Goal:

Add minimal Supabase Auth so DUIF can safely read player-owned rows in later milestones.

Includes:

- `/auth` route with a mobile-first email/password form;
- Supabase session provider and auth helpers;
- `claim_current_profile` RPC to connect the local auth user to the seeded Abel profile;
- authenticated read of the current profile through existing RLS;
- docs for local auth setup and scope.

Does not include:

- OAuth;
- magic link;
- password reset;
- production onboarding;
- public profile editing;
- migrating gameplay screens away from mocks.

Success criteria:

- app still works without Supabase env vars;
- local email/password sign up and login work when Supabase is configured;
- the current profile can be claimed only by one auth user;
- logout clears the local session;
- existing routes keep rendering with mock gameplay data.

## Milestone 20: Authenticated Mascot Data

Goal:

Make the mascot detail screen read authenticated player mascot data from Supabase while
preserving the existing prototype routes and visual experience.

Includes:

- authenticated `player_mascots` reads for the claimed current profile;
- authenticated `deliveries` reads for the player's mascots;
- mappers from database rows to existing `Mascot` and `Delivery` types;
- fallback to public catalog or mocks when auth/Supabase data is unavailable;
- documentation that only the mascot screen has moved to authenticated data.

Does not include:

- creating real deliveries from `/send`;
- migrating friends, inventory, rewards, or collection flows;
- new RLS policies;
- backend writes for gameplay.

Success criteria:

- `/mascots/mascot-nuvem` works without Supabase env vars;
- with Supabase data mode and an authenticated profile, Nuvem shows the seeded Lisbon delivery;
- Trovão and Pipoca render without deliveries;
- invalid mascot IDs still redirect to Nuvem;
- tests and build pass.

## Milestone 21: Persisted Send Flow

Goal:

Make `/send` create real delivery rows when the user is authenticated, while preserving
the mock send flow as fallback.

Includes:

- `create_delivery_from_selection` RPC for validated delivery creation;
- accepted-friend profile reads for send destinations;
- authenticated send data for friends, mascots, and correspondence options;
- `/send` confirmation powered by persisted deliveries when Supabase data mode is active;
- mock fallback without auth or env configuration.

Does not include:

- inventory changes;
- reward generation;
- collection persistence;
- delivery history;
- realtime updates;
- notifications.

Success criteria:

- `/send` works with mocks when Supabase is unavailable;
- authenticated users can create a real `deliveries` row;
- the new delivery appears on the mascot screen;
- direct inserts are not exposed through broad client-side policies;
- tests and build pass.

## Milestone 22: Persisted Reward Collection

Goal:

Make `/rewards/:deliveryId` collect returned delivery rewards through Supabase when the
user is authenticated, while preserving the mock reward flow as fallback.

Includes:

- `collect_delivery_reward` RPC for validated collection;
- deterministic `delivery_rewards` creation or reuse;
- `deliveries.status = 'completed'` after collection;
- `inventory_items` insertion for the collected item;
- authenticated reward read layer for the reward page;
- mock fallback without auth or env configuration.

Does not include:

- persisted inventory album UI;
- economy balancing;
- shop;
- trading;
- reward history;
- realtime updates.

Success criteria:

- `/rewards/delivery-nuvem-maringa` still works with mocks;
- authenticated users can collect a returned delivery reward;
- collection creates or reuses a delivery reward and writes an inventory item;
- already collected rewards render as completed;
- tests and build pass.

## Milestone 23: Product Rules And Privacy Pass

Goal:

Consolidate the product decisions that shape the next backend and gameplay work before
adding more systems.

Includes:

- slow social definition;
- real-time travel/map product direction;
- postal-base privacy rules;
- social/friend visibility rules;
- correspondence behavior;
- mascot XP and progression direction;
- equipment, cargo, inventory, and album definitions;
- shop and monetization guardrails;
- explicit open questions for balancing and economy.

Does not include:

- schema changes;
- UI changes;
- map implementation;
- shop implementation;
- reward economy implementation.

Success criteria:

- product rules are documented in `docs/product-rules.md`;
- `docs/product.md` points to the rules document;
- privacy and map technical decisions are reflected in `docs/technical-decisions.md`;
- future roadmap milestones reference the new product direction.

## Milestone 24: Real Map Validation

Goal:

Validate the real map technology DUIF will use for its central travel mechanic.

Includes:

- install `maplibre-gl`;
- create a mobile-first `/map` route;
- create a reusable map component under `src/components/map`;
- render a real interactive MapLibre map;
- make `/map` a full-screen map experience with postal cards overlaid on top;
- allow one-finger mobile pan because the map is the primary interaction on this screen;
- show a straight-line route using the current Nuvem delivery as the first case;
- show origin, destination, and current pet position calculated from timestamps;
- show route-relevant city/region labels through DUIF-owned layers;
- add mocked city/state reward markers along or near the route;
- show a small list/panel of route discoveries tied to the visible map markers;
- link the `Mapa` bottom nav tab to `/map`;
- document the MapLibre decision and known production tile/style open questions.

Does not include:

- custom tile hosting;
- final illustrated map art;
- real route geometry beyond straight lines;
- nearby pets or live postal traffic;
- backend reward-area tables;
- live sockets;
- inventory writes from route discoveries;
- shop or economy logic.

Success criteria:

- `/map` renders without breaking mobile layout;
- the map is interactive and not visually generic after initial styling;
- the pet marker position changes based on delivery progress;
- origin, destination, route line, and reward markers are visible;
- `/mascots/mascot-nuvem`, `/send`, `/friends`, `/inventory`, and `/rewards` still work;
- tests and build pass.

## Milestone 24.5: Mobile Navigation And Flow Polish

Goal:

Turn the existing screens into a coherent mobile app experience before expanding backend,
privacy, or economy work.

Includes:

- create shared layout primitives for page padding, bottom navigation, and secondary-flow
  top bars;
- replace the old mascot-specific bottom nav with an app-level bottom nav;
- keep main routes reachable through bottom navigation: Ninho, Coleção, Mapa, Amigos,
  and disabled Loja;
- add consistent back navigation to send, rewards, friend profile, and auth flows;
- reduce mobile scroll pressure with denser cards, compact grids, and sticky action panels
  where useful;
- ensure content is not hidden behind fixed mobile navigation.

Does not include:

- new gameplay;
- route changes;
- Supabase schema or policy changes;
- shop implementation;
- new animation or UI dependencies.

Success criteria:

- every screen has either bottom nav or a clear top-bar return action;
- primary actions remain reachable on mobile;
- mobile layouts avoid accidental horizontal overflow;
- tests and build pass.

## Milestone 25: Postal Base Privacy Model

Goal:

Make the data model and frontend language match the postal-base privacy rules before
expanding social features.

Includes:

- add explicit postal-base fields for street, neighborhood, city, state, and country;
- keep street and neighborhood private;
- expose only city/state/country to accepted friends;
- update social read helpers or add sanitized views/RPCs so friends do not receive private
  location fields;
- update send-flow destination labels to use sanitized city/state/country display;
- update product copy from "address" to "postal base" where visible;
- add database/RLS tests or unit tests for sanitized mapping where practical.

Does not include:

- real geocoding;
- exact address collection;
- public profile search;
- production privacy settings UI;
- moderation tooling.

Success criteria:

- accepted friends can send using sanitized location data;
- street and neighborhood are not rendered in friend/profile/send UI;
- non-friends cannot read useful location data;
- current user can still manage/read their own full postal-base fields;
- tests and build pass.

## Milestone 26: Correspondence Content Prototype

Goal:

Turn correspondence from a type selector into the first real slow-social content prototype.

Includes:

- letter composer with character limit;
- emoji support in letter text;
- sticker attachment slots for letters;
- postcard option with short back-of-card message;
- placeholder model for app-sold city/event postcards;
- placeholder model for user photo postcards without uploading real files yet;
- received correspondence preview for the recipient side;
- delivery status showing when content has arrived at the destination;
- i18n copy for writing, previewing, and receiving correspondence.

Does not include:

- real image upload/storage;
- moderation pipeline;
- paid shop inventory;
- real sticker purchases;
- push notifications;
- chat thread UI.

Success criteria:

- `/send` can collect simple letter/postcard content locally or in a safe persisted draft shape;
- recipient-facing mock/profile UI can show received correspondence content;
- character limits and empty-state validation are clear;
- no real-time chat patterns are introduced;
- tests and build pass.

## Milestone 27: Route Rewards Design Prototype

Goal:

Prototype map-based rewards collected along a pet's route before finalizing inventory and
reward economy.

Includes:

- define route reward types: badge, postcard, stamp, souvenir, material, event item;
- define mock reward points or areas by city/state/country;
- compute whether a straight-line route crosses or comes near eligible reward points;
- show discovered route rewards during the active trip on `/map`;
- distinguish "found during route" from "claimed into inventory after return";
- keep backend authority as the future rule, but prototype the calculation in pure TypeScript;
- add unit tests for route reward eligibility.

Does not include:

- final rarity tables;
- anti-cheat implementation;
- administrative boundary datasets;
- real inventory writes for every route discovery;
- economy balancing;
- custom map tiles.

Success criteria:

- a Nuvem route can display mocked discoveries on the map;
- discoveries are deterministic for a delivery seed/route;
- collected-along-the-way items remain tied to delivery state until reward collection;
- tests and build pass.

## Milestone 27.5: Postal Traffic Design Spike

Goal:

Validate whether showing other pets passing near the player's pet should become a default
part of the map experience.

Includes:

- define "postal traffic" as nearby active deliveries, not chat or full real-time multiplayer;
- decide what information is visible for friends and public non-friend mascots;
- prototype a few nearby pet route snapshots on `/map`;
- animate nearby pets client-side from route endpoints, timestamps, and speed;
- document backend query shape for viewport/route proximity;
- confirm privacy rules so no street, neighborhood, or precise private base data is exposed.

Does not include:

- live sockets;
- global real-time player tracking;
- precise residential location sharing;
- messaging between nearby players;
- production anti-abuse or moderation tooling.

Success criteria:

- the map feels more alive without becoming noisy;
- nearby pets are useful or delightful enough to keep as a default map layer;
- privacy expectations remain clear;
- the technical model can scale through interest management instead of broadcasting every
  active pet to every client.

## Milestone 27.75: Art Direction Asset Slice

Goal:

Validate a small set of real DUIF assets inside the actual mobile UI before producing a
full final asset pack.

Includes:

- add a few optimized runtime assets following `docs/assets.md`;
- validate the first typography pair from `docs/typography.md`;
- validate portraits for Nuvem, Trovão, and Pipoca;
- add a small sample of equipment, reward, texture, and postal-mark assets;
- keep CSS fallbacks intact for every asset surface;
- review build size after assets are added.

Does not include:

- full cosmetic catalog;
- final shop inventory art;
- seasonal/event asset packs;
- production map tiles;
- large background illustrations.

Success criteria:

- real assets improve emotional appeal without breaking mobile layouts;
- the app remains lightweight;
- assets work across mascot, map, reward, inventory, and friend contexts;
- fallback rendering still works when files are missing or fail to load.

## Milestone 28: Persisted Collection Inventory

Goal:

Migrate the collection screen to read persisted inventory items while keeping album pages as
the visual metaphor for collectible progress, not the full inventory/economy system.

Includes:

- authenticated read layer for `inventory_items`;
- keep received-correspondence surfaces reserved for "Caixa Postal" in pt-BR UI;
- collection-page filtering from persisted data;
- album-style slots for collection progress;
- route rewards collected into inventory after return;
- mock fallback without auth or Supabase config.

Does not include:

- equip/unequip writes;
- shop purchases;
- cargo capacity enforcement;
- duplicate conversion economy;
- Caixa Postal for received correspondence;
- Crystals (premium currency).

Success criteria:

- `/inventory` uses persisted items when authenticated;
- collected route rewards appear after reward collection;
- album UI still works with mock fallback;
- tests and build pass.

## Milestone 29: Shop And Economy Design Pass

Status: Completed.

Goal:

Define the first safe economy rules before implementing a shop with cosmetics, useful
items, boosts, fuel, stickers, postcards, gifts, Stamps, and Crystals.

Includes:

- item categories for shop inventory;
- Stamp vs Crystal currency boundaries;
- paid-item guardrails;
- fuel/recharge direction;
- gift contents and restrictions;
- duplicate conversion decisions;
- moderation implications for user-generated postcard content;
- initial purchase/use flows at product-spec level.

Does not include:

- payments;
- real store UI;
- Stripe/App Store integration;
- Crystal currency ledger;
- backend purchase validation.

Success criteria:

- shop scope is explicit before implementation;
- pay-to-win risks are documented;
- gift and fuel open questions are resolved or intentionally deferred;
- roadmap can safely schedule the first shop prototype.

Decision outcome:

- Stamps are the common currency earned through play, while Crystals are the future premium
  currency limited to cosmetics and social expression;
- normal deliveries never require fuel, and fuel applies only to optional boost equipment;
- first-scope gifts contain only transferable stickers, postcards, or simple cosmetics;
- duplicate behavior is defined by item category, while conversion quantities remain a
  later balancing decision;
- user-uploaded photo postcards remain outside the first commercial prototype;
- detailed rules and paid-economy guardrails live in `docs/product-rules.md`.

## Milestone 30: Read-Only Shop Prototype

Status: Completed.

Goal:

Validate the postal-shop visual experience and catalog organization without implementing an
economy, purchases, or payment infrastructure.

Includes:

- mobile-first `/shop` route using the illustrated postal-notebook visual language;
- read-only mock catalog for cosmetics, stickers, postcards, and decorations;
- category filters and item detail or preview states;
- fictional prices clearly presented as prototype data;
- preview of eligible cosmetics or decorations without persisting changes;
- `pt-BR` and `en-US` copy;
- enable the existing Loja navigation tab for the mock route.

Does not include:

- currency balances or earning logic;
- purchase, gifting, equip, consume, or inventory-write actions;
- Supabase schema, catalog, ledger, RPC, or RLS changes;
- payment provider, checkout, receipts, refunds, or regional pricing;
- boosts, fuel, materials, functional equipment, loot boxes, or user-uploaded photos.

Success criteria:

- `/shop` communicates the intended catalog and postal-shop identity on mobile and desktop;
- filters and previews work entirely from typed mock data;
- no control suggests that a real purchase or premium balance exists;
- current gameplay routes and mock/Supabase fallbacks remain unchanged;
- tests and build pass.

## Milestone 31: Guided Map Navigation And Selection

Status: Completed and subsequently expanded with active-mascot switching.

Goal:

Turn the passive map into an accessible route-inspection experience, initially for one active
delivery and later expanded to switch among the player's active mascot routes.

Includes:

- HTML controls to frame the route, follow the mascot, focus origin or destination, and return to the overview;
- reward selection through either map markers or the discovery list, with synchronized state;
- mobile bottom sheet and desktop side panel for selected details;
- public frontend contracts for map focus and selection;
- camera commands and selection callbacks in `TravelMap`;
- a compact rotating selector for the player's mascots that currently have active routes;
- preserved pan and zoom while details are open.

Does not include:

- global map search;
- persistence or new backend contracts.

Success criteria:

- every guided action is keyboard accessible;
- marker and list selection remain synchronized;
- selection details do not block normal map navigation;
- overview, origin, destination, mascot, and reward focus behave consistently on mobile and desktop.

## Milestone 32: Continuous Postal Movement

Status: Completed and subsequently applied to each selectable personal route.

Goal:

Make the active mascot's travel feel calm and continuous without adding React render work to every animation frame.

Includes:

- timestamp interpolation with `requestAnimationFrame` and MapLibre APIs;
- a visual traveled-progress segment over the route;
- outbound and return direction handling;
- follow mode that is canceled by manual map movement;
- animation pause while the page is hidden;
- `prefers-reduced-motion` support;
- defensive behavior for invalid timestamps.

Does not include:

- a new animation dependency;
- particle effects or intense celebrations;
- server-authoritative live positioning;
- server-pushed real-time tracking or WebSocket movement.

Success criteria:

- movement is smooth without a React render per frame;
- following stops immediately after manual navigation;
- hidden tabs do not keep updating map animation;
- reduced-motion users receive a stable, understandable state.

## Milestone 33: Route Discoveries And Celebrations

Status: Completed.

Goal:

Make route discoveries visible and rewarding while preserving automatic eligibility and delayed collection.

Includes:

- automatic discovery when outbound progress crosses a reward threshold;
- one short postal celebration only for a newly crossed discovery;
- distinct future, newly discovered, and carried visual states;
- selectable reward markers with art, rarity, region, and current state;
- session-safe transition tracking so reopening a panel does not replay a celebration.

Does not include:

- requiring a tap to secure a discovery;
- writing discoveries into inventory during travel;
- random paid rewards or economy integration;
- backend discovery persistence.

Success criteria:

- crossing the exact threshold discovers the reward once;
- reopening or reselecting details does not repeat the celebration;
- future discoveries remain understandable without revealing inventory ownership;
- no reward can be collected before the mascot returns.

## Milestone 34: Return Summary And Collection Handoff

Status: Completed.

Goal:

Connect the map's return state to the existing safe reward-collection flow.

Includes:

- cargo summary after the mascot returns;
- CTA to `/rewards/:deliveryId` using the existing collection experience;
- archival into delivery history after collection;
- idle nest map after collection, without mascot, route, destination, or return summary;
- disabled route-overview, mascot, and destination camera controls in the idle state;
- current mock fallback and authenticated behavior.

Does not include:

- a second collection implementation inside the map;
- early inventory insertion;
- changes to reward authorization or database schema;
- duplicate conversion into Stamps.

Success criteria:

- discoveries happen outbound, remain carried during travel, and enter inventory only after return;
- the returned summary remains visible until collection and disappears afterward;
- completed deliveries leave the current slot and remain queryable as history;
- the handoff reuses the current authoritative collection route;
- repeat visits cannot duplicate the primary reward.

## Milestone 34A: Mascot Travel Modifiers

Status: Completed.

Goal:

Make the starter mascots mechanically distinct before route discoveries become authoritative
in the backend.

Includes:

- a pure `deriveMascotTravelModifiers(mascot, route)` resolver;
- a typed `MascotTravelModifiers` result for outbound speed, return speed, preparation,
  discovery radius, rarity weight, and long-route consistency;
- immutable modifier snapshots calculated when a delivery is created;
- Trovão returning approximately 10% faster through `Voo Direto`;
- Pipoca receiving an approximately 15% wider discovery corridor through `Achador Curioso`;
- Nuvem mitigating a bounded portion of long-route penalties through `Rota Segura`;
- visible explanations in the send flow so mascot choice is understandable before dispatch;
- deterministic tests for mascot, route, cap, invalid-value, and snapshot behavior;
- a minimal `travel_modifiers` delivery snapshot and authoritative creation trigger, brought
  forward from Milestone 35 so authenticated and mock deliveries cannot diverge.

Does not include:

- persisted route discoveries, reward materialization, or collection changes, which remain
  in Milestone 35;
- paid stat advantages, fuel, consumable energy, or premium-only routes;
- final rarity tables, duplicate conversion, cargo weights, or economy rewards;
- unrestricted stacking between traits, skills, and equipment;
- changing modifiers after a delivery has started.

Success criteria:

- each starter mascot has a noticeable but bounded delivery identity;
- no starter mascot is universally superior across speed, safety, and exploration;
- reopening the app cannot reroll or recalculate an active delivery differently;
- discovery and timing calculations consume the same modifier snapshot;
- existing deliveries without a modifier snapshot retain safe fallback behavior;
- tests, build, and mock send-travel-return flow continue to pass.

## Milestone 35: Persisted Route Discoveries

Status: Completed.

Goal:

Make route discoveries deterministic and authoritative without breaking the existing collection response.

Includes:

- a seeded catalog for Londrina, Cambé, Rolândia, Arapongas, Apucarana, and Maringá,
  each linked to its own regional `reward_item`;
- per-delivery discovery records with route progress, corridor distance, collection time,
  and resulting inventory item;
- deterministic materialization of every eligible point in the backend when a delivery is
  created, using the immutable mascot discovery-radius snapshot;
- nullable `route_discovery_version`, set to `1` even for new routes with no eligible point;
- participant-only reads, no direct browser writes, and sender-only collection;
- atomic, idempotent collection of the primary reward and every eligible route discovery;
- additive `routeInventoryItems` in the collection response;
- authenticated UI backed by persisted discoveries and a session-idempotent mock fallback;
- a single complete-cargo collection action and confirmation of all collected items;
- updated generated database types and SQL coverage for corridor boundaries, authorization,
  category mapping, and repeat collection.

Does not include:

- client-authoritative discovery creation;
- backfilling deliveries created before this milestone;
- using rarity weight to remove or reroll one of the fixed regional discoveries;
- duplicate conversion into Stamps;
- economy balancing or collection-conversion formulas;
- removal or renaming of existing RPC response fields.

Success criteria:

- the same delivery always receives the same persisted discovery set;
- only participants can read discoveries, and only the mascot owner/sender can collect them;
- collection is rejected before return and remains idempotent afterward;
- the Londrina–Maringá route materializes all six current points with stable progress;
- existing collection consumers continue working without changes.

## Milestone 36: Interactive Postal Traffic

Status: Completed and refined by Milestone 36A.

Goal:

Make nearby postal traffic inspectable while maintaining strict location privacy.

Includes:

- selection from both map markers and the nearby-traffic list;
- synchronized selection, camera focus, and detail panel;
- continuous local movement and the 10 closest results in the camera viewport plus a 25% margin;
- public mascot identity with name, species, official portrait, and regional route endpoints;
- friend owner details and profile CTA only for established friendships;
- private owners for public non-friend mascots;
- a compact selected card with route emphasis and a friend-profile CTA only when allowed;
- mobile and keyboard interaction coverage.

Does not include:

- residential origins;
- precise destinations;
- street, neighborhood, or private coordinates;
- live multiplayer tracking, messaging, or unsolicited social contact.

Success criteria:

- friend traffic links only to profiles the player may already visit;
- public non-friend traffic cannot reveal its owner or precise route endpoints;
- no UI snapshot contains residential or city endpoints or private endpoint coordinates;
- selection works consistently from marker and list;
- the panel does not introduce horizontal overflow on mobile.

### Milestone 36A: Authoritative Regional Postal Traffic

Status: Completed.

- query up to 10 nearby active deliveries from a security-definer RPC on entry and every five
  minutes, using the latest camera center and viewport;
- use complete coordinates only inside the backend and return deterministic regionalized route
  geometry, public positions, interpolation timestamps, and regional labels;
- render other routes as thin, desaturated, low-opacity lines, with a restrained selected state;
- fade traffic in and out over 400 ms and freeze selected details when a result leaves the region;
- keep regional traffic visible around the nest when no personal delivery is active;
- retain local traffic fixtures only for explicit mock development and tests.

This completed sequence introduced mascot modifiers before backend discovery materialization,
then expanded the map from one active route to selectable active routes for all three player
mascots. It continues to exclude street navigation, global search, map economy, payment flow,
live multiplayer, and new animation dependencies.

## Milestone 37: Clean Account And Data Foundation

Status: Completed locally and remotely. The remote project was identified and confirmed empty by
the operator, so no destructive reset or unnecessary backup was executed.

Goal:

Remove prototype player state locally and remotely, preserve only official catalogs, and make
Supabase the sole runtime data source.

Includes:

- an explicit, reviewable reset runbook for local and configured remote Supabase environments;
- deletion of Auth users, player profiles, owned mascots, friendships, correspondence, deliveries,
  discoveries, rewards, achievements, inventory, and other player-owned progress;
- preservation of official archetypes, species, skills, item catalogs, tutorial definitions,
  route-point catalogs, translations, and registered assets;
- removal of Abel and every other seeded player/profile fixture from runtime seeds;
- removal of runtime mock branches, mock session storage, and silent fallback behavior;
- test-only factories kept outside production runtime imports;
- a localized service-unavailable screen when Supabase is missing or unreachable;
- environment allowlists, dry-run counts, an optional export, typed confirmation, and an audit
  record before the remote reset can execute.

Does not include:

- deleting schema migrations or official catalog history;
- silently resetting a remote environment from application startup or a normal migration;
- retaining demonstration users in production tables.

Success criteria:

- local and approved remote environments contain no users or earned progress after the reset;
- official catalogs remain intact and internally consistent;
- the production bundle contains no runtime mock data path;
- tests continue using isolated deterministic factories.

## Milestone 38: Internationalized Database Contracts

Status: Implemented and migrated locally and remotely.

Goal:

Ensure every app-authored value stored for display is locale-independent before new accounts are
created.

Includes:

- `name_key`, `description_key`, `species_key`, `source_key`, alt-text keys, and other translated
  fields for official content;
- validation that every official key exists in `pt-BR` and `en-US`;
- English identifiers and enums for internal contracts;
- literal storage for user-authored names and correspondence, which must never be auto-translated;
- removal or migration of official display strings stored directly in catalog rows;
- generated TypeScript types and SQL checks for the new contracts.

Success criteria:

- changing locale changes all official database-backed copy;
- a missing translation key fails catalog validation;
- player-chosen names remain exactly as entered after safe normalization.

Delivered locally:

- official translation-key registry shared by the two supported locales;
- `draft | active | archived` lifecycle with authoritative activation validation, including
  nested archetype JSON;
- `catalog_key` contracts and UUID-only player/RPC identities;
- species-only archetype identity plus localized Nuvem/Cloud, Trovão/Thunder, and
  Pipoca/Popcorn name suggestions;
- strict frontend catalog parsing and generated Supabase types without legacy `mock_key` fields.

The migrations must not be applied remotely until the target project is identified, backed up,
and reset through the Milestone 37 runbook.

## Milestone 39: Secure Registration And Login

Status: Implemented locally; production SMTP and domain routing are configured, while the PKCE
deployment and production smoke test remain pending.

Goal:

Replace `claim_current_profile` with independent accounts and a simple postal login experience.

Includes:

- email/password sign-up, sign-in, sign-out, session restoration, password confirmation, and
  show/hide-password controls;
- generic public responses for invalid credentials, duplicate email, and account lookup so the
  UI never confirms whether an email is registered;
- detailed errors restricted to safe server logs;
- loading protection, duplicate-submit prevention, password policy, and intended-route recovery;
- global states for anonymous, verification pending, onboarding required, tutorial active,
  nest setup required, and ready;
- route guards for private gameplay surfaces;
- reusable localized paper-form, field, alert, progress, and action components;
- removal of development credentials from production UI.

Does not include:

- Google, Apple, magic-link, or social login;
- public username search;
- profile provisioning before the onboarding RPC is ready.

Success criteria:

- no public response enables email enumeration;
- session restoration does not flash private gameplay;
- authenticated users resume the correct onboarding or game state.

Delivered locally:

- generic email/password registration and login with mandatory email confirmation;
- eight-character letter-and-number password policy, confirmation fields, and visibility controls;
- confirmation resend, password recovery, secure callback handling, and global recovery sign-out;
- PKCE-only confirmation and recovery callbacks, with manual code exchange and immediate URL
  cleanup instead of access or refresh tokens in fragments;
- guarded journey states and sanitized intended-route restoration;
- localized postal forms for `pt-BR` and `en-US`, without provisioning profiles or mascots.

## Milestone 40: Official Asset Registry

Status: Implemented and validated locally; remote migration pending deployment.

Goal:

Replace free-form runtime paths with typed, versioned, officially registered assets.

Includes:

- records for stable key, asset type, Storage object, MIME type, dimensions, byte size, version,
  lifecycle state, translated alt-text key, author, timestamps, and typed metadata;
- initial types for mascot portraits, equipment, rewards, collectibles, navigation, map controls,
  map pins, currencies, shop art, textures, and postal marks;
- per-type metadata validation so unrelated attributes cannot be mixed;
- migration and registration of every current official asset;
- active-asset reads for the game and CSS fallbacks for loading failures;
- validation against the budgets and conventions in `docs/assets.md`.

Success criteria:

- every runtime image used by onboarding is resolved through an active registry record;
- invalid file types, dimensions, metadata, and missing translation keys are rejected;
- assets can be versioned without breaking existing references.

Delivered:

- typed stable asset identities and immutable version records with public active-only reads;
- packaged and future Storage source contracts, per-type metadata, budgets, translated alt text,
  decorative semantics, and migration-only activation;
- 39 registered gameplay/UI assets: 38 active and the unused route doodle archived;
- a single cached public manifest and key-based resolution across catalogs, inventory, rewards,
  postal traffic, map controls, navigation, currency, shop art, textures, and postal marks;
- PWA icons, brand logo, and fonts intentionally remain boot-safe packaged resources outside the
  runtime registry.

## Milestone 41: Required Mobile PWA Installation Gate

Status: Implemented and validated locally; production activation requires
`VITE_DUIF_REQUIRE_PWA_INSTALL=true` in the Vercel Production environment.

Goal:

Require the installed PWA presentation for the primary mobile game experience.

Includes:

- standalone-mode detection before authentication or onboarding;
- a blocking, localized postal installation screen in mobile browsers;
- direct `beforeinstallprompt` installation when supported, without a “later” bypass;
- illustrated iPhone/iPad instructions for Share and Add to Home Screen;
- detection of unsupported or embedded browsers with guidance to open Safari, Chrome, or another
  install-capable browser;
- preservation of the intended route and onboarding stage after installation;
- normal browser access on desktop.

Technical constraint:

- browsers require a user gesture and cannot be forced to install silently; DUIF can require
  installation before continuing on mobile, but cannot perform it on the user's behalf.

Success criteria:

- mobile gameplay cannot continue outside an installed display mode;
- unsupported browsers give a clear actionable alternative;
- installed launches do not show the gate again.

Delivered:

- a blocking gate mounted before Supabase authentication and gameplay providers;
- capability-based phone, tablet, iPad desktop-mode, standalone, embedded-browser, and install
  prompt detection without blocking ordinary desktop or hybrid-notebook navigation;
- direct installation when supported and localized manual instructions for iOS and other mobile
  browsers, with no dismiss or later action;
- PKCE callback and password-reset exceptions that finish safely in the browser and direct the
  player back to the installed app;
- one-time sanitized intended-route restoration with a 24-hour expiry;
- production-only activation through an explicit Vite environment variable.

## Milestone 42: Resumable Onboarding Shell

Status: Implemented and validated locally; remote migration pending deployment.

Goal:

Explain the game in a few short postal steps and persist progress across app restarts.

Includes:

- welcome copy explaining correspondence, elapsed-time travel, route discoveries, return, and
  collection;
- player display-name entry;
- a compact visible step indicator and back navigation where safe;
- server-persisted onboarding stage and idempotent resume behavior;
- mobile-first components that follow the illustrated paper, stamp, label, and notebook system;
- accessible focus order, errors, keyboard behavior, and localized `pt-BR`/`en-US` copy.

Success criteria:

- closing the PWA never loses an accepted step;
- explanations remain short and understandable without a separate manual;
- the player cannot access normal gameplay before completing required stages.

Delivered:

- a versioned `account_onboarding` record tied directly to the confirmed Auth user, without
  provisioning profile, nest, mascot, delivery, or inventory rows;
- idempotent server-owned initialization and linear stage transitions with owner-only reads;
- four required illustrated explanations followed by a unique public display-name step;
- review navigation that never regresses accepted server progress and exact resume at the first
  incomplete step;
- journey-aware route guards for onboarding, tutorial, nest setup, and ready states;
- localized mobile-first paper UI with language selection, sign-out, progress, focus management,
  validation, and a Milestone 43 handoff state.

## Milestone 43: Initial Mascot Choice And Provisioning

Status: Implemented and validated locally; remote migration pending deployment.

Goal:

Let each player select exactly one official archetype and give that mascot a personal name.

Includes:

- the three current Nuvem, Trovão, and Pipoca designs treated as archetypes rather than mandatory
  player-mascot names;
- translated archetype identity, species, trait, skills, and concise mechanical comparison;
- a user-entered mascot name with normalization and safety validation;
- confirmation of portrait, chosen name, species, and trait before provisioning;
- one idempotent authoritative RPC that creates the profile draft and exactly one owned mascot;
- uniqueness constraints preventing a second initial choice or duplicate provisioning;
- official portrait resolution through the asset registry.

Does not include:

- receiving all three starter mascots;
- purchasing, exchanging, or unlocking another mascot;
- making the archetype label the player's chosen mascot name.

Success criteria:

- every new player owns exactly one initial mascot;
- retrying after a network failure cannot create a second mascot;
- the chosen name is visible consistently across map, profile, tutorial, and collection UI.

Delivered:

- a circular, touch-enabled postal carousel backed by the three active official archetypes;
- a blank naming step that asks every player to create a personal literal mascot name;
- concise comparison of attributes, trait, skills, and starter equipment, followed by an explicit
  review step;
- resumable server-owned mascot drafts saved only when the player opens the review;
- atomic and idempotent profile plus starter-mascot provisioning from an immutable template
  snapshot;
- one-starter-per-owner enforcement and exclusive `mascotChoice → tutorial` advancement through
  the provisioning RPC;
- a neutral tutorial-nest profile placeholder that contains no real player location.

## Milestone 44: Mandatory Tutorial Delivery

Status: Implemented and validated locally; remote migration pending deployment.

Goal:

Teach the core loop through one real, persisted delivery before the player's own nest is created.

Includes:

- an authoritative tutorial delivery between a fictional nest and fictional destination;
- a fixed boosted duration of approximately 5 minutes: 30 seconds preparation, 2 minutes outbound,
  30 seconds at the destination, and 2 minutes returning;
- at least one guaranteed persisted collectible on the outbound route;
- guided camera, movement, automatic discovery, return, and collection explanations;
- server timestamps so progress continues while the PWA is closed;
- an idempotent tutorial reward that remains in inventory;
- persisted tutorial state and strict route guards preventing skip, cancellation, normal sending,
  or access to later onboarding stages;
- exclusion of the tutorial delivery from ordinary social delivery history.

Success criteria:

- the full preparation-to-return cycle takes approximately 5 real minutes;
- reopening the PWA resumes the correct position and instruction;
- the collectible appears at its threshold and can only be collected after return;
- no client action can mark the tutorial complete early.

Delivered:

- an explicit start action and one idempotent, server-timestamped 5-minute tutorial delivery;
- a restricted onboarding map between the fictional Postal Nest and Messenger Station;
- seven server-owned instructional acknowledgements that remain ordered across PWA restarts;
- one guaranteed Inaugural Postcard discovery at the midpoint of the outbound leg;
- atomic collection of the postcard and First Route Stamp through a tutorial-only RPC;
- strict exclusion from generic collection, social history, postal traffic, and generic onboarding
  advancement;
- completion handoff to `nestSetup` without exposing or assigning a real player location.

## Milestone 45: Real Nest Activation

Status: Implemented locally; production requires the first GeoNames city import.

Goal:

Replace the fictional tutorial nest with the player's privacy-safe real regional nest.

Includes:

- nest setup only after tutorial collection;
- global city search through a private GeoNames catalog, followed by a manual OpenStreetMap map
  selection;
- an administrative, versioned GeoNames `cities15000` import refreshed manually every six months;
- an approximate private point normalized by the backend to a ~2 km cell;
- no street, neighborhood, residential GPS, house number, state, country, or precise coordinate
  exposed as player-facing profile data; the selected GeoNames city is available to its owner and
  accepted friends only;
- review and confirmation of the approximate private route origin;
- `onboarding_completed_at` and a ready account state;
- transition to `/map`, framed around the new nest;
- release of normal send, friends, inventory, collection, and map routes.

Success criteria:

- the real nest cannot be configured before tutorial completion;
- search text and exact clicked coordinates are never persisted;
- a completed player opens the map at the configured private nest.

## Milestone 46: Administrative Asset And Catalog Studio

Status: Planned.

Goal:

Allow authorized maintainers to add, inspect, edit, version, and activate official assets and
their type-safe catalog attributes.

Includes:

- an admin-only role, route, RPC boundary, and RLS policies;
- listing, search, filters, preview, usage references, lifecycle status, and revision history;
- upload to a private staging area in Supabase Storage;
- server validation of file signature, MIME type, dimensions, byte budget, metadata, and required
  translation keys;
- metadata editing constrained by the asset's discriminated type;
- immutable file versions: replacing an active file creates a new version rather than overwriting
  the published object;
- explicit activation after validation, atomic reference switching, archival, and rollback;
- prevention of destructive deletion while an asset version is referenced;
- editing of associated mascot, equipment, reward, item, navigation, map, and shop catalog rows.

Success criteria:

- untrusted users cannot read staging objects or mutate catalog records;
- a failed upload never affects the active game;
- every activation is attributable and reversible;
- the game reads only validated active versions.

## Milestone 47: Account Recovery And Production Readiness

Status: Planned.

Goal:

Harden the completed account and onboarding flow for production use.

Includes:

- email confirmation and generic resend behavior;
- password recovery and secure reset links;
- PWA/deep-link restoration;
- session refresh and expiration behavior;
- Supabase rate limits and abuse controls;
- RLS tests for anonymous, onboarding, ready, and admin identities;
- concurrency and idempotency tests for signup, mascot provisioning, tutorial collection, and
  nest completion;
- interruption tests for every onboarding stage;
- mobile installation-gate coverage;
- audit proving no runtime mocks or prototype users remain;
- operational documentation for local and remote resets, rollback, assets, and catalog changes.

Does not include:

- payments, premium-currency writes, trading, chat, exact public locations, public user uploads,
  social login, or real-time server tracking.

Success criteria:

- the complete new-player journey is recoverable, localized, secure, and production-reviewable;
- account lookup responses do not leak membership;
- reset and asset operations have explicit safeguards and rollback paths.

## Historical First Execution Order

The following order records how the initial prototype was bootstrapped. It is complete and must
not be interpreted as the current next-step list.

Use this order for the first development pass:

1. Project Foundation
2. Reusable UI Foundation
3. Mock Game Data
4. Mascot Detail Screen
5. Visual Polish Pass
6. Travel Calculation Utilities
7. Mini Route Preview
8. Responsive Polish

The prototype was reviewed after step 8 before the later milestones proceeded.

## First Review Questions

After the first mascot screen exists, review:

- Does this look like DUIF?
- Does it avoid generic website UI?
- Is the mascot emotionally appealing?
- Is the status of the mascot clear?
- Does the player know what to do next?
- Does the screen work on mobile?
- Does the mobile layout feel like the primary experience?
- Is the implementation lightweight?
- Can Codex safely continue from the structure?

## Later Review Questions

After send flow and rewards exist, review:

- Is sending correspondence fun?
- Is waiting understandable?
- Is returning rewarding?
- Does the player care which mascot they send?
- Are friends meaningful to the loop?
- Is there enough reason to customize?
- Is the next feature obvious?

## Long-Term Expansion

After the MVP is validated, possible expansions include:

- real authentication;
- persistent profiles;
- friend requests;
- received cards;
- push notifications;
- seasonal events;
- cosmetic shop;
- profile customization;
- inventory album completion;
- route discoveries;
- mascot evolution;
- richer map screen;
- backend reward validation;
- moderation tools.

## Deferred Features

Do not build these until the core loop is proven:

- full 3D globe;
- real-time multiplayer;
- public social feed;
- trading marketplace;
- paid shop;
- complex event system;
- real-time chat;
- route optimization;
- weather-based travel;
- GPS-precise features;
- advanced anti-cheat;
- native mobile app.

## Roadmap Success Criteria

The roadmap is successful if:

- each milestone is small and reviewable;
- Codex can execute tasks without broad ambiguity;
- the visual identity is validated early;
- the core game loop is tested before backend complexity;
- performance remains lightweight;
- the project can grow without major rewrites.
