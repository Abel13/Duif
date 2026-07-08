import type { TranslationDictionary } from "../types";

export const enUS = {
  app: {
    title: "DUIF",
  },
  common: {
    loading: "Loading",
    unavailable: "Unavailable",
  },
  home: {
    iconAlt: "DUIF icon",
    eyebrow: "Postal prototype",
    title: "DUIF",
    subtitle:
      "A postal notebook for messenger mascots, thoughtful deliveries, and small discoveries around the world.",
    noteLabel: "Initial project note",
    noteTitle: "Foundation ready to begin",
    noteBody:
      "The first real screen will be built after the visual base, reusable components, and mock data are in place.",
    demo: {
      actionsLabel: "Demo actions",
      primaryAction: "Prepare delivery",
      secondaryAction: "View notebook",
      tabsLabel: "Demo navigation",
      cardsLabel: "Demo collectible cards",
      firstCardLabel: "Rare stamp",
      firstCardTitle: "Welcome letter",
      firstCardDescription:
        "A paper card for validating the collectible style before the mascot screen.",
      firstCardMeta: "Visual base",
      secondCardLabel: "Common item",
      secondCardTitle: "Route label",
      secondCardDescription:
        "A simple postal marker for testing cards, states, and longer mobile text.",
      secondCardMeta: "Initial mock",
    },
  },
  navigation: {
    nest: "Nest",
    letters: "Letters",
    map: "Map",
    friends: "Friends",
    shop: "Shop",
  },
  mascot: {
    myMascots: "My Mascots",
    level: "Level",
    attributes: "Attributes",
    speed: "Speed",
    stamina: "Stamina",
    orientation: "Orientation",
    luck: "Luck",
    specialTrait: "Special Trait",
    equipment: "Equipment",
    traveling: "Traveling",
    skills: "Skills",
    train: "Train",
    viewTrip: "View Trip",
  },
} satisfies TranslationDictionary;
