# Technical Decisions

This document describes the initial technical direction for DUIF.

The goal is to build a lightweight, maintainable PWA-style prototype for a social idle game about messenger animals.

The first implementation should focus on the mascot detail screen, mock game data, visual style, and travel logic foundations.

## Initial Technical Goal

The initial goal is not to build the full game.

The initial goal is to create a strong prototype foundation with:

- React application structure;
- TypeScript game types;
- reusable UI components;
- sketch postal visual system;
- mascot detail screen;
- mock data;
- travel calculation utilities;
- lightweight performance profile.

The codebase should remain easy to change as the game loop becomes clearer.

## Frontend Framework

Use:

Vite
React
TypeScript

Reasons:

- fast project setup;
- fast local development;
- simple build process;
- good fit for a PWA prototype;
- strong TypeScript support;
- less framework overhead than a full SSR application.

Do not use Next.js in the first prototype unless the project later needs server rendering, API routes, or production deployment features that justify the added complexity.

## Routing

Use:

react-router-dom

Reasons:

- simple client-side routing;
- good fit for a PWA;
- easy to add screens incrementally;
- avoids framework lock-in at this stage.

Initial routes can include:

/
/mascots/:mascotId

For the first prototype, it is acceptable for / to redirect to the first mascot detail screen.

## Styling

Use:

CSS Modules
Global CSS variables

Reasons:

- component-level style isolation;
- full control over the custom visual style;
- no dependency on a design framework;
- easier to avoid generic website UI;
- simple enough for the early codebase.

Global styles should live in:

src/styles/reset.css
src/styles/theme.css
src/styles/globals.css

Component styles should use colocated .module.css files.

Example:

src/components/ui/StampButton.tsx
src/components/ui/StampButton.module.css

## CSS Frameworks

Do not use Bootstrap, Material UI, Ant Design, Chakra UI, or similar component libraries in the first prototype.

Reason:

The app needs a highly custom visual identity. Generic component libraries will push the interface toward a normal website or dashboard.

Tailwind may be considered later, but CSS Modules are preferred initially because the visual style depends on custom component-specific details.

## Theme Tokens

Use CSS variables for design tokens.

Initial required variables:

--color-paper: #F7F1E3;
--color-paper-dark: #E8DDC7;
--color-ink: #2E2A24;
--color-postal-brown: #8B5E3C;
--color-postal-blue: #6F91A8;
--color-postal-red: #A44A3F;
--color-muted-green: #7A8F68;
--color-rare-gold: #C49A4A;

Supporting tokens should also exist for:

- spacing;
- radii;
- shadows;
- focus states;
- text sizes;
- animation timing;
- z-index layers.

## Animation

Use:

CSS transitions
Framer Motion when useful

Reasons:

- CSS is enough for most hover, press, and state transitions;
- Framer Motion is useful for page transitions, card movement, and small tactile interactions.

Animation rules:

- animate transform and opacity when possible;
- avoid animating width, height, top, left, or expensive filters;
- avoid excessive blur;
- support reduced motion where practical;
- keep motion subtle and quick.

Good animations:

- stamp press;
- card lift;
- paper tab selection;
- mascot idle movement;
- envelope reveal;
- route marker movement.

## State Management

Use local React state for the first prototype.

Do not add Redux, Zustand, Jotai, XState, or other state libraries yet.

Reasons:

- the initial prototype has mock data;
- premature global state would add complexity;
- the real state model may change after testing the gameplay loop.

A lightweight state library can be considered later when the app has:

- authentication;
- inventory;
- active deliveries;
- friends;
- notifications;
- backend synchronization.

## Data Layer

Use mock data only in the first prototype.

Mock data should live in:

src/game/mockData.ts

Game types should live in:

src/game/types.ts

Travel logic should live in:

src/game/travel.ts

Do not put core game calculations inside React components.

## Backend

Do not add a backend in the first visual prototype.

Later backend options:

Supabase
Node.js + Fastify/NestJS
PostgreSQL
Prisma

Recommended later path:

Use Supabase first if the goal is to move quickly with:

- authentication;
- PostgreSQL;
- storage;
- simple serverless functions;
- row-level security.

Use a custom Node backend later if the game needs:

- complex economy;
- advanced anti-cheat;
- queues;
- moderation systems;
- custom social graph logic;
- high control over game services.

## Authentication

Do not implement authentication in the first prototype.

When needed later, evaluate:

- Supabase Auth;
- passwordless email;
- OAuth providers;
- username-based friend discovery.

The first prototype should simulate a current user with mock data.

## Persistence

Do not add persistence in the first prototype.

No localStorage is required unless needed for small UI preferences.

