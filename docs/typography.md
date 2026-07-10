# Typography

This document defines the intended typography system for DUIF.

DUIF should use typography by role, not just one decorative font. The system should stay
mobile-readable first and add postal personality in controlled places.

## Typography Roles

Use four typography roles:

- UI/body font: readability for app text, labels, buttons, status, descriptions, inventory,
  and navigation.
- Display font: postal/editorial identity for mascot names, screen titles, collection
  headings, and major section titles.
- Handwritten font: sketchbook notes, short mascot comments, signatures, small map notes,
  and flavor text.
- Stamp font: postal stamps, codes, dates, delivery status labels, item rarity, receipts,
  and route labels.

Do not use decorative fonts for long paragraphs, dense data, or critical mobile controls.

## MVP Font Set

Start with two external fonts at most:

```css
:root {
  --font-ui: "Atkinson Hyperlegible", system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, serif;
  --font-hand: "Caveat", cursive;
  --font-stamp: "Special Elite", ui-monospace, monospace;
}
```

For the first implementation that loads external fonts, only load:

- `Atkinson Hyperlegible`
- `Fraunces`

Keep `Caveat` and `Special Elite` as planned roles, but do not load them until the UI proves
that handwritten notes and stamp text materially improve the experience.

## Recommended Fonts

### UI: Atkinson Hyperlegible

Use for:

- body copy;
- labels;
- buttons;
- status text;
- attributes;
- inventory;
- navigation;
- form fields.

Recommended weights:

- `400` for body text;
- `700` for labels, buttons, and compact interface emphasis.

Fallback:

```css
--font-ui: "Atkinson Hyperlegible", system-ui, sans-serif;
```

Good alternatives:

- `Nunito` for a softer and more rounded feel;
- `Lexend` for a modern high-legibility feel;
- `Quicksand` for friendly short headings;
- `Inter` only if the UI needs to become more neutral.

Default decision for DUIF: use `Atkinson Hyperlegible`.

### Display: Fraunces

Use for:

- mascot names;
- screen titles;
- important section titles;
- collection headings;
- secondary logo text;
- special correspondence moments.

Recommended weights:

- `700` for headings and sections;
- `900` for large mascot names and hero moments.

Fallback:

```css
--font-display: "Fraunces", Georgia, serif;
```

Good alternatives:

- `Literata` for a book/diary feeling;
- `Bree Serif` for a stronger friendly postal tone;
- `BioRhyme` for stamp and label emphasis;
- `Lora` for old-letter editorial elegance;
- `Young Serif` for vintage charm.

Default decision for DUIF: use `Fraunces`.

### Handwritten Notes: Caveat

Use only for short decorative text:

- small notes;
- labels that feel handwritten;
- mascot comments;
- signatures;
- map annotations;
- very short flavor text.

Recommended weight:

- `600` or `700`.

Fallback:

```css
--font-hand: "Caveat", cursive;
```

Good alternatives:

- `Patrick Hand` for cleaner notebook writing;
- `Kalam` for a more natural handwritten feel;
- `Patrick Hand SC` for drawn uppercase notes.

Default decision for DUIF: keep `Caveat` planned, but defer loading it until the art
direction slice.

### Stamp And Postal Marks: Special Elite

Use sparingly for:

- stamps;
- delivery codes;
- dates;
- receipt-like labels;
- item rarity;
- route labels;
- strong postal status labels such as "EM VIAGEM".

Fallback:

```css
--font-stamp: "Special Elite", ui-monospace, monospace;
```

Good alternatives:

- `BioRhyme` for strong labels and plaques;
- `Roboto Slab` for a more neutral stamp feel;
- `Courier Prime` for typed-letter moments.

Default decision for DUIF: keep `Special Elite` planned, but defer loading it until the art
direction slice.

## Loading Rules

- Use WOFF2 for runtime font files when self-hosting.
- Do not load every weight or style.
- Avoid more than two external families before the art direction slice.
- Prefer self-hosting final fonts under a future `public/assets/fonts/` convention once
  licensing and production choices are confirmed.
- Do not block first paint on decorative fonts.
- Critical body text must remain readable with system fallback fonts.

## CSS Token Plan

When real fonts are introduced, define tokens in `src/styles/theme.css`:

```css
:root {
  --font-ui: "Atkinson Hyperlegible", system-ui, sans-serif;
  --font-display: "Fraunces", Georgia, serif;
  --font-hand: "Caveat", cursive;
  --font-stamp: "Special Elite", ui-monospace, monospace;
}
```

Then apply them by role:

- `body`: `var(--font-ui)`;
- app navigation and controls: `var(--font-ui)`;
- mascot names and major headings: `var(--font-display)`;
- small notes and sketch annotations: `var(--font-hand)`;
- stamps, codes, and postal labels: `var(--font-stamp)`.

## Implementation Timing

Do not install or load external fonts immediately.

Recommended path:

1. Keep current system fonts while navigation, privacy, correspondence, map rewards, and
   persisted inventory continue to evolve.
2. Add `Atkinson Hyperlegible` and `Fraunces` in a typography polish milestone or as part of
   the art direction asset slice.
3. Validate mobile readability, layout shifts, bundle/build size, and visual identity.
4. Add `Caveat` and `Special Elite` only if short notes and postal marks need more identity.

## Review Checklist

Before adding a font:

- Is the font role clear?
- Is it used in enough places to justify the cost?
- Are only required weights loaded?
- Does mobile text remain readable?
- Does fallback rendering preserve layout?
- Does `npm run build` keep bundle and asset size acceptable?
- Does the font license allow the intended app usage?
