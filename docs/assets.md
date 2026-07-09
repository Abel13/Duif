# Assets

This document defines the first asset pipeline conventions for DUIF.

## Folder Conventions

Use stable public paths under `public/assets/`:

- `icons/` for app icons and small brand assets.
- `mascots/portraits/` for current player mascot portraits.
- `friends/mascots/` for friend mascot portraits.
- `items/thumbnails/` for inventory, reward, and collectible thumbnails.
- `equipment/icons/` for equipment icons.
- `textures/` for small paper or stamp textures.

Keep asset names lowercase and hyphenated, such as `nuvem.webp` or `worn-route-stamp.webp`.

## Recommended Sizes

- Mascot portraits: `640x640` or smaller.
- Friend mascot portraits: `512x512` or smaller.
- Item thumbnails: `256x256` or smaller.
- Equipment icons: `192x192` or smaller.
- Textures: tileable and as small as possible, usually `512x512` or smaller.

## Formats

- Prefer `webp` for painted or textured art.
- Use `png` only when transparency is important.
- Avoid large source files in the app repository.
- Do not add multi-megabyte asset packs without a separate review.

## Loading Rules

- Primary mascot portraits may use eager loading when they are above the fold.
- Secondary images, inventory thumbnails, equipment icons, and friend mascot portraits should use `loading="lazy"`.
- Every image surface must keep a CSS fallback so missing or failed assets never break layout.
- Do not rely on a single full-screen image for the UI.

## Fallback Rules

Real assets are optional in the prototype. Components should render CSS placeholders when:

- the asset path is missing;
- the file has not been added yet;
- the browser fails to load the image.

This lets the team wire stable asset paths before final art production.
