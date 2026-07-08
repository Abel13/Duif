export type Locale = "pt-BR" | "en-US";

export type TranslationDictionary = {
  app: {
    title: string;
  };
  common: {
    loading: string;
    unavailable: string;
  };
  home: {
    iconAlt: string;
    eyebrow: string;
    title: string;
    subtitle: string;
    noteLabel: string;
    noteTitle: string;
    noteBody: string;
  };
  navigation: {
    nest: string;
    letters: string;
    map: string;
    friends: string;
    shop: string;
  };
  mascot: {
    myMascots: string;
    level: string;
    attributes: string;
    speed: string;
    stamina: string;
    orientation: string;
    luck: string;
    specialTrait: string;
    equipment: string;
    traveling: string;
    skills: string;
    train: string;
    viewTrip: string;
  };
};

export type TranslationKey =
  | "app.title"
  | "common.loading"
  | "common.unavailable"
  | "home.eyebrow"
  | "home.iconAlt"
  | "home.title"
  | "home.subtitle"
  | "home.noteLabel"
  | "home.noteTitle"
  | "home.noteBody"
  | "navigation.nest"
  | "navigation.letters"
  | "navigation.map"
  | "navigation.friends"
  | "navigation.shop"
  | "mascot.myMascots"
  | "mascot.level"
  | "mascot.attributes"
  | "mascot.speed"
  | "mascot.stamina"
  | "mascot.orientation"
  | "mascot.luck"
  | "mascot.specialTrait"
  | "mascot.equipment"
  | "mascot.traveling"
  | "mascot.skills"
  | "mascot.train"
  | "mascot.viewTrip";
