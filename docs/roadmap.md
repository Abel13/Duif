# Roadmap

This roadmap defines the initial execution plan for DUIF.

DUIF should be built in small, testable milestones. Each milestone should produce a working result that can be reviewed before moving to the next step.

The goal is to avoid building the full game too early. Start with the emotional and visual core: the mascot detail experience.

## Roadmap Principles

Build in this order:

1. Visual identity.
2. Mascot ownership.
3. Travel calculation.
4. Sending flow.
5. Social loop.
6. Inventory and collection.
7. PWA features.
8. Backend and persistence.
9. Economy and events.

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

## Suggested First Execution Order

Use this order for the first development pass:

1. Project Foundation
2. Reusable UI Foundation
3. Mock Game Data
4. Mascot Detail Screen
5. Visual Polish Pass
6. Travel Calculation Utilities
7. Mini Route Preview
8. Responsive Polish

Stop after step 8 and review the prototype before continuing.

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