Avoid building fake persistence that will be thrown away later.

## Game Simulation

Travel should be timestamp-based.

The system should not simulate movement continuously.

A delivery should store:

- origin coordinates;
- destination coordinates;
- distance;
- animal speed;
- outbound start time;
- outbound arrival time;
- return start time;
- return arrival time;
- current status;
- reward seed.

The UI calculates current progress from the current time.

This avoids:

- server-side ticking;
- unnecessary background jobs;
- real-time position updates;
- heavy client computation.

## Travel Calculations

Implement travel utilities in:

src/game/travel.ts

Required utilities later:

- haversineDistanceKm;
- estimateTravelDurationHours;
- getTravelProgress;
- getDeliveryStatus;
- clampProgress;
- formatRemainingTime.

The distance calculation can use the Haversine formula.

Use a game speed multiplier to keep travel times fun.

Example:

realisticDuration = distanceKm / speedKmh
gameDuration = realisticDuration / gameSpeedMultiplier

## Location and Privacy

Do not use precise player GPS in the first prototype.

Preferred location model:

- city-level coordinates;
- region-level coordinates;
- fictional postal bases;
- manually selected map locations.

Do not expose exact location to other players.

The visual map should communicate travel fantasy, not precise logistics.

## Map Strategy

Do not implement a full map system in the first mascot screen.

First map implementation should be a small route preview.

Recommended later stack:

React Simple Maps
d3-geo
SVG or TopoJSON map data

Reasons:

- lightweight;
- visually customizable;
- compatible with sketch style;
- avoids dependence on external map tile services;
- easier to make the world feel illustrated.

Avoid in the first prototype:

- Mapbox;
- MapLibre;
- Leaflet;
- Cesium;
- Three.js;
- full globe rendering;
- real map tiles.

These may be useful later, but they are not needed to validate the first loop.

## Asset Strategy

Do not build the UI as a single large image.

Use:

- HTML and CSS for layout;
- CSS for panels, shadows, paper cards, and tabs;
- SVG for simple icons, borders, stamps, route marks;
- optimized WebP or AVIF for mascot illustrations;
- small repeatable texture images;
- image placeholders until final art exists.

Asset folders:

public/assets/mascots
public/assets/equipment
public/assets/textures
public/assets/icons
public/assets/stamps
public/assets/maps

## Image Rules

When real assets are added:

- use WebP or AVIF for painted mascot art;
- use SVG for simple icons and UI marks;
- avoid large PNGs when possible;
- provide smaller thumbnails for sidebar cards;
- eager-load the main mascot portrait;
- lazy-load secondary and below-the-fold images;
- define image dimensions to reduce layout shift.

## PWA

Basic PWA setup is enabled with:

vite-plugin-pwa

The current PWA setup supports:

- manifest;
- placeholder app icons;
- installability;
- static asset caching;
- offline app shell.

The current icon is a placeholder using:

public/assets/icons/icon.png

This placeholder icon is referenced by the manifest but is not precached in the app shell because it is larger than the default Workbox precache limit.

Do not add large icon packs or generated image sets without a separate asset review.

Do not implement push notifications in the first prototype.

Do not implement background sync, backend API caching, or offline gameplay state yet.

## Notifications

Notifications are important for the long-term product because animals return after time passes.

However, do not implement notifications in the first prototype.

Later notification types:

- animal arrived;
- animal returned;
- friend sent a card;
- event reward available;
- seasonal event active.

Start with in-app status indicators before native or push notifications.

## Accessibility

Accessibility is a requirement, not a later polish task.

Rules:

- use semantic HTML;
- use real buttons for actions;
- preserve keyboard navigation;
- preserve visible focus states;
- use readable font sizes;
- maintain text contrast;
- do not rely only on color;
- use useful alt text for meaningful images;
- avoid motion-heavy interactions;
- support reduced motion where practical.

The sketch visual style must not reduce usability.

## Internationalization

The app should start with internationalization support.

Initial supported locales:

- `pt-BR`: default locale and primary writing language;
- `en-US`: secondary locale used to validate the structure early.

Do not hardcode visible UI copy directly inside React components.

Use a lightweight local translation structure first:

```txt
src/i18n/
  locales/
    pt-BR.ts
    en-US.ts
  index.ts
  types.ts
```

The first prototype does not need a full i18n library unless the translation needs become more complex.

Translation rules:

- keep translation keys in English;
- keep code identifiers in English;
- keep visible labels in locale files;
- use `pt-BR` as the fallback locale;
- make missing keys visible during development;
- translate accessibility labels, alt text, empty states, and status messages;
- review both `pt-BR` and `en-US` when building UI.

