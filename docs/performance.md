# Performance

This document records the first performance review for DUIF before backend, persistence, and real asset production.

## Current Baseline

Measured on the local production build during Milestone 15:

- JavaScript bundle: about `240K` raw in `dist/assets`.
- CSS bundle: about `40K` raw in `dist/assets`.
- Workbox runtime: about `24K` raw.
- PWA precache: `10` entries, about `907K`.
- Production `dist`: about `1.0M`.
- Public runtime assets: about `656K`.
- Original source app icon: about `2.9M`, `1254x1254`, kept outside `public/`.
- Generated runtime icons:
  - `icon-192.png`: about `72K`;
  - `icon-512.png`: about `500K`;
  - `apple-touch-icon.png`: about `64K`.

## Decisions

- Keep runtime dependencies limited and add heavier runtime libraries only when they validate a core product need.
- Keep large source images outside `public/` because Vite copies public assets directly into `dist`.
- Use exact-size generated PWA icons in the manifest and Apple touch metadata.
- Allow CSS gradients, paper textures, and small shadows as part of the postal notebook identity.
- Avoid heavy visual effects such as blur filters, backdrop filters, canvas rendering, and 3D until there is a clear product need.
- Keep animations limited to lightweight interaction polish, preferably `transform` and `opacity`.

## Audit Notes

- MapLibre GL JS is allowed for the real map validation milestone because the map is now a core mechanic.
- The MapLibre route is lazy-loaded so the large map runtime does not ship in the initial app shell.
- The validation map uses external public raster tiles plus lightweight DUIF GeoJSON layers;
  production still needs a tile/style provider decision.
- No 3D libraries, date libraries, animation libraries, or utility bundles are installed.
- No remote fetching, local persistence, polling, or animation loops are used in the current app.
- Existing CSS uses gradients and shadows for the paper style, but no expensive blur/backdrop-filter pattern was found.
- The main performance risk before this pass was the multi-megabyte app icon being copied into the production build.

## Milestone 27.75 Asset Slice

Measured after adding the first real art and typography slice:

- Public runtime assets: about `1.2M`.
- Production `dist`: about `3.0M`.
- PWA precache after Milestone 27.8 navigation icons: `32` entries, about `2.7M`.
- Main CSS bundles:
  - `index`: about `48K` raw;
  - `TravelMapPage`: about `78K` raw.
- Main JS bundles remain dominated by the app shell and lazy map chunk:
  - `index`: about `492K` raw;
  - `TravelMapPage`: about `1.07M` raw.

The added art slice stays within the current asset budget:

- mascot portraits: `59K` to `68K` each;
- friend mascot portrait: about `57K`;
- equipment icons: under `10K` each;
- reward thumbnails: `15K` to `16K` each;
- paper texture and postal marks: `4K` to `20K`;
- navigation icons: `44K` total, with each icon under `12K`;
- self-hosted fonts: about `88K` total.

Decisions:

- Keep the generated raster assets as a validation slice, not final art.
- Keep every individual runtime asset under `300K`.
- Keep `Caveat` and `Special Elite` unloaded until they are justified by a specific UI role.
- Continue treating MapLibre chunk size as a separate map-code-splitting concern.

## Future Checks

- Re-run a build-size review whenever real mascot portraits, item art, or textures are added.
- Prefer WebP for painted assets and keep PNG for transparency-sensitive icons only.
- Add route-level lazy loading only when the app grows enough for the initial bundle to justify it.
- Add custom update/offline UI only after the gameplay persistence model exists.
