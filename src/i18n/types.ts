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
    demo: {
      actionsLabel: string;
      primaryAction: string;
      secondaryAction: string;
      tabsLabel: string;
      cardsLabel: string;
      firstCardLabel: string;
      firstCardTitle: string;
      firstCardDescription: string;
      firstCardMeta: string;
      secondCardLabel: string;
      secondCardTitle: string;
      secondCardDescription: string;
      secondCardMeta: string;
    };
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
  species: {
    carrierPigeon: string;
    messengerFalcon: string;
    mailDuck: string;
  };
  traits: {
    steadyRoute: {
      name: string;
      description: string;
    };
    directFlight: {
      name: string;
      description: string;
    };
    curiousFinder: {
      name: string;
      description: string;
    };
  };
  equipment: {
    rarity: {
      common: string;
      uncommon: string;
      rare: string;
    };
    canvasPostalBag: {
      name: string;
      description: string;
    };
    blueRouteScarf: {
      name: string;
      description: string;
    };
    flightGoggles: {
      name: string;
      description: string;
    };
    urgentBadge: {
      name: string;
      description: string;
    };
    travelCap: {
      name: string;
      description: string;
    };
    featherCharm: {
      name: string;
      description: string;
    };
    smallSatchel: {
      name: string;
      description: string;
    };
  };
  skills: {
    longRoute: {
      name: string;
      description: string;
    };
    softLanding: {
      name: string;
      description: string;
    };
    quickDispatch: {
      name: string;
      description: string;
    };
    crosswindInstinct: {
      name: string;
      description: string;
    };
    shinyThing: {
      name: string;
      description: string;
    };
    happyDetour: {
      name: string;
      description: string;
    };
  };
  delivery: {
    status: {
      available: string;
      preparing: string;
      outbound: string;
      delivered: string;
      returning: string;
      returned: string;
      completed: string;
    };
  };
  locations: {
    saoPaulo: string;
    lisbon: string;
  };
  appearance: {
    nuvemPortrait: string;
    trovaoPortrait: string;
    pipocaPortrait: string;
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
  | "home.demo.actionsLabel"
  | "home.demo.primaryAction"
  | "home.demo.secondaryAction"
  | "home.demo.tabsLabel"
  | "home.demo.cardsLabel"
  | "home.demo.firstCardLabel"
  | "home.demo.firstCardTitle"
  | "home.demo.firstCardDescription"
  | "home.demo.firstCardMeta"
  | "home.demo.secondCardLabel"
  | "home.demo.secondCardTitle"
  | "home.demo.secondCardDescription"
  | "home.demo.secondCardMeta"
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
  | "mascot.viewTrip"
  | "species.carrierPigeon"
  | "species.messengerFalcon"
  | "species.mailDuck"
  | "traits.steadyRoute.name"
  | "traits.steadyRoute.description"
  | "traits.directFlight.name"
  | "traits.directFlight.description"
  | "traits.curiousFinder.name"
  | "traits.curiousFinder.description"
  | "equipment.rarity.common"
  | "equipment.rarity.uncommon"
  | "equipment.rarity.rare"
  | "equipment.canvasPostalBag.name"
  | "equipment.canvasPostalBag.description"
  | "equipment.blueRouteScarf.name"
  | "equipment.blueRouteScarf.description"
  | "equipment.flightGoggles.name"
  | "equipment.flightGoggles.description"
  | "equipment.urgentBadge.name"
  | "equipment.urgentBadge.description"
  | "equipment.travelCap.name"
  | "equipment.travelCap.description"
  | "equipment.featherCharm.name"
  | "equipment.featherCharm.description"
  | "equipment.smallSatchel.name"
  | "equipment.smallSatchel.description"
  | "skills.longRoute.name"
  | "skills.longRoute.description"
  | "skills.softLanding.name"
  | "skills.softLanding.description"
  | "skills.quickDispatch.name"
  | "skills.quickDispatch.description"
  | "skills.crosswindInstinct.name"
  | "skills.crosswindInstinct.description"
  | "skills.shinyThing.name"
  | "skills.shinyThing.description"
  | "skills.happyDetour.name"
  | "skills.happyDetour.description"
  | "delivery.status.available"
  | "delivery.status.preparing"
  | "delivery.status.outbound"
  | "delivery.status.delivered"
  | "delivery.status.returning"
  | "delivery.status.returned"
  | "delivery.status.completed"
  | "locations.saoPaulo"
  | "locations.lisbon"
  | "appearance.nuvemPortrait"
  | "appearance.trovaoPortrait"
  | "appearance.pipocaPortrait";
