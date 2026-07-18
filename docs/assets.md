# Assets

This document defines the first asset pipeline conventions for DUIF.

## Asset Timing Strategy

DUIF should not wait until the end to support assets, but it should wait to produce the
full final asset pack.

Use three phases:

1. Pipeline and fallbacks now.
   - Keep stable asset paths in data.
   - Keep `AssetImage` fallbacks working.
   - Use CSS placeholders for mascots, items, equipment, rewards, and map details.
   - Do not block gameplay or mobile UX work on final art.

2. Art direction slice before final polish.
   - Add a small number of real assets once the main flows feel stable.
   - Use these assets to validate emotion, silhouette, scale, and the postal identity.
   - Keep the slice intentionally small so design can still change.

3. Full asset pack near the MVP finish.
   - Produce broader variations, rarities, cosmetics, shop items, map art, and final icons.
   - Only expand the pack once gameplay, navigation, inventory, shop direction, and reward
     loops are clearer.

This avoids locking the visual direction too early while still making sure every screen can
accept real art without layout rewrites.

## Folder Conventions

Use stable public paths under `public/assets/`:

- `icons/` for app icons and small brand assets.
- `mascots/portraits/` for current player mascot portraits.
- `friends/mascots/` for friend mascot portraits.
- `items/thumbnails/` for inventory, reward, and collectible thumbnails.
- `equipment/icons/` for equipment icons.
- `navigation/` for small bottom-navigation icon assets.
- `currency/` for the standardized Stamp and Crystal balance icons.
- `textures/` for small paper or stamp textures.
- `maps/` for future lightweight map overlays, labels, stamps, or texture details.
- `stamps/` for reusable postal marks, cancellation marks, and collectible stamp art.

Keep asset names lowercase and hyphenated, such as `nuvem.webp` or `worn-route-stamp.webp`.

Keep large source files outside `public/` so they are not copied into the production build. Source-only app icons currently live under `assets-source/icons/`, while optimized runtime icons live under `public/assets/icons/`.

## Recommended Sizes

- Mascot portraits: `640x640` or smaller.
- Friend mascot portraits: `512x512` or smaller.
- Item thumbnails: `256x256` or smaller.
- Equipment icons: `192x192` or smaller.
- Navigation icons: `160x160` or smaller.
- Currency icons: SVG with a compact square view box when practical; raster fallback no
  larger than `128x128`.
- Sticker and stamp art: `256x256` or smaller unless it must be inspected in detail.
- Textures: tileable and as small as possible, usually `512x512` or smaller.
- PWA icons: keep generated runtime icons at the exact manifest sizes, such as `192x192`, `512x512`, and `180x180` for Apple touch icons.

Recommended runtime budgets:

- Single mascot portrait: ideally under `150KB`.
- Item, reward, sticker, or equipment thumbnail: ideally under `60KB`.
- Navigation icon: ideally under `30KB`.
- Currency icon: ideally under `15KB`.
- Small texture: ideally under `80KB`.
- Avoid any individual runtime asset above `300KB` without a performance review.
- Avoid adding more than `1MB` of new runtime assets in one milestone without a build-size
  note in `docs/performance.md`.

## Formats

- Prefer `webp` for painted or textured art.
- Prefer `avif` only after checking browser quality and decode cost for the specific asset.
- Use `png` only when transparency is important.
- Use `svg` for simple marks, stamps, labels, and UI-like vector shapes when it stays small
  and maintainable.
- Avoid large source files in the app repository.
- Never keep multi-megabyte source images in `public/`; Vite copies that folder directly into `dist`.
- Do not add multi-megabyte asset packs without a separate review.

Source files:

- Keep layered originals, high-resolution exports, prompts, and experiments outside
  `public/`.
- If source files are committed, place them under `assets-source/` and make sure they are
  not referenced by the runtime app.
- Runtime files must be optimized exports under `public/assets/`.

## Loading Rules

- Primary mascot portraits may use eager loading when they are above the fold.
- Secondary images, inventory thumbnails, equipment icons, and friend mascot portraits should use `loading="lazy"`.
- Every image surface must keep a CSS fallback so missing or failed assets never break layout.
- Do not rely on a single full-screen image for the UI.
- Do not preload large art until a route has proved it needs that asset immediately.
- Keep map tiles/provider assets separate from DUIF-owned static art decisions.

## Fallback Rules

Real assets are optional in the prototype. Components should render CSS placeholders when:

- the asset path is missing;
- the file has not been added yet;
- the browser fails to load the image.

This lets the team wire stable asset paths before final art production.

Fallback requirements:

- Mascot portrait fallback should preserve the mascot colors from `appearance`.
- Item/equipment fallback should still show name, rarity, category, and equipped/stored
  state.
- Reward fallback should still show rarity and collection status.
- Navigation fallback should keep the real button, visible label, and accessible
  `aria-label`; the image is decorative support, not the control itself.
