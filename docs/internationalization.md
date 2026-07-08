# Internationalization

DUIF should start as a multilingual app from the first implementation.

The first supported locales are:

- `pt-BR`: default locale and primary writing language.
- `en-US`: secondary locale used to validate the translation structure early.

The app should not ship its first screens with hardcoded visible UI text inside React components.

## Goals

Internationalization should help the project:

- support Portuguese and English from the beginning;
- keep visible UI copy centralized;
- avoid expensive rewrites when more screens are added;
- make UI components reusable without embedding language-specific text;
- keep game terminology consistent across locales;
- make future community, event, and store copy easier to translate.

## Initial Scope

The first prototype should include:

- locale definitions for `pt-BR` and `en-US`;
- a typed translation key structure;
- a lightweight translation helper or hook;
- visible UI labels loaded from translation files;
- a simple locale selection strategy;
- fallback to `pt-BR` when a key or locale is missing.

The first prototype does not need:

- a full localization management platform;
- remote translation loading;
- translation CMS integration;
- machine translation;
- pluralization for complex economies;
- right-to-left language support;
- date, currency, or number localization beyond simple formatting helpers.

## Recommended Structure

Use this structure when the app is created:

```txt
src/
  i18n/
    locales/
      pt-BR.ts
      en-US.ts
    index.ts
    types.ts
```

The locale files should export plain typed objects.

Example shape:

```ts
export const ptBR = {
  navigation: {
    nest: "Ninho",
    letters: "Cartas",
    map: "Mapa",
    friends: "Amigos",
    shop: "Loja",
  },
  mascot: {
    myMascots: "Meus Mascotes",
    level: "Nível",
    attributes: "Atributos",
    speed: "Velocidade",
    stamina: "Resistência",
    orientation: "Orientação",
    luck: "Sorte",
    specialTrait: "Traço Especial",
    equipment: "Equipamento",
    traveling: "Em Viagem",
    skills: "Habilidades",
    train: "Treinar",
    viewTrip: "Ver Viagem",
  },
} as const;
```

`en-US` should mirror the same keys.

## Locale Rules

- Use `pt-BR` as the default locale.
- Keep translation keys in English.
- Keep code identifiers in English.
- Keep visible UI labels in locale files.
- Do not use Portuguese strings directly inside component JSX.
- Do not use English strings directly inside component JSX unless they come from `en-US`.
- Keep mascot proper names unchanged across locales unless a future localization decision says otherwise.
- Keep species names translatable because they are visible copy.

## Translation Keys

Keys should be grouped by product area.

Recommended groups:

- `common`
- `navigation`
- `mascot`
- `attributes`
- `equipment`
- `delivery`
- `inventory`
- `friends`
- `rewards`
- `errors`

Prefer clear semantic keys:

- `mascot.specialTrait`
- `delivery.currentStatus`
- `navigation.friends`

Avoid presentation-specific keys:

- `blueButtonText`
- `leftPanelTitle`
- `bigHeaderLabel`

## Formatting

Centralize formatting helpers when needed.

Future helpers may include:

- distance formatting;
- remaining time formatting;
- date formatting;
- reward quantity formatting;
- XP and level formatting.

Do not scatter formatting rules across UI components.

## Fallback Behavior

The app should gracefully handle missing translations.

Rules:

- fall back to `pt-BR` when a locale is unsupported;
- fall back to the `pt-BR` key when a translation is missing;
- make missing keys visible during development;
- avoid crashing the UI because of a missing label.

## Copy Tone

`pt-BR` is the source tone for the product.

The tone should be:

- warm;
- calm;
- charming;
- collectible;
- lightly playful;
- not childish;
- not corporate.

`en-US` should preserve the same feeling rather than translating literally when that would sound stiff.

## Accessibility

Internationalization must support accessibility.

Translate:

- button labels;
- aria labels;
- image alt text;
- status messages;
- form labels;
- validation messages;
- empty states.

Do not leave accessibility-only copy hardcoded in one language.

## Testing and Review

When building UI, review at least `pt-BR` and `en-US`.

Check that:

- translated text fits buttons, tabs, and cards;
- longer English strings do not break layouts;
- accented Portuguese text renders correctly;
- no visible UI copy is hardcoded in components;
- fallback behavior is predictable.

## Future Expansion

Possible future locales:

- `es-ES`
- `es-MX`
- `fr-FR`

Add new locales only after the translation key structure is stable enough to avoid churn.
