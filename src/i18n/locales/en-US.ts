import type { TranslationDictionary } from "../types";

export const enUS = {
  app: {
    title: "DUIF",
  },
  common: {
    loading: "Loading",
    unavailable: "Unavailable",
  },
  units: {
    kilometers: "km",
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
    xp: "XP",
    attributes: "Attributes",
    speed: "Speed",
    stamina: "Stamina",
    orientation: "Orientation",
    luck: "Luck",
    specialTrait: "Special Trait",
    equipment: "Equipment",
    equipped: "Equipped",
    notEquipped: "Stored",
    traveling: "Traveling",
    skills: "Skills",
    train: "Train",
    viewTrip: "View Trip",
    customization: "Visuals",
    currentDelivery: "Current Delivery",
    noDeliveryTitle: "At the nest",
    noDeliveryDescription: "This mascot is available for the next delivery.",
    route: "Route",
    origin: "Origin",
    destination: "Destination",
    distance: "Distance",
    status: "Status",
    visualPreview: "Visual preview",
    selectedMascot: "Selected mascot",
    chooseMascot: "Choose mascot",
    bottomNav: "Main navigation",
  },
  send: {
    startAction: "Send",
    eyebrow: "Postal dispatch",
    title: "Prepare delivery",
    subtitle: "Choose a friend, a mascot, and a keepsake to start a new route.",
    chooseFriend: "Choose a friend",
    chooseMascot: "Choose a mascot",
    chooseCorrespondence: "Choose correspondence",
    summary: "Send summary",
    confirmationTitle: "Delivery started",
    confirmationDescription: "The mascot left the nest and is carrying your correspondence.",
    sendButton: "Confirm send",
    sendAnother: "Send another",
    backToMascot: "View mascot",
    estimatedDuration: "Estimated duration",
    selectedFriend: "Selected friend",
    selectedMascot: "Selected mascot",
    selectedCorrespondence: "Selected correspondence",
    readyHint: "Everything is ready to dispatch this delivery.",
    incompleteHint: "Complete the three choices to confirm the send.",
  },
  species: {
    carrierPigeon: "Carrier pigeon",
    messengerFalcon: "Messenger falcon",
    mailDuck: "Mail duck",
  },
  traits: {
    steadyRoute: {
      name: "Steady Route",
      description: "Keeps deliveries stable and improves rewards on long routes.",
    },
    directFlight: {
      name: "Direct Flight",
      description: "Reduces detours and favors quick returns after delivery.",
    },
    curiousFinder: {
      name: "Curious Finder",
      description: "Increases the chance of finding souvenirs and rare items en route.",
    },
  },
  equipment: {
    rarity: {
      common: "Common",
      uncommon: "Uncommon",
      rare: "Rare",
    },
    canvasPostalBag: {
      name: "Canvas Postal Bag",
      description: "A simple, reliable bag for important letters.",
    },
    blueRouteScarf: {
      name: "Blue Route Scarf",
      description: "Marks familiar paths with a postal touch of color.",
    },
    flightGoggles: {
      name: "Flight Goggles",
      description: "Helps face strong wind without losing direction.",
    },
    urgentBadge: {
      name: "Urgent Badge",
      description: "A red mark for deliveries that cannot wait.",
    },
    travelCap: {
      name: "Travel Cap",
      description: "Protects on short routes and adds a prepared look.",
    },
    featherCharm: {
      name: "Feather Charm",
      description: "A small charm for finding surprises along the way.",
    },
    smallSatchel: {
      name: "Small Satchel",
      description: "Fits the essentials for curious, lightweight trips.",
    },
  },
  skills: {
    longRoute: {
      name: "Long Route",
      description: "Keeps strong orientation across longer distances.",
    },
    softLanding: {
      name: "Soft Landing",
      description: "Reduces fatigue when finishing a delivery.",
    },
    quickDispatch: {
      name: "Quick Dispatch",
      description: "Leaves the nest quickly for urgent deliveries.",
    },
    crosswindInstinct: {
      name: "Crosswind Instinct",
      description: "Handles sudden route changes more confidently.",
    },
    shinyThing: {
      name: "Shiny Thing",
      description: "Notices small collectible objects during travel.",
    },
    happyDetour: {
      name: "Happy Detour",
      description: "Turns small delays into a chance for discovery.",
    },
  },
  delivery: {
    progress: "Progress",
    remainingTime: "Remaining time",
    routePreview: "Route preview",
    status: {
      available: "Available",
      preparing: "Preparing",
      outbound: "Outbound",
      delivered: "Delivered",
      returning: "Returning",
      returned: "Returned",
      completed: "Completed",
    },
  },
  rewards: {
    eyebrow: "Postal return",
    title: "Reward collection",
    readyTitle: "Return envelope",
    readyDescription: "The mascot came back with route marks and a small discovery.",
    travelingTitle: "Still traveling",
    travelingDescription: "This delivery has not returned to the nest yet. The reward appears when the mascot comes back.",
    completedTitle: "Reward collected",
    completedDescription: "The envelope was archived in the notebook and the discovery entered the local inventory.",
    collectButton: "Collect",
    backToMascot: "Back to mascot",
    xpGained: "XP gained",
    itemFound: "Item found",
    inventory: "Local inventory",
    collected: "Collected",
    rarity: "Rarity",
    items: {
      wornRouteStamp: {
        name: "Worn route stamp",
        description: "A stamp marked by the road, perfect for travel pages.",
      },
      blueAirmailLabel: {
        name: "Blue airmail label",
        description: "A folded label with blue ink and the scent of old paper.",
      },
      goldenCompassPin: {
        name: "Golden compass pin",
        description: "A rare find pointing toward stories not yet told.",
      },
    },
  },
  locations: {
    saoPaulo: "São Paulo",
    lisbon: "Lisbon",
    curitiba: "Curitiba",
    toronto: "Toronto",
  },
  friends: {
    eyebrow: "Social notebook",
    title: "Friends",
    subtitle: "See correspondence companions, visiting mascots, and small received notes.",
    profileTitle: "Friend profile",
    viewProfile: "View profile",
    sendToFriend: "Send to friend",
    quickSend: "Quick send",
    friendshipLevel: "Friendship level",
    exchangeCount: "Exchanges",
    friendMascots: "Friend mascots",
    receivedCorrespondence: "Received correspondence",
    location: "Location",
    backToFriends: "Back to friends",
    noCorrespondence: "There is no received correspondence from this friend yet.",
    mascotLabel: "Visiting mascot",
    lia: {
      note: "Likes cards with route marks and old stamps.",
    },
    caio: {
      note: "Always replies with short, neatly folded notes.",
    },
    mina: {
      note: "Collects keepsakes from long journeys.",
    },
    correspondence: {
      liaPostcard: {
        title: "Card from Lisbon hills",
        description: "A postcard with blue marks, tilted stamps, and a sea-breeze scent.",
      },
      liaSticker: {
        title: "Yellow tram sticker",
        description: "A small keepsake to place near the sunniest routes.",
      },
      caioLetter: {
        title: "Folded note from the south",
        description: "A short letter, carefully folded and marked by fine rain.",
      },
      minaGift: {
        title: "Boarding parcel",
        description: "A light parcel with a travel label crossing the ocean.",
      },
    },
  },
  correspondence: {
    letter: {
      name: "Letter",
      description: "A simple message, good for keeping friendship close.",
    },
    postcard: {
      name: "Postcard",
      description: "A small paper scene to mark the route.",
    },
    sticker: {
      name: "Sticker",
      description: "A light keepsake for decorating someone's notebook.",
    },
    smallGift: {
      name: "Small gift",
      description: "A delicate parcel for a more special delivery.",
    },
  },
  appearance: {
    nuvemPortrait: "Temporary portrait of Nuvem",
    trovaoPortrait: "Temporary portrait of Trovão",
    pipocaPortrait: "Temporary portrait of Pipoca",
    friendAuroraPortrait: "Temporary portrait of Aurora",
    friendBrisaPortrait: "Temporary portrait of Brisa",
    friendTicoPortrait: "Temporary portrait of Tico",
    friendAtlasPortrait: "Temporary portrait of Atlas",
    friendLumaPortrait: "Temporary portrait of Luma",
  },
} satisfies TranslationDictionary;