- Missing images must not create layout shifts, empty boxes, or broken image icons.
- Any new asset-rendering component should support meaningful `alt` text or explicitly mark
  decorative images as decorative.

## Art Direction Slice

Before producing the final asset pack, create a small validation slice.

Milestone 27.75 added the first validation slice:

- Mascot portraits:
  - `public/assets/mascots/portraits/nuvem.webp` (`640x640`, about `59KB`);
  - `public/assets/mascots/portraits/trovao.webp` (`640x640`, about `68KB`);
  - `public/assets/mascots/portraits/pipoca.webp` (`640x640`, about `64KB`).
- Friend mascot portrait:
  - `public/assets/friends/mascots/aurora.webp` (`512x512`, about `57KB`).
- Equipment icons:
  - `canvas-postal-bag.webp`;
  - `blue-route-scarf.webp`;
  - `flight-goggles.webp`;
  - `urgent-badge.webp`.
- Route reward thumbnails:
  - `worn-route-stamp.webp`;
  - `blue-airmail-label.webp`;
  - `golden-compass-pin.webp`;
  - `atlantic-badge.webp`.
- Texture and marks:
  - `postal-paper-wash.webp`;
  - `postal-cancel-mark.webp`;
  - `route-doodle-mark.webp`.

The slice was generated as AI raster artwork, cropped from small concept sheets, and exported
as optimized WebP runtime files. The generated source sheets remain outside the runtime app
under the local Codex generated image directory.

Milestone 27.8 adds the first graphic navigation slice:

- `public/assets/navigation/nest.webp`;
- `public/assets/navigation/collection.webp`;
- `public/assets/navigation/map.webp`;
- `public/assets/navigation/friends.webp`;
- `public/assets/navigation/shop.webp`.

These icons are deliberately small `160x160` WebP assets, each under `30KB`. They are used as
decorative visual language inside real navigation buttons with visible labels and `aria-label`s.
Do not export the entire bottom navigation as one image; the button structure, focus state,
disabled state, and translated text must remain in HTML/CSS.

Milestone 30 adds a small read-only shop catalog slice:

- `public/assets/shop/thumbnails/crimson-courier-scarf.webp`;
- `public/assets/shop/thumbnails/meadow-post-cap.webp`;
- `public/assets/shop/thumbnails/sunny-route-sticker.webp`;
- `public/assets/shop/thumbnails/blue-envelope-sticker.webp`;
- `public/assets/shop/thumbnails/coastal-town-postcard.webp`;
- `public/assets/shop/thumbnails/lantern-festival-postcard.webp`;
- `public/assets/shop/thumbnails/brass-nest-plaque.webp`;
- `public/assets/shop/thumbnails/airmail-profile-ribbon.webp`.

These catalog thumbnails are AI-generated watercolor-and-ink assets exported as `256x256`
WebP files. They are prototype illustrations only: names, fictional prices, descriptions,
and accessible interactions remain in HTML and translated copy. Every thumbnail stays below
`60KB` and retains a CSS fallback in the shop UI.

The currency naming pass adds two code-native balance marks:

- `public/assets/currency/stamp.svg` for common-currency Selos/Stamps;
- `public/assets/currency/crystal.svg` for premium-currency Cristais/Crystals.

Both marks follow the visual rules in `docs/visual-direction.md`. They are decorative beside
an accessible localized currency name and must retain a lightweight CSS fallback.

Success criteria:

- Mascots feel emotionally appealing in the actual mobile UI.
- The app still feels lightweight after assets are added.
- The same assets work in mascot, map, reward, inventory, and friend contexts.
- CSS fallbacks remain intact when assets fail.

Do not include in the slice:

- full cosmetic catalog;
- shop inventory pack;
- seasonal/event packs;
- final custom map tiles;
- large background illustrations;
- generated variants for every rarity.

## Final Asset Pack

The final MVP asset pack should wait until the following are stable:

- mobile navigation and screen hierarchy;
- postal-base privacy model;
- correspondence content rules;
- route reward model;
- persisted inventory behavior;
- shop/economy direction;
- first visual feedback from the art direction slice.

The full pack can then include:

- mascot portrait variants;
- equipment/cosmetic variants;
- sticker and postcard sets;
- reward and rarity variants;
- shop item art;
- final app icons;
- optimized textures;
- production map overlays if the map direction requires them.

## Review Checklist

Before adding any runtime asset:

- Is the file in the correct `public/assets/` folder?
- Is the filename lowercase and hyphenated?
- Is the format appropriate for the visual type?
- Is the runtime size within budget?
- Does the component still have a fallback?
- Does the image have useful alt text when meaningful?
- Did `npm run build` keep the production bundle/assets reasonable?
- Does `docs/performance.md` need a note for a larger asset change?