See `docs/internationalization.md` for the full i18n direction.

## Testing

Add testing after the first visual foundation is in place.

Recommended first testing target:

src/game/travel.ts

Use:

Vitest

Reason:

Game logic should be easy to verify independently from UI.

Initial tests should cover:

- distance calculation;
- duration calculation;
- progress clamping;
- delivery status transitions.

Do not spend early time snapshot-testing visual components.

## Code Quality

Use TypeScript strictly enough to catch mistakes.

Recommended practices:

- typed props;
- typed mock data;
- no any unless justified;
- small components;
- pure utility functions;
- no unused imports;
- no dead files;
- no business logic hidden in CSS or JSX;
- clear naming.

## Build Checks

Before considering a task done, run:

npm run build

If tests are added, also run:

npm test

The project should remain buildable after each Codex task.

## File Organization

Use this structure:

src/
app/
App.tsx
routes.tsx
components/
ui/
mascot/
map/
layout/
game/
types.ts
mockData.ts
travel.ts
i18n/
locales/
pt-BR.ts
en-US.ts
index.ts
types.ts
pages/
MascotDetailPage/
MascotDetailPage.tsx
MascotDetailPage.module.css
styles/
reset.css
theme.css
globals.css

Avoid placing everything in App.tsx.

## Component Rules

Reusable UI components should be generic.

Examples:

SketchPanel
StampButton
PaperTab
ItemCard

Mascot-specific components should be domain-specific.

Examples:

MascotSidebar
MascotPortrait
MascotStatsPanel
MascotTraitCard
MascotEquipmentGrid
MascotTravelCard
MascotSkillsPanel

Page components should compose smaller components.

## Naming Rules

Use clear English names for code.

Use translation keys for visible UI labels.

Examples:

Component name: MascotStatsPanel
Translation key: mascot.attributes
Visible `pt-BR` label: Atributos
Visible `en-US` label: Attributes

Avoid mixing Portuguese and English in code identifiers unless it refers to a proper name.

## Error Handling

The first prototype uses mock data, so error handling can be simple.

Still, components should handle:

- missing mascot;
- missing delivery;
- empty equipment;
- empty skills;
- unavailable image asset.

Avoid crashing when mock data changes.

## Security

No sensitive data should exist in the first prototype.

Do not include:

- API keys;
- map service tokens;
- private URLs;
- real player data;
- precise home coordinates.

Later, security will matter for:

- authentication;
- friend system;
- public profiles;
- abuse prevention;
- payments;
- inventory integrity.

## Performance Budget

The first mascot screen should feel lightweight.

Avoid:

- heavy JavaScript dependencies;
- full-screen image UI;
- Three.js;
- real map tiles;
- large unoptimized images;
- expensive filters;
- excessive rerenders.

Target:

- simple React components;
- small CSS files;
- small static assets;
- lazy-loaded secondary images later;
- no continuous animation loops unless necessary.

## Browser Support

Target modern mobile and desktop browsers with a mobile-first implementation.

Primary environment:

- mobile web;
- PWA-capable browsers;
- desktop browser during development.

Responsive rules:

- build the base layout for narrow mobile viewports first;
- use media queries to enhance tablet and desktop layouts;
- avoid desktop-only interaction patterns;
- keep primary actions reachable with one hand when practical;
- prevent horizontal overflow;
- validate important screens on mobile-sized and desktop-sized viewports before finishing.

Do not optimize for legacy browsers in the first prototype.

## Deployment

Do not decide final deployment yet.

Likely future options:

- Vercel;
- Netlify;
- Cloudflare Pages;
- Supabase hosting integration if applicable.

For now, focus on local prototype quality.

## Decisions Deferred

The following decisions are intentionally deferred:

- backend provider;
- authentication provider;
- database schema;
- payment provider;
- moderation system;
- push notification provider;
- real map provider;
- final asset pipeline;
- native app strategy;
- monetization model.

These should be decided only after the core loop and visual identity are validated.

## First Implementation Sequence

Recommended order:

1. Create project structure.
2. Add global styles and theme tokens.
3. Add reusable UI components.
4. Add game types and mock data.
5. Build mascot detail page.
6. Add travel utilities.
7. Add route preview.
8. Add responsive polish.
9. Add PWA setup.
10. Add real assets.

## Success Criteria

The technical foundation is successful if:

- the project builds reliably;
- the folder structure is clear;
- visual components are reusable;
- game data is typed;
- game logic is separated from UI;
- the mascot screen is responsive;
- the interface does not look generic;
- the app remains lightweight;
- Codex can understand and extend the project through AGENTS.md and docs.
