import type { TranslationDictionary } from "../types";

export const enUS = {
  app: {
    title: "DUIF",
  },
  pwaInstall: {
    eyebrow: "Special delivery",
    title: "Bring DUIF to your home screen",
    installDescription:
      "Install the postal notebook to open it faster and play like an app.",
    iosDescription: "Tap Share, then choose “Add to Home Screen”.",
    browserDescription:
      "Open the browser menu and choose “Install app” or “Add to Home screen”.",
    unsupportedDescription:
      "This browser cannot install DUIF. Copy or open this address in Safari or Chrome to continue.",
    openInstalledDescription:
      "Installation was accepted. Close this tab and open DUIF from the icon on your home screen.",
    iosStepShare: "Tap the browser Share button.",
    iosStepAdd: "Choose “Add to Home Screen”.",
    iosStepOpen: "Open DUIF from its new icon.",
    browserStepMenu: "Open the browser menu.",
    browserStepInstall: "Choose install or add to home screen.",
    browserStepOpen: "Open DUIF from its new icon.",
    requiredNote:
      "Installation is required on mobile to ensure the complete game experience.",
    install: "Install",
  },
  common: {
    loading: "Loading",
    unavailable: "Unavailable",
  },
  notFound: {
    eyebrow: "Misrouted letter",
    title: "Route not found",
    description:
      "This page left the postal route. Go back to the nest or choose another destination from navigation.",
    backToNest: "Back to nest",
  },
  auth: {
    eyebrow: "Postal account",
    title: "Access DUIF",
    subtitle:
      "Sign in with your email and password to continue your postal adventure.",
    unavailableTitle: "Supabase is not configured",
    unavailableDescription:
      "The postal service could not be reached. Check its configuration and your connection.",
    loadingSession: "Loading session",
    signedInTitle: "Active session",
    signedInDescription: "Your session was confirmed by the postal service.",
    modeLabel: "Access mode",
    signIn: "Sign in",
    signUp: "Create account",
    signOut: "Sign out",
    email: "Email",
    password: "Password",
    newPassword: "New password",
    confirmPassword: "Confirm password",
    showPassword: "Show password",
    hidePassword: "Hide password",
    show: "Show",
    hide: "Hide",
    forgotPassword: "I forgot my password",
    recoveryDescription:
      "Enter your email. If it can be used, we will send a new access route.",
    sendRecovery: "Send instructions",
    genericEmailSent:
      "If this address can be used, we will send instructions by email.",
    verificationTitle: "Check your inbox",
    verificationDescription:
      "If this address can be used, you will receive a postal confirmation to unlock onboarding.",
    resendConfirmation: "Resend confirmation",
    resendIn: "Resend in",
    backToLogin: "Back to sign in",
    passwordRequirements: "Password requirements",
    passwordLength: "At least 8 characters",
    passwordLetter: "At least one letter",
    passwordNumber: "At least one number",
    passwordMismatch: "Passwords do not match.",
    callbackTitle: "Confirming your account",
    confirmingEmail: "Checking the confirmation stamp",
    callbackDescription: "Please wait while we validate your postal access.",
    confirmedTitle: "Account confirmed",
    confirmedDescription:
      "Your confirmation stamp is valid. Now return to the installed DUIF app to sign in.",
    returnToInstalledApp: "Open DUIF from the home screen",
    invalidLinkTitle: "This link is no longer valid",
    invalidLinkDescription:
      "Request new instructions without revealing whether an account exists.",
    resetTitle: "Create a new password",
    resetDescription:
      "Choose a strong password to protect your postal notebook.",
    resetSuccess: "Password updated. Sign in again to continue.",
    requestNewLink: "Request another link",
    updatePassword: "Update password",
    currentProfile: "Current profile",
    backToNest: "Back to nest",
    submitting: "Sending",
    errorMessage:
      "The action could not be completed. Check the details and try again.",
    registrationPending:
      "New registrations will open with the upcoming welcome flow.",
    languageLabel: "Language",
    languages: {
      ptBR: "Português",
      enUS: "English",
    },
  },
  foundation: {
    eyebrow: "Postal maintenance",
    retry: "Try again",
    loading: {
      title: "Checking the nest",
      description: "We are checking your session and postal records.",
    },
    unavailable: {
      title: "Service temporarily unavailable",
      description:
        "We could not reach the postal service. Check your connection and try again.",
    },
    accountPending: {
      title: "Account awaiting setup",
      description:
        "Your session exists but has no postal profile yet. The new onboarding will configure it safely.",
    },
    onboardingPending: {
      title: "A new onboarding is coming",
      description:
        "Old player data has been removed. Soon you will choose an archetype, name your mascot, and complete the first route.",
    },
  },
  onboarding: {
    eyebrow: "First route",
    progress: "Step {current} of {total}",
    languageLabel: "Language",
    signOut: "Sign out",
    back: "Back",
    next: "Continue",
    saving: "Saving",
    genericError:
      "This step could not be saved. Check your connection and try again.",
    welcome: {
      title: "Welcome to DUIF",
      description:
        "In DUIF, your mascot carries correspondence, explores routes, and always returns to the nest.",
    },
    travel: {
      title: "Travel continues as time passes",
      description:
        "After dispatch, the route follows its recorded schedule even while the app is closed.",
    },
    discoveries: {
      title: "Small discoveries appear along the way",
      description:
        "As route points are crossed, your mascot finds keepsakes automatically and carries them home.",
    },
    returnCollection: {
      title: "Cargo is collected after the return",
      description:
        "When the trip ends, you review the cargo and place its items in your Collection.",
    },
    displayName: {
      title: "What should we call you?",
      description:
        "Choose a public nickname for your friends to see. It does not need to be unique.",
      label: "Your nickname",
      hint: "Use 2 to 24 characters.",
      error: "Enter a valid nickname containing 2 to 24 characters.",
    },
    mascotChoice: {
      title: "Choose your first messenger",
      description:
        "Each species travels in its own way. Choose the one that fits your adventure.",
      loading: "Opening the mascot catalog…",
      unavailable:
        "The mascot catalog is unavailable right now. Please try again shortly.",
      previous: "Previous mascot",
      nextMascot: "Next mascot",
      suggestedName: "Suggested name: {name}",
      nameLabel: "Mascot name",
      nameHint:
        "Use 2 to 24 characters. This name is yours and does not change with language.",
      nameError: "Enter a valid name containing 2 to 24 characters.",
      attributes: "Attributes",
      trait: "Special trait",
      skills: "Skills",
      equipment: "Starter equipment",
      review: "Review choice",
      reviewTitle: "Your travel companion",
      reviewDescription:
        "Check the species and name. Once confirmed, this will be your first mascot.",
      confirm: "Confirm mascot",
      preparing: "Preparing the nest…",
      readyTitle: "Your mascot is ready",
      readyDescription:
        "{name} is already waiting for the first tutorial route.",
    },
    tutorialNestLabel: "Tutorial nest",
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
    back: "Back",
    backToFriends: "Back to friends",
    backToNest: "Back to nest",
    nest: "Nest",
    letters: "Mailbox",
    collection: "Collection",
    map: "Map",
    friends: "Friends",
    shop: "Shop",
    shopUnavailable: "Shop is not available yet",
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
    loadingCatalog: "Updating notebook",
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
    confirmationDescription:
      "The mascot is preparing the trip and will soon follow the route.",
    sendButton: "Confirm send",
    sendAnother: "Send another",
    backToMascot: "View mascot",
    estimatedDuration: "Estimated duration",
    preparationTime: "Preparation",
    outboundDuration: "Outbound time",
    returnDuration: "Return time",
    discoveryReach: "Discovery reach",
    rarityPotential: "Rarity potential",
    routeProfile: "Route profile",
    shortRoute: "Short route with no distance penalty",
    longRoutePenalty: "Long route with a return penalty",
    longRouteMitigated: "Long route with its penalty neutralized",
    effectFastReturn: "10% faster return",
    effectDiscoveryReach: "reach on this route",
    effectSafeLongRoute: "neutralizes this long route's penalty",
    effectSafeShortRoute: "ready to protect long routes",
    selectedFriend: "Selected friend",
    selectedMascot: "Selected mascot",
    selectedCorrespondence: "Selected correspondence",
    readyHint: "Everything is ready to dispatch this delivery.",
    incompleteHint: "Complete the three choices to confirm the send.",
    loadingData: "Updating notebook options",
    sending: "Dispatching",
    errorMessage: "The delivery could not be created. Try again.",
    composeTitle: "Compose correspondence",
    contentPreview: "Content preview",
    contentInvalid: "Review the content before dispatching.",
    characterCount: "Characters",
    selectedStickers: "Selected stickers",
    letterPlaceholder: "Write a short letter to cross the route slowly.",
    postcardPlaceholder: "Short message on the back of the postcard.",
    giftPlaceholder: "A short note for the future gift.",
    giftPendingTitle: "Gifts are still being defined",
    giftPendingDescription:
      "In this version, the gift carries only a mocked note.",
    content: {
      letterLabel: "Letter text",
      postcardLabel: "Postcard back",
      postcardVariantLabel: "Postcard type",
      stickerLabel: "Choose up to 3 stickers",
      giftLabel: "Gift note",
      emptyPreview: "The content will appear here before dispatch.",
      stickers: {
        sunStamp: "Sun stamp",
        blueEnvelope: "Blue envelope",
        routeSpark: "Route spark",
      },
      postcardVariants: {
        city: "City postcard",
        event: "Event postcard",
        photo: "Own photo placeholder",
      },
    },
  },
  map: {
    eyebrow: "Postal map",
    title: "Real-time trip",
    subtitle:
      "Follow the mascot across the route and see mocked discoveries appearing along the way.",
    tripStatus: "Trip status",
    closeTripStatus: "Close",
    selectMascot: "Select mascot",
    previousMascot: "Previous mascot",
    nextMascot: "Next mascot",
    currentLeg: "Current leg",
    discoveries: "Route discoveries",
    cargoFound: "Cargo found",
    carryingCargo: "Carrying on this trip",
    tripCompleted: "Trip completed",
    deliveryFinished: "Delivery finished",
    finishedDeliveries: "finished deliveries",
    collectFinishedDelivery: "View collection",
    cargoFoundDescription:
      "The mascot returned to the nest carrying the discoveries seen along the route.",
    completedDescription:
      "The primary reward was collected and this trip is complete.",
    routeCargo: "Carried discoveries",
    primaryReward: "Primary reward",
    visualCargo: "Route cargo",
    collectionPending: "Waiting for collection",
    rewardCollected: "Collected",
    noPrimaryReward: "This delivery has no primary reward available.",
    routeCargoPreviewNote:
      "Route discoveries are a cargo preview. Multiple-item collection will arrive in a future milestone.",
    goToCollection: "Review and collect",
    ownerCollectionOnly: "Only the mascot owner can collect this cargo.",
    openCollection: "Open Collection",
    mockedRewards: "Mocked rewards",
    persistedRewards: "Persisted discoveries",
    discovered: "Discovered",
    newDiscovery: "Newly discovered",
    carriedDiscovery: "Carried by the mascot",
    discoveryToastSingle: "New postal discovery",
    discoveryToastMultiple: "New postal discoveries",
    onTheRoute: "On the route",
    backToMascot: "Back to mascot",
    unavailable:
      "The real map could not be loaded right now. The route is still available in trip details.",
    cameraControls: "Map framing controls",
    overview: "Overview",
    focusMascot: "Mascot",
    followMascot: "Follow mascot",
    stopFollowing: "Stop following",
    focusOrigin: "Origin",
    focusDestination: "Destination",
    backToTrip: "Back to trip",
    rewardDetails: "Discovery details",
    futureReward: "Mysterious discovery",
    futureRewardState: "Still on the way",
    futureRewardHint: "Continue the trip to reveal this discovery.",
    approximateRegion: "Approximate region",
    rewardType: "Type",
    rarity: "Rarity",
    legs: {
      preparing: "Preparing",
      outbound: "Outbound",
      delivered: "At destination",
      returning: "Returning",
      returned: "Returned",
      completed: "Completed",
    },
    rewardKinds: {
      badge: "Badge",
      postcard: "Postcard",
      stamp: "Stamp",
      souvenir: "Souvenir",
      material: "Material",
      eventItem: "Event item",
    },
    rewards: {
      londrinaPostcard: {
        name: "Londrina postcard",
        description:
          "An illustrated keepsake from the start of the route in northern Paraná.",
      },
      cambeSouvenir: {
        name: "Cambé souvenir",
        description: "A small keepsake found shortly after departure.",
      },
      rolandiaBadge: {
        name: "Rolândia badge",
        description:
          "A postal emblem found between the cities along the route.",
      },
      arapongasMaterial: {
        name: "Arapongas fiber",
        description:
          "A lightweight material gathered while passing through Arapongas.",
      },
      apucaranaStamp: {
        name: "Apucarana stamp",
        description:
          "A rare stamp marked while passing through the Apucarana region.",
      },
      maringaEvent: {
        name: "Maringá invitation",
        description: "An event item found upon arrival in Maringá.",
      },
    },
  },
  postalTraffic: {
    title: "Postal traffic",
    nearbyPets: "Nearby mascots",
    empty: "No mascots are passing through the queried region right now.",
    progress: "Progress",
    travelState: "Travel state",
    owner: "Owner",
    openFriendProfile: "Open friend profile",
    privateOwner: "This mascot's owner details are private.",
    outOfRange:
      "This mascot left the queried region. Showing its last known record.",
    visibility: {
      friend: "Friend",
      public: "Public mascot",
    },
    legs: {
      preparing: "Preparing",
      outbound: "Outbound",
      delivered: "At destination",
      returning: "Returning",
      returned: "Returned",
      completed: "Completed",
    },
    regions: {
      paranaBrazil: "Paraná, Brazil",
      rioGrandeDoSulBrazil: "Rio Grande do Sul, Brazil",
      santaCatarinaBrazil: "Santa Catarina, Brazil",
      goiasBrazil: "Goiás, Brazil",
      distritoFederalBrazil: "Federal District, Brazil",
      minasGeraisBrazil: "Minas Gerais, Brazil",
      espiritoSantoBrazil: "Espírito Santo, Brazil",
      bahiaBrazil: "Bahia, Brazil",
      pernambucoBrazil: "Pernambuco, Brazil",
    },
  },
  species: {
    carrierPigeon: "Carrier pigeon",
    messengerFalcon: "Messenger falcon",
    mailDuck: "Mail duck",
  },
  archetypes: {
    suggestedNames: {
      nuvem: "Cloud",
      trovao: "Thunder",
      pipoca: "Popcorn",
    },
  },
  traits: {
    steadyRoute: {
      name: "Steady Route",
      description:
        "Keeps deliveries stable and improves rewards on long routes.",
    },
    directFlight: {
      name: "Direct Flight",
      description: "Reduces detours and favors quick returns after delivery.",
    },
    curiousFinder: {
      name: "Curious Finder",
      description:
        "Increases the chance of finding souvenirs and rare items en route.",
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
    readyDescription:
      "The mascot came back with route marks and a small discovery.",
    travelingTitle: "Still traveling",
    travelingDescription:
      "This delivery has not returned to the nest yet. The reward appears when the mascot comes back.",
    completedTitle: "Reward collected",
    completedDescription:
      "The envelope was archived in the notebook and the discovery entered the collection.",
    loading: "Checking the return envelope...",
    collectButton: "Collect",
    collectAllButton: "Collect all cargo",
    collecting: "Collecting...",
    collectError:
      "The reward could not be collected right now. Try again in a moment.",
    backToMascot: "Back to mascot",
    backToMap: "Back to map",
    xpGained: "XP gained",
    itemFound: "Item found",
    fullCargoTitle: "Complete cargo",
    primaryReward: "Primary reward",
    routeCargo: "Route discoveries",
    collectionPending: "Collection pending",
    ownerCollectionOnly: "Only the mascot owner can collect this cargo.",
    inventory: "Collection items",
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
  inventory: {
    eyebrow: "Postal collection",
    title: "Collection",
    subtitle:
      "Stamps, keepsakes, travel marks, and equipment discovered by pets on routes.",
    categoriesLabel: "Filter collection",
    collectedTotal: "Collected items",
    equippedTotal: "Equipped",
    raritySummary: "Rarities",
    emptySlotTitle: "Undiscovered space",
    emptySlotDescription: "A reserved place for a future travel keepsake.",
    source: "Source",
    category: "Type",
    categories: {
      all: "All",
      equipment: "Equipment",
      stamps: "Stamps",
      keepsakes: "Keepsakes",
      routeMarks: "Travel marks",
    },
    sources: {
      starterKit: "Starter kit",
      routeReward: "Route reward",
      longRouteFind: "Long-route find",
    },
  },
  shop: {
    eyebrow: "Postal counter",
    title: "Shop",
    subtitle:
      "Small details for personalizing mascots, notebooks, and correspondence.",
    prototypeNotice:
      "Demonstration catalog: fictional prices, with no balance or purchases.",
    categoriesLabel: "Filter catalog",
    prototypePrice: "Prototype price",
    viewDetails: "View details",
    close: "Close",
    detailsTitle: "Item details",
    mascotPreview: "Preview with Nuvem",
    mascotPreviewNote:
      "Illustrative composition; the item will not be equipped or saved.",
    emptyTitle: "Empty shelf",
    emptyDescription:
      "There are no items in this part of the postal counter yet.",
    categories: {
      all: "All",
      cosmetics: "Cosmetics",
      stickers: "Stickers",
      postcards: "Postcards",
      decorations: "Decorations",
    },
    currencies: {
      free: "Stamps",
      premium: "Crystals",
    },
    items: {
      crimsonCourierScarf: {
        name: "Crimson courier scarf",
        description: "A light scarf with postal stitching for windy days.",
      },
      meadowPostCap: {
        name: "Meadow post cap",
        description:
          "A small green cap, worn at the edges and ready for new routes.",
      },
      sunnyRouteSticker: {
        name: "Sunny route sticker",
        description:
          "An ink-drawn sun for brightening letters and notebook pages.",
      },
      blueEnvelopeSticker: {
        name: "Blue envelope sticker",
        description: "An airmail envelope carrying a delicate travel mark.",
      },
      coastalTownPostcard: {
        name: "Coastal town postcard",
        description:
          "Bright houses, a calm sea, and a postal path beside the harbor.",
      },
      lanternFestivalPostcard: {
        name: "Lantern festival postcard",
        description:
          "A paper night warmed by lanterns and small golden postmarks.",
      },
      brassNestPlaque: {
        name: "Brass nest plaque",
        description:
          "An aged little plaque for marking a mascot's favorite corner.",
      },
      airmailProfileRibbon: {
        name: "Airmail profile ribbon",
        description:
          "A blue-and-red ribbon for framing portraits in the postal notebook.",
      },
    },
  },
  locations: {
    londrina: "Londrina",
    cambe: "Cambé",
    rolandia: "Rolândia",
    arapongas: "Arapongas",
    apucarana: "Apucarana",
    maringa: "Maringá",
    beloHorizonte: "Belo Horizonte",
    salvador: "Salvador",
    rioBranco: "Rio Branco",
    saoPaulo: "São Paulo",
    lisbon: "Lisbon",
    curitiba: "Curitiba",
    toronto: "Toronto",
  },
  friends: {
    eyebrow: "Social notebook",
    title: "Friends",
    subtitle:
      "See correspondence companions, visiting mascots, and small received notes.",
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
    noCorrespondence:
      "There is no received correspondence from this friend yet.",
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
        description:
          "A postcard with blue marks, tilted stamps, and a sea-breeze scent.",
      },
      liaSticker: {
        title: "Yellow tram sticker",
        description: "A small keepsake to place near the sunniest routes.",
      },
      caioLetter: {
        title: "Folded note from the south",
        description:
          "A short letter, carefully folded and marked by fine rain.",
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
    friendMaplePortrait: "Portrait of Maple",
  },
} satisfies TranslationDictionary;
