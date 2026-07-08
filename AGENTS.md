# AGENTS.md

## Project

DUIF is a PWA-style web game prototype.

The game is a social idle game where players own messenger animals that deliver letters, cards, stickers, and collectible items across the world.

Each player starts with 3 messenger animals. Each animal has its own speed, attributes, equipment, visual customization, level, and travel status.

The initial prototype focuses on the mascot detail screen and the game's visual identity.

## Product Vision

The game should feel like a social postal adventure.

Players should be able to:

- View their messenger animals.
- Send letters or items to friends.
- See animals travel from origin to destination and return.
- Collect items found during travels.
- Customize animals with cosmetic equipment.
- Visit friends' profiles and see their mascots.

Do not build the full product yet. Build only the current requested feature.

## Current Milestone

Build the first polished prototype screen:

- Mascot detail page.
- Mock data only.
- No backend.
- No authentication.
- No payments.
- No real-time multiplayer.
- No full map system yet.

## Tech Stack

Use:

- React
- TypeScript
- Vite
- CSS Modules
- React Router
- Framer Motion, only when animation adds value

Do not introduce new dependencies without explaining why.

## Architecture Rules

Use this folder structure:

```txt
src/
  app/
  components/
    ui/
    mascot/
    map/
    layout/
  game/
  i18n/
    locales/
  pages/
  styles/
```

Rules:

- Keep components small and focused.
- Keep game logic outside UI components.
- Put reusable UI components in `src/components/ui`.
- Put mascot-specific components in `src/components/mascot`.
- Put game types and mock data in `src/game`.
- Put page-level components in `src/pages`.
- Use TypeScript types for all game entities.
- Avoid large components with too many responsibilities.

## Visual Direction

The app should look like an illustrated postal notebook.

Keywords:

- sketch
- hand-drawn
- postal notebook
- paper cards
- stamps
- envelopes
- old maps
- animal profile cards
- collectible album
- soft ink
- worn paper
- gentle watercolor

The UI should feel like objects from the game world, not like a generic website.

## Important Visual Constraints

Do not use:

- Emojis.
- Generic blue website buttons.
- Default browser-looking buttons.
- Generic SaaS cards.
- Generic dashboard layout.
- Heavy gradients.
- Glassmorphism.
- Neon colors.
- Overly modern corporate UI.

Prefer:

- Paper panels.
- Stamp-like buttons.
- Torn paper tabs.
- Sketch borders.
- Tape corners.
- Postal labels.
- Cardboard tags.
- Inventory cards.
- Notebook page layout.

## Color Palette

Use CSS variables for this palette:

```css
--color-paper: #f7f1e3;
--color-paper-dark: #e8ddc7;
--color-ink: #2e2a24;
--color-postal-brown: #8b5e3c;
--color-postal-blue: #6f91a8;
--color-postal-red: #a44a3f;
--color-muted-green: #7a8f68;
--color-rare-gold: #c49a4a;
```

## Typography

Use system fonts for now.

Do not import external fonts yet.

The final design may later use:

- one readable body font;
- one hand-drawn display font.

For now, simulate the style with spacing, uppercase labels, letter spacing, borders, and layout.

## Performance Rules

The app must remain lightweight.

Do not:

- Use a full-screen image as the UI.
- Use heavy canvas rendering for static UI.
- Use Three.js.
- Use map tiles in the mascot page.
- Use expensive blur filters.
- Animate layout properties like width, height, top, or left.
- Add large image assets.

Prefer:

- HTML and CSS for layout.
- CSS variables for theme.
- SVG for simple icons and marks.
- Small reusable image assets.
- WebP or AVIF later for painted illustrations.
- Transform and opacity for animations.

## Accessibility Rules

- Use semantic HTML.
- Use real button elements for actions.
- Preserve visible focus states.
- Keep text readable.
- Do not rely only on color to communicate state.
- Interactive targets should be comfortable on mobile.
- Images should have useful alt text when meaningful.

## Mobile-First Rules

DUIF should be designed and implemented mobile first.

Mobile web is the primary experience.

Desktop should enhance the same experience with more space, not define the base layout.

Rules:

- Start layouts from the narrow mobile viewport.
- Use responsive CSS to progressively adapt to tablet and desktop.
- Keep primary actions reachable on mobile.
- Keep tap targets comfortable.
- Avoid horizontal scrolling.
- Avoid dense dashboard layouts that only work on desktop.
- Test important screens on mobile-sized and desktop-sized viewports before finishing.

## Language

The app should start with internationalization support.

Use:

- `pt-BR` as the default locale.
- `en-US` as the secondary initial locale.

Visible UI copy should come from translation files, not from hardcoded JSX strings.

Keep code identifiers and translation keys in English.

Keep visible labels translated per locale.

Use labels such as:

- Meus Mascotes
- Nível
- Atributos
- Velocidade
- Resistência
- Orientação
- Sorte
- Traço Especial
- Equipamento
- Em Viagem
- Habilidades
- Treinar
- Ver Viagem
- Ninho
- Cartas
- Mapa
- Amigos
- Loja

## Game Data Rules

Use mock data only.

Initial mascots:

- Nuvem
- Trovão
- Pipoca

Animals should have:

- id
- name
- species
- level
- xp
- nextLevelXp
- attributes
- trait
- equipment
- skills
- currentDelivery

Do not add persistence yet.

## Code Quality

Before finishing any task:

- Run TypeScript checks if available.
- Run the build if available.
- Fix lint or type errors.
- Avoid unused files.
- Avoid unused imports.
- Keep naming consistent.
- Explain what changed briefly.

## First Implementation Target

The first target is a visually polished mascot detail page using mock data.

The page should include:

- Left mascot selector.
- Main mascot portrait area.
- Mascot name and species.
- Level and XP panel.
- Attributes panel.
- Special trait card.
- Equipment grid.
- Current delivery card.
- Visual customization preview.
- Skills panel.
- Bottom navigation as paper tabs.

Use placeholder visual blocks until real art assets are available.
