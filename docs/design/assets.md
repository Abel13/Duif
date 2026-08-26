# Assets

## Catálogos editoriais

O snapshot documental de 25 de agosto de 2026 está dividido em três documentos de revisão:

- [inventário mestre e dívida visual](asset-inventory.md);
- [catálogo visual regional proposto](regional-visual-catalog.md);
- [catálogo proposto de 50 marcos mundiais](world-landmark-catalog.md).

Eles registram o estado observado e propostas futuras, mas não substituem o Official Asset
Registry como fonte do runtime. Uma entrada `proposta` não está aprovada para produção.

Para a produção ilustrada futura:

- cartões devem ser ilustrações rasterizadas em WebP 3:2;
- selos regionais e marcos devem ser WebP com fundo transparente;
- marcos usam apresentação de sticker ilustrado, com recorte orgânico, borda clara de papel e
  silhueta reconhecível, conforme o [catálogo mundial](world-landmark-catalog.md), sem se tornarem
  adesivos de correspondência ou itens de inventário;
- cada Lugar Memorável exige um par de assets antes da publicação: sticker transparente para o
  mapa e frente de cartão postal WebP 3:2. Publicar somente um deles deixa o lugar incompleto;
- nenhuma dessas ilustrações novas deve ser produzida em SVG;
- cada asset precisa de brief aprovado antes da criação, com composição, referências permitidas,
  licença/origem, dimensões, orçamento, área segura e alt text;
- todo lote deve ser pequeno, validado nos tamanhos e superfícies reais e submetido a aprovação
  humana entre catálogo, geração, otimização e publicação;
- nenhuma arte deve ser publicada ou integrada apenas porque aparece nos catálogos editoriais.

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
- `mascots/portraits/` for every official mascot portrait, independent of ownership or surface.
- `items/thumbnails/` for inventory, reward, and collectible thumbnails.
- `equipment/icons/` for equipment icons.
- `navigation/` for small bottom-navigation icon assets.
- `currency/` for the standardized Stamp and Crystal balance icons.
- `textures/` for small paper or stamp textures.
- `maps/` for future lightweight map overlays, labels, stamps, or texture details.
- `stamps/` for reusable postal marks, cancellation marks, and collectible stamp art.
- `tutorial/postcards/` for the larger, inspectable tutorial postcard artwork.
- `postcards/landmarks/` for 3:2 postcard fronts paired with Lugares Memoráveis.
- `tutorial/stamps/` for tutorial-only collectible seals.
- `nest/` for modular Ninho hub artwork.

Keep asset names lowercase and hyphenated, such as `nuvem.webp` or `worn-route-stamp.webp`.

Keep large source files outside `public/` so they are not copied into the production build. Source-only app icons currently live under `assets-source/icons/`, while optimized runtime icons live under `public/assets/icons/`.

## Ninho Hub Artwork

The Ninho hub uses modular WebP illustrations under
`public/assets/nest/`:

- `profile-nook.webp` for the personal profile entry;
- `mascot-roost.webp` for the mascot entry;
- `mailbox.webp` for the mailbox entry.
- `available-jobs.webp` for the available postal jobs entry.

They are registered as active `nestArtwork` assets at version 1, are intentionally decorative
(`alt=""`), and retain the CSS paper fallback if the official manifest or file is unavailable.
Their respective optimized sizes are 51 KB, 57 KB, and 45 KB, within the 80 KB `nestArtwork`
budget.

`public/assets/profile/default-silhouette.webp` is the official neutral default avatar. It is a
`256×256`, 6.5 KB WebP registered as `profile.avatar.defaultSilhouette`; it has localized alt
text and is used by the Ninho and the owner-only Profile page.

The current PWA icon family is derived from `assets-source/icons/duif-icon-transparent.png`:

- `icon-192.png` and `icon-512.png` preserve transparency for regular browser and PWA use;
- `icon-maskable-512.png` uses the paper background and a safe inset for adaptive masks;
- `apple-touch-icon.png` uses an opaque paper background for iOS.

`public/assets/fonts/caveat-400-600-latin.woff2` and
`public/assets/fonts/caveat-400-600-latin-ext.woff2` are the local Caveat subsets used only by
postcard writing: Regular for messages and SemiBold for postcard highlights. They remain outside
the official asset registry, alongside the application fonts required during boot.

## Recommended Sizes

- Mascot portraits: `640x640` or smaller.
- Friend mascot portraits: `512x512` or smaller.
- Item thumbnails: `256x256` or smaller.
- Equipment icons: `192x192` or smaller.
- Navigation icons: `160x160` or smaller.
- Currency icons: SVG with a compact square view box when practical; raster fallback no
  larger than `128x128`.
- Sticker and stamp art: `256x256` or smaller unless it must be inspected in detail.
- Postcard artwork: up to `1024x683` (3:2), with a reviewed budget up to `180KB`.
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
  note in `docs/architecture/performance.md`.

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

## Official Registry And Administration

The official registry stores gameplay and illustrated UI art through stable typed keys and immutable
versions. Current versions remain packaged under `public/assets/`; the schema already discriminates
packaged and future Storage locations. Runtime screens load one active public manifest and never
persist or construct free-form art paths.

The audited local registry contains 64 identities: 62 with an active version, while
`currency.icon.stamp` and `postalMark.routeDoodle` are only archived. The latter still has its
historical file in the repository. The production registry must be
checked independently; the prestige-path drift found by the audit is repaired by a later,
idempotent migration recorded in the [asset inventory](asset-inventory.md). PWA icons, the brand
logo, and fonts remain outside the
runtime registry because they must work before Supabase, authentication, or onboarding has loaded.

