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

- Keep runtime dependencies limited to React, React DOM, and React Router while the prototype remains local/mock-only.
- Keep large source images outside `public/` because Vite copies public assets directly into `dist`.
- Use exact-size generated PWA icons in the manifest and Apple touch metadata.
- Allow CSS gradients, paper textures, and small shadows as part of the postal notebook identity.
- Avoid heavy visual effects such as blur filters, backdrop filters, map tiles, canvas rendering, and 3D until there is a clear product need.
- Keep animations limited to lightweight interaction polish, preferably `transform` and `opacity`.

## Audit Notes

- No map libraries, 3D libraries, date libraries, animation libraries, or utility bundles are installed.
- No remote fetching, local persistence, polling, or animation loops are used in the current app.
- Existing CSS uses gradients and shadows for the paper style, but no expensive blur/backdrop-filter pattern was found.
- The main performance risk before this pass was the multi-megabyte app icon being copied into the production build.

## Future Checks

- Re-run a build-size review whenever real mascot portraits, item art, or textures are added.
- Prefer WebP for painted assets and keep PNG for transparency-sensitive icons only.
- Add route-level lazy loading only when the app grows enough for the initial bundle to justify it.
- Add custom update/offline UI only after the gameplay persistence model exists.