The administrative flow provides `/admin/assets` to accounts with the server-verified `duif_role=admin` app
metadata. It uploads new files to private staging, validates them in the `asset-studio` Edge
Function, and publishes immutable Storage versions without overwriting an active object. See
[`asset-studio.md`](../operations/asset-studio.md) for the bootstrap and publishing runbook.

The administrative studio may edit metadata only through the schema for that asset type. It must
validate file signature, MIME type, dimensions, byte budget, required translation keys, usage
references, and administrative authorization before activation. Runtime clients read active
versions only and retain CSS fallbacks.

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

The first art-direction validation slice added:

- Mascot portraits:
  - `public/assets/mascots/portraits/nuvem.webp` (`640x640`, about `59KB`);
  - `public/assets/mascots/portraits/trovao.webp` (`640x640`, about `68KB`);
  - `public/assets/mascots/portraits/pipoca.webp` (`640x640`, about `64KB`).
- Additional official mascot portrait:
  - `public/assets/mascots/portraits/aurora.webp` (`512x512`, about `57KB`).
- Equipment icons:
  - `canvas-postal-bag.webp`;
  - `blue-route-scarf.webp`;
  - `flight-goggles.webp`;
  - `urgent-badge.webp`.
  - `feather-charm.webp` (`192x192`, about `6KB`);
  - `small-satchel.webp` (`192x192`, about `8KB`);
  - `travel-cap.webp` (`192x192`, about `8KB`).
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

The tutorial collection uses:

- `public/assets/tutorial/postcards/inaugural-front.webp` (`1024x683`, about `151KB`), the
  watercolor front of the Cartão Inaugural; its seal and completion postmark are rendered in
  HTML so the date remains localized and authoritative.
- `public/assets/tutorial/stamps/first-journey.webp` (`256x256`, about `16KB`), a transparent
  Selo de Primeira Viagem reused on both sides of the card.

The postcard catalog includes `public/assets/postcards/duif-base.webp` (`900x600`, about `153KB`), the
permanent simple DUIF base postcard registered as `postcard.base.front`. City postcard art is
intentionally deferred to its dedicated production plan.

The permanent default postal stamp uses `public/assets/stamps/duif-default.webp` (`172x256`, about
`23KB`), registered as `stamp.default.front`. Its traditional perforated-paper silhouette and
watercolor messenger illustration match the correspondence composer and are not based on a real
postal operator's issued stamp.

The first graphic navigation slice includes:

- `public/assets/navigation/nest.webp`;
- `public/assets/navigation/collection.webp`;
- `public/assets/navigation/map.webp`;
- `public/assets/navigation/friends.webp`;
- `public/assets/navigation/shop.webp`.

These icons are deliberately small `160x160` WebP assets, each under `30KB`. They are used as
decorative visual language inside real navigation buttons with visible labels and `aria-label`s.
Do not export the entire bottom navigation as one image; the button structure, focus state,
disabled state, and translated text must remain in HTML/CSS.

The read-only shop catalog slice includes:

- `public/assets/shop/thumbnails/crimson-courier-scarf.webp`;
- `public/assets/shop/thumbnails/meadow-post-cap.webp`;
- `public/assets/shop/thumbnails/sunny-route-sticker.webp`;
- `public/assets/shop/thumbnails/blue-envelope-sticker.webp`;
- `public/assets/shop/thumbnails/coastal-town-postcard.webp`;
- `public/assets/shop/thumbnails/lantern-festival-postcard.webp`;
- `public/assets/shop/thumbnails/brass-nest-plaque.webp`;
- `public/assets/shop/thumbnails/airmail-profile-ribbon.webp`.

These catalog assets are AI-generated watercolor-and-ink WebPs. Stickers and ornaments use
transparent `256x256` canvases; postcards use their complete `1200x800` (3:2) artwork. Names,
prices, descriptions, and accessible interactions remain in HTML and translated copy.

Currency balances use the Phosphor `CoffeeBean` icon for Sementes/Seeds and `SketchLogo` for
Cristais/Crystals. The retired packaged SVG versions remain archived only in the Registry.
Both icons are decorative beside an accessible localized currency name.

The active tutorial item is:

- `public/assets/items/active/first-journey-boost.webp` (`192x192`, about `9KB`), registered as
  `activeItem.firstJourneyBoost`.

It is an isolated watercolor postal seal with a transparent background. The tutorial displays it
as the first-journey boost at the middle-right edge of the map; its accessible name remains the
localized “First journey boost” label rather than text baked into the artwork.

The guided map uses four code-native controls:

- `public/assets/map/controls/overview.webp`;
- `public/assets/map/controls/mascot.webp`;
- `public/assets/map/controls/origin.webp`;
- `public/assets/map/controls/destination.webp`.

The `256x256` watercolor-and-ink illustrations use the existing postal palette and replace
visible control text without removing localized `aria-label` and tooltip text. Each button
retains a CSS fallback mark.

The guided map now also includes two watercolor route pins:

- `public/assets/map/pins/nest.webp` for the route origin;
- `public/assets/map/pins/destination.webp` for the delivery destination.

Both are transparent `256x256` WebP assets under `15KB`, anchored to their real route
coordinates. They remain non-interactive map decoration with localized accessible labels and
a CSS fallback if an image fails to load.

The public postal-traffic set includes three portraits:

- `public/assets/mascots/portraits/maple.webp`;
- `public/assets/mascots/portraits/bento.webp`;
- `public/assets/mascots/portraits/oliva.webp`.

The AI-generated watercolor-and-ink portraits are `640x640` WebP files.
They use an integrated paper background, remain safe inside circular map crops, and retain the
same CSS fallback used by the traffic list and detail panel. Aurora continues using her existing
official portrait.

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
- Does `docs/architecture/performance.md` need a note for a larger asset change?
